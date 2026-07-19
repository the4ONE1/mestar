// Receives Stripe checkout.session.completed webhook, marks the MESTAR order as
// paid, and fires the story-generation pipeline (mirrors shopify-order-webhook).
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, verifyWebhook } from "../_shared/stripe.ts";

const AUDIOBOOK_PRICE_IDS = new Set([
  "audiobook_basic_onetime",
  "audiobook_karaoke_onetime",
]);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const rawEnv = new URL(req.url).searchParams.get("env");
  if (rawEnv !== "sandbox" && rawEnv !== "live") {
    return new Response(JSON.stringify({ received: true, ignored: "invalid env" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
  const env: StripeEnv = rawEnv;

  let event;
  try {
    event = await verifyWebhook(req, env);
  } catch (e) {
    console.error("Webhook verification failed:", e);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // Helper: record a payment_events row (best-effort; never throws)
  const logEvent = async (params: {
    orderId?: string | null;
    sessionId?: string | null;
    paymentIntentId?: string | null;
    result: string;
    message?: string | null;
    summary?: Record<string, unknown>;
  }) => {
    try {
      await supabase.from("payment_events").insert({
        order_id: params.orderId || null,
        stripe_session_id: params.sessionId || null,
        stripe_payment_intent_id: params.paymentIntentId || null,
        event_type: event.type,
        result: params.result,
        message: params.message || null,
        payload_summary: { env, ...(params.summary || {}) },
      });
    } catch (e) {
      console.error("payment_events insert failed:", e);
    }
  };


  // Handle failures / expirations up front — no fulfillment pipeline needed.
  if (
    event.type === "checkout.session.expired" ||
    event.type === "checkout.session.async_payment_failed" ||
    event.type === "payment_intent.payment_failed"
  ) {
    const obj: any = event.data.object;
    const orderId: string | undefined =
      obj.metadata?.mestar_order_id ||
      obj.session?.metadata?.mestar_order_id;
    if (!orderId) {
      await logEvent({ result: "ignored", message: "no_order_id" });
      return new Response(JSON.stringify({ ok: true, ignored: "no_order_id" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: existing } = await supabase
      .from("storybook_orders")
      .select("id, status, customer_email, recovery_token, selected_addons, child_name")
      .eq("id", orderId)
      .maybeSingle();
    if (!existing || existing.status !== "pending_payment") {
      await logEvent({ orderId, result: "skipped", message: "not_pending" });
      return new Response(JSON.stringify({ ok: true, ignored: "not_pending" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }


    const newStatus = event.type === "checkout.session.expired" ? "expired" : "payment_failed";
    const errorMessage =
      event.type === "payment_intent.payment_failed"
        ? obj.last_payment_error?.message || "Payment failed"
        : event.type === "checkout.session.async_payment_failed"
        ? "Async payment failed"
        : "Checkout expired";

    await supabase
      .from("storybook_orders")
      .update({ status: newStatus, error_message: errorMessage })
      .eq("id", orderId);

    // For expirations, fire a customer-friendly recovery email
    if (newStatus === "expired" && existing.customer_email) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-checkout-recovery`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ orderId }),
        });
      } catch (e) {
        console.error("recovery email dispatch failed:", e);
      }
    }
    await logEvent({ orderId, result: newStatus, message: errorMessage, sessionId: obj.id || null, paymentIntentId: obj.payment_intent || null });
    return new Response(JSON.stringify({ ok: true, status: newStatus }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }


  // Handle refunds — revoke PDF/audiobook access.
  if (event.type === "charge.refunded" || event.type === "charge.refund.updated") {
    const charge: any = event.data.object;
    const paymentIntentId: string | undefined =
      charge.payment_intent || charge.charge?.payment_intent;
    if (!paymentIntentId) {
      await logEvent({ result: "ignored", message: "no_payment_intent" });
      return new Response(JSON.stringify({ ok: true, ignored: "no_payment_intent" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { data: refundedOrder } = await supabase
      .from("storybook_orders")
      .select("id, status, refunded_at")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();
    if (refundedOrder && !refundedOrder.refunded_at) {
      await supabase
        .from("storybook_orders")
        .update({
          status: "refunded",
          refunded_at: new Date().toISOString(),
          refund_reason: charge.refunds?.data?.[0]?.reason || "refunded_via_stripe",
          access_expires_at: new Date().toISOString(), // expire immediately
        })
        .eq("id", refundedOrder.id);
      console.log("Refund processed, access revoked for order", refundedOrder.id);
      await logEvent({ orderId: refundedOrder.id, paymentIntentId, result: "refunded", message: "access_revoked" });
    } else {
      await logEvent({ orderId: refundedOrder?.id || null, paymentIntentId, result: "skipped", message: refundedOrder ? "already_refunded" : "order_not_found" });
    }
    return new Response(JSON.stringify({ ok: true, refunded: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Only fulfill on successful (sync or async) checkouts
  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    await logEvent({ result: "ignored", message: `unhandled event: ${event.type}` });
    return new Response(JSON.stringify({ received: true, ignored: event.type }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }



  const session = event.data.object;
  const orderId: string | undefined = session.metadata?.mestar_order_id;
  const priceIds: string[] = (session.metadata?.price_ids || "").split(",").filter(Boolean);
  const customerEmail = session.customer_details?.email || session.customer_email || null;

  if (!orderId) {
    console.warn("stripe-webhook: session has no mestar_order_id metadata:", session.id);
    return new Response(JSON.stringify({ ok: true, skipped: "no_order_id" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }


  const { data: order, error: fetchErr } = await supabase
    .from("storybook_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchErr || !order) {
    console.error("Order not found:", orderId, fetchErr);
    return new Response(JSON.stringify({ ok: true, skipped: "order_not_found" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Idempotency
  if (order.status !== "pending_payment") {
    console.log("Order already processed:", orderId, order.status);
    return new Response(JSON.stringify({ ok: true, skipped: "already_processed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const hasPaidAudiobook = priceIds.some((p) => AUDIOBOOK_PRICE_IDS.has(p));
  const selectedAddons = {
    ...((order.selected_addons as Record<string, boolean>) || {}),
    audiobook: Boolean(
      ((order.selected_addons as Record<string, boolean>) || {}).audiobook || hasPaidAudiobook,
    ),
    coloring_pages: Boolean(
      ((order.selected_addons as Record<string, boolean>) || {}).coloring_pages
        || priceIds.includes("coloring_pages_addon_onetime"),
    ),
  };

  await supabase
    .from("storybook_orders")
    .update({
      status: "queued",
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      customer_email: customerEmail || order.customer_email,
      selected_addons: selectedAddons,
    })
    .eq("id", orderId);

  // Background pipeline: generate-story -> create-storybook
  (async () => {
    try {
      const storyRes = await fetch(`${supabaseUrl}/functions/v1/generate-story`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
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
      if (!storyRes.ok) throw new Error(`generate-story failed: ${await storyRes.text()}`);
      const story = await storyRes.json();

      await supabase
        .from("storybook_orders")
        .update({
          status: "generating_images",
          story_title: story.title,
          story_text: story.story,
        })
        .eq("id", orderId);

      const pdfRes = await fetch(`${supabaseUrl}/functions/v1/create-storybook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serviceKey}`,
        },
        body: JSON.stringify({
          orderId,
          title: story.title,
          story: story.story,
          childName: order.child_name,
          childAge: order.child_age,
          theme: order.theme,
          strength: order.strength || "",
          customerEmail: customerEmail || order.customer_email || "",
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
      console.log("Pipeline complete for order", orderId);
    } catch (e) {
      console.error("Pipeline failed for", orderId, e);
      await supabase
        .from("storybook_orders")
        .update({
          status: "failed",
          error_message: e instanceof Error ? e.message : String(e),
        })
        .eq("id", orderId);
    }
  })();

  return new Response(JSON.stringify({ ok: true, orderId }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
