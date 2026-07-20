// Receives Shopify orders/paid webhook, verifies HMAC, then triggers
// the existing create-storybook pipeline using the pending order row
// that CartDrawer created before sending the customer to checkout.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-topic, x-shopify-shop-domain",
};

const AUDIOBOOK_SHOPIFY_VARIANT_ID = "46302514806981";

async function verifyShopifyHmac(rawBody: string, hmacHeader: string, secret: string): Promise<boolean> {
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(rawBody),
    );
    // Convert signature to base64
    const bytes = new Uint8Array(signature);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    const computed = btoa(binary);
    return computed === hmacHeader;
  } catch (e) {
    console.error("HMAC verify failed:", e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SHOPIFY_WEBHOOK_SECRET = Deno.env.get("SHOPIFY_WEBHOOK_SECRET");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!SHOPIFY_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required env vars");
    return new Response("Server misconfigured", { status: 500, headers: corsHeaders });
  }

  // Read raw body for HMAC verification
  const rawBody = await req.text();
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256") || "";

  const valid = await verifyShopifyHmac(rawBody, hmacHeader, SHOPIFY_WEBHOOK_SECRET);
  if (!valid) {
    console.warn("Invalid HMAC — rejecting webhook");
    return new Response("Invalid HMAC", { status: 401, headers: corsHeaders });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const shopifyOrderId = String(payload.id || payload.order_id || "");
  const customerEmail = payload.email || payload.contact_email || payload.customer?.email || null;
  const hasPaidAudiobookLine = (payload.line_items || []).some((item: any) => {
    const variantId = String(item.variant_id || item.variant?.id || item.admin_graphql_api_id || "");
    return variantId === AUDIOBOOK_SHOPIFY_VARIANT_ID || variantId.endsWith(`/${AUDIOBOOK_SHOPIFY_VARIANT_ID}`);
  });

  // Find our internal order id from Shopify cart attributes (note_attributes on order)
  const noteAttrs: Array<{ name: string; value: string }> = payload.note_attributes || [];
  const orderIdAttr = noteAttrs.find((a) => a.name === "mestar_order_id");
  const internalOrderId = orderIdAttr?.value || null;

  console.log("Webhook received:", { shopifyOrderId, customerEmail, internalOrderId });

  if (!internalOrderId) {
    console.warn("No mestar_order_id attribute found on Shopify order — skipping. Shopify order:", shopifyOrderId);
    // Still 200 so Shopify doesn't retry forever.
    return new Response(JSON.stringify({ ok: true, skipped: "no_internal_order_id" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Fetch the pending order row created by CartDrawer
  const { data: order, error: fetchError } = await supabase
    .from("storybook_orders")
    .select("*")
    .eq("id", internalOrderId)
    .maybeSingle();

  if (fetchError || !order) {
    console.error("Pending order not found:", internalOrderId, fetchError);
    return new Response(JSON.stringify({ ok: true, skipped: "order_not_found" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Idempotency: if already paid/processed, do nothing
  if (order.shopify_order_id && order.status !== "pending_payment") {
    console.log("Order already processed:", internalOrderId, "status:", order.status);
    return new Response(JSON.stringify({ ok: true, skipped: "already_processed" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const selectedAddons = {
    ...((order.selected_addons as Record<string, boolean>) || {}),
    audiobook: Boolean(((order.selected_addons as Record<string, boolean>) || {}).audiobook || hasPaidAudiobookLine),
  };

  // Mark as paid + record Shopify order id + update email if Shopify has a better one
  await supabase
    .from("storybook_orders")
    .update({
      shopify_order_id: shopifyOrderId,
      status: "queued",
      customer_email: customerEmail || order.customer_email,
      selected_addons: selectedAddons,
    })
    .eq("id", internalOrderId);

  // Fire the create-storybook pipeline (pass orderId so it reuses this row)
  // We do NOT await — return 200 to Shopify fast, run pipeline in background.
  const pipelinePayload = {
    orderId: internalOrderId,
    title: "", // create-storybook will generate
    story: "", // we still need to generate the story first
    childName: order.child_name,
    childAge: order.child_age,
    theme: order.theme,
    strength: order.strength || "",
    customerEmail: customerEmail || order.customer_email || "",
    hasSupportingCharacter: !!order.has_supporting_character,
    supportingCharacterName: order.supporting_character_name || "",
    selectedAddons,
  };

  // Background task: generate story → create storybook
  (async () => {
    try {
      // Step 1: generate-story
      const storyRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          childName: order.child_name,
          childAge: order.child_age,
          theme: order.theme,
          strength: order.strength || "",
          hasSupportingCharacter: !!order.has_supporting_character,
          supportingCharacterName: order.supporting_character_name || "",
          selectedAddons,
        }),
      });

      if (!storyRes.ok) {
        const errText = await storyRes.text();
        throw new Error(`generate-story failed: ${errText}`);
      }
      const story = await storyRes.json();

      await supabase
        .from("storybook_orders")
        .update({ status: "generating_images", story_title: story.title, story_text: story.story })
        .eq("id", internalOrderId);

      // Step 2: create-storybook
      const pdfRes = await fetch(`${SUPABASE_URL}/functions/v1/create-storybook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          ...pipelinePayload,
          title: story.title,
          story: story.story,
          coloringPrompts: story.coloringPrompts || [],
      bonusColoringPrompts: story.bonusColoringPrompts || [],
          illustrationPrompts:
            (story.illustrationPrompts && story.illustrationPrompts.length
              ? story.illustrationPrompts
              : story.scenes) || [],
        }),
      });

      if (!pdfRes.ok) {
        const errText = await pdfRes.text();
        throw new Error(`create-storybook failed: ${errText}`);
      }

      const pdfData = await pdfRes.json();
      console.log("Pipeline complete for order", internalOrderId, pdfData.pdfUrl);
    } catch (e) {
      console.error("Background pipeline failed for", internalOrderId, e);
      await supabase
        .from("storybook_orders")
        .update({
          status: "failed",
          error_message: e instanceof Error ? e.message : String(e),
        })
        .eq("id", internalOrderId);
    }
  })();

  return new Response(JSON.stringify({ ok: true, orderId: internalOrderId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
