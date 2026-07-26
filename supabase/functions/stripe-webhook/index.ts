// Stripe webhook — verifies signature, records payment_events, and on
// checkout.session.completed / payment_intent.succeeded fires the storybook
// generation pipeline (generate-story → create-storybook, which also fires
// generate-audiobook when that add-on is selected).
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";
import { svc, triggerGenerationPipeline } from "../_shared/pipeline.ts";

async function logEvent(
  orderId: string | null,
  sessionId: string | null,
  type: string,
  result: string,
  payload: unknown,
  paymentIntentId: string | null = null,
) {
  try {
    await svc().from("payment_events").insert({
      order_id: orderId,
      stripe_session_id: sessionId,
      stripe_payment_intent_id: paymentIntentId,
      event_type: type,
      result,
      message: typeof payload === "string" ? payload : null,
      payload_summary: payload && typeof payload === "object" ? payload as any : {},
    });
  } catch (e) {
    console.error("payment_events insert failed", e);
  }
}

async function handlePaid(sessionOrIntent: any, env: StripeEnv, kind: "session" | "intent") {
  // Resolve orderId
  let orderId: string | null = sessionOrIntent?.metadata?.orderId || null;
  let sessionId: string | null = kind === "session" ? sessionOrIntent.id : null;
  let checkoutEmail: string | null = kind === "session"
    ? (sessionOrIntent.customer_details?.email || sessionOrIntent.customer_email || null)
    : null;
  let paymentIntentId: string | null = kind === "intent"
    ? sessionOrIntent.id
    : (typeof sessionOrIntent?.payment_intent === "string" ? sessionOrIntent.payment_intent : null);

  if (!orderId && kind === "intent") {
    // Look up session by payment_intent
    const stripe = createStripeClient(env);
    const list = await stripe.checkout.sessions.list({ payment_intent: sessionOrIntent.id, limit: 1 });
    const s = list.data[0];
    if (s) {
      orderId = (s.metadata as any)?.orderId || null;
      sessionId = s.id;
      paymentIntentId = sessionOrIntent.id;
      checkoutEmail = s.customer_details?.email || s.customer_email || null;
    }
  }
  if (!orderId && sessionId) {
    const { data } = await svc().from("storybook_orders").select("id").eq("stripe_session_id", sessionId).maybeSingle();
    orderId = (data as any)?.id || null;
  }
  if (!orderId) {
    console.warn("No orderId resolved for event");
    return { orderId: null, sessionId, result: "no_order" };
  }

  if (checkoutEmail) {
    await svc()
      .from("storybook_orders")
      .update({ customer_email: String(checkoutEmail).toLowerCase() })
      .eq("id", orderId)
      .is("customer_email", null);
  }

  await svc()
    .from("storybook_orders")
    .update({
      ...(sessionId && { stripe_session_id: sessionId }),
      ...(paymentIntentId && { stripe_payment_intent_id: paymentIntentId }),
    })
    .eq("id", orderId);

  // Run generation in the background so the webhook returns 200 to Stripe
  // within its ~10s timeout. triggerGenerationPipeline writes status='failed' on error.
  // @ts-ignore EdgeRuntime is available in the Supabase edge runtime
  EdgeRuntime.waitUntil(triggerGenerationPipeline(orderId).catch((e) => console.error("triggerGenerationPipeline failed:", e)));
  return { orderId, sessionId, paymentIntentId, result: "pipeline_started" };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), { status: 200 });
  }
  const env: StripeEnv = rawEnv;

  let event: { type: string; data: { object: any } };
  try {
    event = await verifyWebhook(req, env);
  } catch (e) {
    console.error("verify failed", e);
    await logEvent(null, null, "webhook.signature_failed", "signature_invalid", { env, error: (e as Error).message });
    return new Response("bad signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object;
        if (s.payment_status === "paid" || event.type === "checkout.session.async_payment_succeeded") {
          const r = await handlePaid(s, env, "session");
          await logEvent(r.orderId, r.sessionId, event.type, r.result, { id: s.id, env }, r.paymentIntentId);
        } else {
          await logEvent(s.metadata?.orderId || null, s.id, event.type, "not_paid_yet", { status: s.payment_status, env });
        }
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const r = await handlePaid(pi, env, "intent");
        await logEvent(r.orderId, r.sessionId, event.type, r.result, { id: pi.id, env }, r.paymentIntentId);
        break;
      }
      default:
        await logEvent(event.data.object?.metadata?.orderId || null, event.data.object?.id || null, event.type, "ignored", { env });
    }
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("handler error", e);
    await logEvent(null, null, event.type, "error", { error: (e as Error).message });
    // Return 200 so Stripe doesn't retry endlessly on permanent errors; we log for admin review.
    return new Response(JSON.stringify({ received: true, error: (e as Error).message }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
});
