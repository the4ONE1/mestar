// Self-healing backstop for the order → story-generation pipeline.
//
// Normally payment completion reaches us two ways: the Stripe webhook
// (stripe-webhook) and the checkout return-page fallback (confirm-checkout-payment).
// Both fire generation the moment they see a paid session. But if the webhook
// endpoint is misconfigured/unreachable AND the customer closes their browser
// before the return page's fallback call fires, nothing ever kicks off
// generation and the order sits in the database forever with a customer who
// paid and never got their PDF.
//
// This runs on a schedule (see the retry-stuck-orders cron migration) and:
//   1. Retries orders that started generating but crashed/stalled mid-pipeline.
//   2. For orders still sitting in pending_payment past a few minutes, checks
//      directly with Stripe whether they were actually paid, and if so, starts
//      generation — recovering orders the webhook never reached.
// Order-health-check still emails an alert for anything this can't recover.
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";
import { svc, triggerGenerationPipeline } from "../_shared/pipeline.ts";

const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const GENERATING_STATUSES = ["queued", "generating_story", "generating_images", "assembling_pdf"];
const STUCK_MINUTES = 5;
const PENDING_PAYMENT_MINUTES = 3;
const LOOKBACK_HOURS = 48;
const MAX_RETRIES = 3;

interface OrderRow {
  id: string;
  status: string;
  retry_count: number | null;
  error_message: string | null;
  stripe_session_id?: string | null;
}

async function isPaidOnStripe(sessionId: string): Promise<boolean> {
  for (const env of ["live", "sandbox"] as StripeEnv[]) {
    try {
      const stripe = createStripeClient(env);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") return true;
    } catch {
      // Wrong environment for this session id (or a transient error) — try the other one.
    }
  }
  return false;
}

async function retryOrder(order: OrderRow): Promise<{ id: string; outcome: string }> {
  const supabase = svc();
  const nextRetryCount = (order.retry_count || 0) + 1;

  if (nextRetryCount > MAX_RETRIES) {
    await supabase
      .from("storybook_orders")
      .update({
        status: "failed",
        retry_count: nextRetryCount,
        failure_category: "stuck_retry_exhausted",
        failure_hint: `Stuck in '${order.status}' and retried ${MAX_RETRIES} times without completing. Needs manual review.`,
        error_message: order.error_message || `Gave up after ${MAX_RETRIES} retries stuck in ${order.status}`,
      })
      .eq("id", order.id);
    return { id: order.id, outcome: "gave_up" };
  }

  await supabase.from("storybook_orders").update({ retry_count: nextRetryCount }).eq("id", order.id);

  try {
    await triggerGenerationPipeline(order.id);
    return { id: order.id, outcome: "retried" };
  } catch (e) {
    console.error(`Retry failed for order ${order.id}:`, e);
    return { id: order.id, outcome: "retry_failed" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");

  // Server-to-server only — called by pg_cron with the service role key.
  const auth = req.headers.get("Authorization") || "";
  const presented = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (!presented || !SERVICE_ROLE || presented !== SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = svc();
  const lookbackStart = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000).toISOString();
  const results: { id: string; outcome: string }[] = [];

  try {
    // 1. Orders that were confirmed paid and started generating, but crashed
    // or timed out mid-pipeline (edge function died, AI gateway hiccup, etc).
    const stuckCutoff = new Date(Date.now() - STUCK_MINUTES * 60 * 1000).toISOString();
    const { data: stuckOrders, error: stuckErr } = await supabase
      .from("storybook_orders")
      .select("id, status, retry_count, error_message")
      .in("status", GENERATING_STATUSES)
      .lt("created_at", stuckCutoff)
      .gte("created_at", lookbackStart);
    if (stuckErr) throw stuckErr;

    for (const order of (stuckOrders || []) as OrderRow[]) {
      results.push(await retryOrder(order));
    }

    // 2. Orders still waiting on payment confirmation. If the Stripe webhook
    // never reached us (bad URL, dropped delivery, etc.) these would otherwise
    // sit here forever even though the customer paid. Verify with Stripe
    // directly before spending anything on generation.
    const pendingCutoff = new Date(Date.now() - PENDING_PAYMENT_MINUTES * 60 * 1000).toISOString();
    const { data: pendingOrders, error: pendingErr } = await supabase
      .from("storybook_orders")
      .select("id, status, retry_count, error_message, stripe_session_id")
      .eq("status", "pending_payment")
      .not("stripe_session_id", "is", null)
      .lt("created_at", pendingCutoff)
      .gte("created_at", lookbackStart);
    if (pendingErr) throw pendingErr;

    for (const order of (pendingOrders || []) as OrderRow[]) {
      if (!order.stripe_session_id) continue;
      const paid = await isPaidOnStripe(order.stripe_session_id);
      if (!paid) continue;
      results.push(await retryOrder(order));
    }

    const checked = (stuckOrders?.length || 0) + (pendingOrders?.length || 0);
    console.log(`retry-stuck-orders: checked ${checked}, acted on ${results.length}`, results);

    return new Response(JSON.stringify({ ok: true, checked, results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("retry-stuck-orders error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
