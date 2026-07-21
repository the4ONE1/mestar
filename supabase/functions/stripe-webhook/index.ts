// Stripe webhook — verifies signature, records payment_events, and on
// checkout.session.completed / payment_intent.succeeded fires the storybook
// generation pipeline (generate-story → create-storybook, which also fires
// generate-audiobook when that add-on is selected).
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient, verifyWebhook } from "../_shared/stripe.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function svc() {
  return createClient(SUPABASE_URL, SERVICE_ROLE);
}

async function logEvent(orderId: string | null, sessionId: string | null, type: string, result: string, payload: unknown) {
  try {
    await svc().from("payment_events").insert({
      order_id: orderId,
      stripe_session_id: sessionId,
      event_type: type,
      processing_result: result,
      payload: payload as any,
    });
  } catch (e) {
    console.error("payment_events insert failed", e);
  }
}

async function fireGeneration(orderId: string) {
  const supabase = svc();
  const { data: order, error } = await supabase
    .from("storybook_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !order) throw new Error(`Order ${orderId} not found`);

  // Idempotency — don't regenerate if already done or actively generating
  const doneStatuses = ["complete", "generating_story", "generating_images"];
  if (order.status && doneStatuses.includes(order.status)) {
    console.log(`Order ${orderId} already ${order.status} — skipping`);
    return;
  }

  const selectedAddons = order.selected_addons || {};
  await supabase.from("storybook_orders").update({ status: "generating_story", paid_at: new Date().toISOString() }).eq("id", orderId);

  const storyRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
    body: JSON.stringify({
      childName: order.child_name,
      childAge: order.child_age,
      childGender: (order as any).child_gender || "neutral",
      theme: order.theme,
      strength: order.strength,
      hasSupportingCharacter: order.has_supporting_character,
      supportingCharacterName: order.supporting_character_name,
      selectedAddons,
    }),
  });
  if (!storyRes.ok) {
    const t = await storyRes.text();
    await supabase.from("storybook_orders").update({ status: "failed", error_message: `generate-story: ${t}` }).eq("id", orderId);
    throw new Error(`generate-story ${storyRes.status}`);
  }
  const story = await storyRes.json();
  await supabase.from("storybook_orders").update({
    status: "generating_images", story_title: story.title, story_text: story.story,
  }).eq("id", orderId);

  const pdfRes = await fetch(`${SUPABASE_URL}/functions/v1/create-storybook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
    body: JSON.stringify({
      orderId,
      title: story.title,
      story: story.story,
      coloringPrompts: story.coloringPrompts || [],
      bonusColoringPrompts: story.bonusColoringPrompts || [],
      illustrationPrompts: (story.illustrationPrompts?.length ? story.illustrationPrompts : story.scenes) || [],
      selectedAddons,
      customerEmail: order.customer_email,
      childName: order.child_name,
      childAge: order.child_age,
      theme: order.theme,
      strength: order.strength,
      hasSupportingCharacter: order.has_supporting_character,
      supportingCharacterName: order.supporting_character_name,
    }),
  });
  if (!pdfRes.ok) {
    const t = await pdfRes.text();
    await supabase.from("storybook_orders").update({ status: "failed", error_message: `create-storybook: ${t}` }).eq("id", orderId);
    throw new Error(`create-storybook ${pdfRes.status}`);
  }
}

async function handlePaid(sessionOrIntent: any, env: StripeEnv, kind: "session" | "intent") {
  // Resolve orderId
  let orderId: string | null = sessionOrIntent?.metadata?.orderId || null;
  let sessionId: string | null = kind === "session" ? sessionOrIntent.id : null;
  let checkoutEmail: string | null = kind === "session"
    ? (sessionOrIntent.customer_details?.email || sessionOrIntent.customer_email || null)
    : null;

  if (!orderId && kind === "intent") {
    // Look up session by payment_intent
    const stripe = createStripeClient(env);
    const list = await stripe.checkout.sessions.list({ payment_intent: sessionOrIntent.id, limit: 1 });
    const s = list.data[0];
    if (s) {
      orderId = (s.metadata as any)?.orderId || null;
      sessionId = s.id;
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

  await fireGeneration(orderId);
  return { orderId, sessionId, result: "generation_started" };
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
    await logEvent(null, null, "signature_error", "failed", { error: (e as Error).message });
    return new Response("bad signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object;
        if (s.payment_status === "paid" || event.type === "checkout.session.async_payment_succeeded") {
          const r = await handlePaid(s, env, "session");
          await logEvent(r.orderId, r.sessionId, event.type, r.result, { id: s.id });
        } else {
          await logEvent(s.metadata?.orderId || null, s.id, event.type, "not_paid_yet", { status: s.payment_status });
        }
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const r = await handlePaid(pi, env, "intent");
        await logEvent(r.orderId, r.sessionId, event.type, r.result, { id: pi.id });
        break;
      }
      default:
        await logEvent(event.data.object?.metadata?.orderId || null, event.data.object?.id || null, event.type, "ignored", null);
    }
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    console.error("handler error", e);
    await logEvent(null, null, event.type, "error", { error: (e as Error).message });
    // Return 200 so Stripe doesn't retry endlessly on permanent errors; we log for admin review.
    return new Response(JSON.stringify({ received: true, error: (e as Error).message }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
});
