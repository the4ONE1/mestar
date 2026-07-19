// Sends an abandoned-checkout recovery email to the customer with a
// tokenized link back to /checkout so they can finish paying.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const SITE_URL = "https://mestar.pro";

// Reverse map from selected_addons -> Stripe price lookup keys.
// Keep in sync with src/lib/stripe.ts STRIPE_PRICE_IDS.
function buildPriceIds(order: any): string[] {
  const ids: string[] = ["personalized_storybook_onetime"];
  const a = order.selected_addons || {};
  if (order.has_supporting_character) ids.push("supporting_character_addon_onetime");
  if (a.coloring || a.coloring_pages) ids.push("coloring_pages_addon_onetime");
  if (a.audiobook) ids.push("audiobook_basic_onetime");
  return Array.from(new Set(ids));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Server-only: require the service role bearer token. This function is
  // called by trusted server callers (stripe-webhook) and must not be
  // invokable directly from the browser — it can reset order state and
  // trigger emails.
  const authHeader = req.headers.get("Authorization") || "";
  const provided = authHeader.replace(/^Bearer\s+/i, "").trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!provided || !serviceKey || provided !== serviceKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { orderId } = (await req.json()) as { orderId?: string };
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
      return new Response(JSON.stringify({ error: "invalid orderId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: order, error } = await supabase
      .from("storybook_orders")
      .select("id, customer_email, child_name, has_supporting_character, selected_addons, recovery_token, status")
      .eq("id", orderId)
      .maybeSingle();

    if (error || !order) {
      return new Response(JSON.stringify({ error: "order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!order.customer_email) {
      return new Response(JSON.stringify({ ok: true, skipped: "no_email" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Reset order back to pending_payment so the resume link can create a fresh
    // Stripe session against it (create-checkout only accepts pending orders).
    if (order.status !== "pending_payment") {
      await supabase
        .from("storybook_orders")
        .update({ status: "pending_payment", error_message: null })
        .eq("id", orderId);
    }

    const priceIds = buildPriceIds(order);
    const params = new URLSearchParams({
      order_id: order.id as string,
      prices: priceIds.join(","),
      email: order.customer_email as string,
      recover: order.recovery_token as string,
    });
    const resumeUrl = `${SITE_URL}/checkout?${params.toString()}`;

    await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "checkout-recovery",
        recipientEmail: order.customer_email,
        idempotencyKey: `checkout-recovery-${orderId}`,
        templateData: {
          childName: order.child_name,
          resumeUrl,
        },
      },
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("send-checkout-recovery error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
