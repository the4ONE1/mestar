// Customer-return fallback for Stripe payments.
// After Embedded Checkout redirects back with session_id, this verifies the
// Checkout Session directly with Stripe and starts generation if paid.
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AUDIOBOOK_PRICE_IDS = new Set([
  "audiobook_basic_onetime",
  "audiobook_karaoke_onetime",
]);

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function paymentIntentId(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && "id" in value && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const body = await req.json().catch(() => ({}));
    const orderId = String(body?.orderId || "");
    const sessionId = String(body?.sessionId || "");
    const env = String(body?.environment || "") as StripeEnv;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId)) {
      return json({ error: "Invalid orderId" }, 400);
    }
    if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
      return json({ error: "Invalid sessionId" }, 400);
    }
    if (env !== "sandbox" && env !== "live") {
      return json({ error: "Invalid environment" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const stripe = createStripeClient(env);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.mestar_order_id !== orderId) {
      await supabase.from("payment_events").insert({
        order_id: orderId,
        stripe_session_id: sessionId,
        event_type: "checkout.return_confirm",
        result: "skipped",
        message: "session_order_mismatch",
        payload_summary: { env },
      });
      return json({ error: "Session does not match this order" }, 403);
    }

    if (session.payment_status !== "paid") {
      await supabase.from("payment_events").insert({
        order_id: orderId,
        stripe_session_id: sessionId,
        stripe_payment_intent_id: paymentIntentId(session.payment_intent),
        event_type: "checkout.return_confirm",
        result: "skipped",
        message: `payment_status:${session.payment_status}`,
        payload_summary: { env, sessionStatus: session.status },
      });
      return json({ ok: true, paid: false, status: session.payment_status });
    }

    const { data: order, error: fetchErr } = await supabase
      .from("storybook_orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (fetchErr || !order) {
      return json({ error: "Order not found" }, 404);
    }

    if (order.status !== "pending_payment") {
      await supabase.from("payment_events").insert({
        order_id: orderId,
        stripe_session_id: session.id,
        stripe_payment_intent_id: paymentIntentId(session.payment_intent),
        event_type: "checkout.return_confirm",
        result: "skipped",
        message: `already_processed:${order.status}`,
        payload_summary: { env },
      });
      return json({ ok: true, paid: true, status: order.status });
    }

    const priceIds = String(session.metadata?.price_ids || "").split(",").filter(Boolean);
    const selectedAddons = {
      ...((order.selected_addons as Record<string, boolean>) || {}),
      audiobook: Boolean(
        ((order.selected_addons as Record<string, boolean>) || {}).audiobook ||
          priceIds.some((p) => AUDIOBOOK_PRICE_IDS.has(p)),
      ),
      coloring_pages: Boolean(
        ((order.selected_addons as Record<string, boolean>) || {}).coloring_pages ||
          priceIds.includes("coloring_pages_addon_onetime"),
      ),
    };
    const customerEmail = session.customer_details?.email || session.customer_email || order.customer_email || "";
    const intentId = paymentIntentId(session.payment_intent);

    await supabase
      .from("storybook_orders")
      .update({
        status: "queued",
        stripe_session_id: session.id,
        stripe_payment_intent_id: intentId,
        customer_email: customerEmail,
        selected_addons: selectedAddons,
      })
      .eq("id", orderId);

    await supabase.from("payment_events").insert({
      order_id: orderId,
      stripe_session_id: session.id,
      stripe_payment_intent_id: intentId,
      event_type: "checkout.return_confirm",
      result: "queued",
      message: "paid session verified by Stripe API, generation pipeline started",
      payload_summary: { env, priceIds },
    });

    (async () => {
      try {
        const storyRes = await fetch(`${supabaseUrl}/functions/v1/generate-story`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
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
        if (!storyRes.ok) throw new Error(`generate-story failed: ${await storyRes.text()}`);
        const story = await storyRes.json();

        await supabase
          .from("storybook_orders")
          .update({ status: "generating_images", story_title: story.title, story_text: story.story })
          .eq("id", orderId);

        const pdfRes = await fetch(`${supabaseUrl}/functions/v1/create-storybook`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
          body: JSON.stringify({
            orderId,
            title: story.title,
            story: story.story,
            childName: order.child_name,
            childAge: order.child_age,
            theme: order.theme,
            strength: order.strength || "",
            customerEmail,
            hasSupportingCharacter: !!order.has_supporting_character,
            supportingCharacterName: order.supporting_character_name || "",
            selectedAddons,
            coloringPrompts: story.coloringPrompts || [],
            illustrationPrompts:
              (story.illustrationPrompts && story.illustrationPrompts.length
                ? story.illustrationPrompts
                : story.scenes) || [],
          }),
        });
        if (!pdfRes.ok) throw new Error(`create-storybook failed: ${await pdfRes.text()}`);

        await supabase.from("payment_events").insert({
          order_id: orderId,
          stripe_session_id: session.id,
          stripe_payment_intent_id: intentId,
          event_type: "checkout.return_confirm",
          result: "pipeline_complete",
          message: story.title || "PDF generated",
          payload_summary: { env },
        });
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : String(e);
        await supabase.from("storybook_orders").update({ status: "failed", error_message: errMsg }).eq("id", orderId);
        await supabase.from("payment_events").insert({
          order_id: orderId,
          stripe_session_id: session.id,
          stripe_payment_intent_id: intentId,
          event_type: "checkout.return_confirm",
          result: "pipeline_failed",
          message: errMsg,
          payload_summary: { env },
        });
      }
    })();

    return json({ ok: true, paid: true, status: "queued" });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("confirm-checkout-payment error:", message);
    return json({ error: message }, 500);
  }
});