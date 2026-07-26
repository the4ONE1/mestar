// Called from the /checkout return page as a safety net if the Stripe webhook
// is delayed. Verifies with Stripe that the session is paid, then triggers
// generation via the same webhook handler idempotency check.
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { triggerGenerationPipeline } from "../_shared/pipeline.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { sessionId, orderId, environment } = await req.json();
    if (!sessionId || !orderId) throw new Error("sessionId and orderId required");
    if (environment !== "sandbox" && environment !== "live") throw new Error("invalid environment");

    const stripe = createStripeClient(environment as StripeEnv);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ ok: false, status: session.payment_status }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // SECURITY: bind the paid Stripe session to the specific order it was created for.
    // Without this, a valid paid sessionId could be replayed against any orderId to trigger
    // free generation. Trust only Stripe's own session metadata (set at checkout creation).
    const sessionOrderId = (session.metadata as Record<string, string> | null)?.orderId;
    if (!sessionOrderId || sessionOrderId !== orderId) {
      console.warn("confirm-checkout-payment: order/session mismatch", { sessionId, orderId, sessionOrderId });
      return new Response(JSON.stringify({ error: "Session does not match order" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const checkoutEmail = session.customer_details?.email || session.customer_email || null;
    if (checkoutEmail) {
      await supabase
        .from("storybook_orders")
        .update({ customer_email: String(checkoutEmail).toLowerCase() })
        .eq("id", orderId)
        .is("customer_email", null);
    }
    const { data: order } = await supabase.from("storybook_orders").select("status").eq("id", orderId).maybeSingle();
    if (order && (order as any).status === "complete") {
      return new Response(JSON.stringify({ ok: true, alreadyProcessing: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fire the webhook internally to reuse generation logic
    await supabase.from("payment_events").insert({
      order_id: orderId,
      stripe_session_id: sessionId,
      stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
      event_type: "return_page_fallback",
      result: "queued",
      message: "checkout return page confirmed paid session",
      payload_summary: { sessionId },
    });

    // Fire-and-forget: don't block the browser return page on the full pipeline.
    // If a previous attempt timed out in generating_* status, this retries the
    // paid order instead of leaving the customer stuck without a PDF.
    // @ts-ignore EdgeRuntime is available in the Supabase edge runtime
    EdgeRuntime.waitUntil(triggerGenerationPipeline(orderId).catch((e) => console.error("triggerGenerationPipeline failed:", e)));

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("confirm-checkout-payment error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
