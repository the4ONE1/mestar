// Called from the /checkout return page as a safety net if the Stripe webhook
// is delayed. Verifies with Stripe that the session is paid, then triggers
// generation via the same webhook handler idempotency check.
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

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
    if (order && ["complete", "generating_story", "generating_images"].includes((order as any).status)) {
      return new Response(JSON.stringify({ ok: true, alreadyProcessing: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fire the webhook internally to reuse generation logic
    await supabase.from("payment_events").insert({
      order_id: orderId, stripe_session_id: sessionId,
      event_type: "return_page_fallback", processing_result: "triggered", payload: { sessionId },
    });

    // Kick off generation directly
    await fetch(`${SUPABASE_URL}/functions/v1/create-storybook-trigger?orderId=${orderId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SERVICE_ROLE}` },
    }).catch(() => {});
    // Also directly call the same pipeline the webhook uses:
    await triggerPipeline(orderId);

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

async function triggerPipeline(orderId: string) {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: order } = await supabase.from("storybook_orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return;
  const selectedAddons = (order as any).selected_addons || {};
  await supabase.from("storybook_orders").update({ status: "generating_story", paid_at: new Date().toISOString() }).eq("id", orderId);

  const storyRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
    body: JSON.stringify({
      childName: (order as any).child_name,
      childAge: (order as any).child_age,
      childGender: (order as any).child_gender || "neutral",
      theme: (order as any).theme,
      strength: (order as any).strength,
      hasSupportingCharacter: (order as any).has_supporting_character,
      supportingCharacterName: (order as any).supporting_character_name,
      selectedAddons,
    }),
  });
  if (!storyRes.ok) return;
  const story = await storyRes.json();
  await supabase.from("storybook_orders").update({
    status: "generating_images", story_title: story.title, story_text: story.story,
  }).eq("id", orderId);

  await fetch(`${SUPABASE_URL}/functions/v1/create-storybook`, {
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
      customerEmail: (order as any).customer_email,
      childName: (order as any).child_name,
      childAge: (order as any).child_age,
      theme: (order as any).theme,
      strength: (order as any).strength,
      hasSupportingCharacter: (order as any).has_supporting_character,
      supportingCharacterName: (order as any).supporting_character_name,
    }),
  });
}
