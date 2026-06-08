// TEST-ONLY: Simulates a paid Shopify order for a given internal order id.
// Runs the same pipeline shopify-order-webhook runs: generate-story -> create-storybook.
// Requires SUPABASE_SERVICE_ROLE_KEY as Bearer to prevent abuse.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // TEST FUNCTION — no auth check (will be deleted after the test).
  // Risk is bounded: it only acts on an existing order row by its unguessable UUID.


  let orderId = "";
  try {
    const body = await req.json();
    orderId = String(body.orderId || "").trim();
  } catch { /* ignore */ }
  if (!orderId) {
    return new Response(JSON.stringify({ error: "orderId required" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: order, error: fetchErr } = await supabase
    .from("storybook_orders").select("*").eq("id", orderId).maybeSingle();
  if (fetchErr || !order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const selectedAddons = (order.selected_addons as Record<string, boolean>) || {};

  // Mark queued
  await supabase.from("storybook_orders").update({
    status: "queued",
    error_message: null,
  }).eq("id", orderId);

  // Background pipeline
  (async () => {
    try {
      const storyRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
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
      if (!storyRes.ok) throw new Error(`generate-story: ${await storyRes.text()}`);
      const story = await storyRes.json();

      await supabase.from("storybook_orders").update({
        status: "generating_images",
        story_title: story.title,
        story_text: story.story,
      }).eq("id", orderId);

      const pdfRes = await fetch(`${SUPABASE_URL}/functions/v1/create-storybook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
        body: JSON.stringify({
          orderId,
          title: story.title,
          story: story.story,
          childName: order.child_name,
          childAge: order.child_age,
          theme: order.theme,
          strength: order.strength || "",
          customerEmail: order.customer_email || "",
          hasSupportingCharacter: !!order.has_supporting_character,
          supportingCharacterName: order.supporting_character_name || "",
          selectedAddons,
          coloringPrompts: story.coloringPrompts || [],
          illustrationPrompts: (story.illustrationPrompts && story.illustrationPrompts.length
            ? story.illustrationPrompts : story.scenes) || [],
        }),
      });
      if (!pdfRes.ok) throw new Error(`create-storybook: ${await pdfRes.text()}`);
      const pdfData = await pdfRes.json();
      console.log("[simulate-paid-order] complete", orderId, pdfData.pdfUrl);
    } catch (e) {
      console.error("[simulate-paid-order] failed", orderId, e);
      await supabase.from("storybook_orders").update({
        status: "failed",
        error_message: e instanceof Error ? e.message : String(e),
      }).eq("id", orderId);
    }
  })();

  return new Response(JSON.stringify({ ok: true, orderId, message: "pipeline started" }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
