import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CLASSIC_AUDIOBOOK_PRICE_ID = "audiobook_classic_onetime";
const INTERACTIVE_AUDIOBOOK_PRICE_ID = "audiobook_interactive_read_along_onetime";
const COLORING_PRICE_ID = "coloring_pages_addon_onetime";
const SUPPORTING_CHARACTER_PRICE_ID = "supporting_character_addon_onetime";
const BASE_STORY_PRICE_ID = "personalized_storybook_onetime";


function addonsForPrices(priceIds: string[]) {
  const hasClassic = priceIds.includes(CLASSIC_AUDIOBOOK_PRICE_ID);
  const hasInteractive = priceIds.includes(INTERACTIVE_AUDIOBOOK_PRICE_ID);
  return {
    ...(priceIds.includes(COLORING_PRICE_ID) && { coloring: true, coloringPages: true }),
    ...(priceIds.includes(SUPPORTING_CHARACTER_PRICE_ID) && { character: true }),
    ...((hasClassic || hasInteractive) && {
      audiobook: true,
      audiobookTier: hasInteractive ? "interactive" : "classic",
    }),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const body = await req.json();
    const { priceIds, orderId, customerEmail, returnUrl, environment, recoveryToken } = body as {
      priceIds: string[]; orderId: string; customerEmail?: string; returnUrl: string; environment: StripeEnv;
      recoveryToken?: string;
    };

    if (!Array.isArray(priceIds) || priceIds.length === 0) throw new Error("priceIds required");
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) throw new Error("valid orderId required");
    if (!returnUrl) throw new Error("returnUrl required");
    if (environment !== "sandbox" && environment !== "live") throw new Error("invalid environment");
    for (const p of priceIds) if (!/^[a-zA-Z0-9_-]+$/.test(p)) throw new Error("invalid price id");
    if (!recoveryToken || !/^[0-9a-f-]{36}$/i.test(recoveryToken)) {
      return new Response(JSON.stringify({ error: "Missing or invalid order access token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = createStripeClient(environment);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: order } = await supabase
      .from("storybook_orders")
      .select("id, selected_addons, recovery_token, status")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) throw new Error("Order was not created. Please restart checkout from the story preview.");

    // Ownership check: only the client that created the order (and therefore
    // holds the per-order recovery_token) may mutate add-ons or bind a session.
    if (!(order as any).recovery_token || String((order as any).recovery_token) !== recoveryToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // The post-payment upsell reuses the same orderId to buy add-ons only. That
    // order is already paid/generating, so only enforce the "awaiting payment"
    // guard when the base storybook price is part of this checkout.
    const isAddonOnly = !priceIds.includes(BASE_STORY_PRICE_ID);
    if (!isAddonOnly && !["pending_payment", "pending"].includes(String((order as any).status))) {
      return new Response(JSON.stringify({ error: "This order is no longer awaiting payment." }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (isAddonOnly && ["failed", "refunded"].includes(String((order as any).status))) {
      return new Response(JSON.stringify({ error: "Add-ons are unavailable for this order." }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const purchasedAddons = addonsForPrices(priceIds);
    if (Object.keys(purchasedAddons).length > 0) {
      await supabase
        .from("storybook_orders")
        .update({ selected_addons: { ...((order as any).selected_addons || {}), ...purchasedAddons } })
        .eq("id", orderId);
    }



    // Resolve prices via lookup_keys
    const prices = await stripe.prices.list({ lookup_keys: priceIds, limit: 20 });
    if (prices.data.length === 0) throw new Error("No matching prices");
    const line_items = prices.data.map((pr) => ({ price: pr.id, quantity: 1 }));

    // First product name = description for dashboard
    const firstProductId = typeof prices.data[0].product === "string"
      ? prices.data[0].product
      : (prices.data[0].product as any).id;
    const product = await stripe.products.retrieve(firstProductId);

    // NOTE: managed_payments intentionally disabled — the live Stripe account
    // is controlled by an external platform (Webador) which does not permit
    // managed_payments. Enabling it caused every live checkout session
    // creation to fail with a 400 and blocked all real customer purchases.
    // Digital-only product, no tax collection required at this stage.
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      payment_intent_data: { description: product.name },
      metadata: { orderId, priceIds: priceIds.join(","), ...(isAddonOnly && { addonOnly: "1" }) },
    } as any);

    // Persist stripe_session_id only for the base checkout — an add-on upsell
    // session must not overwrite the original paid session on the order.
    if (!isAddonOnly) {
      await supabase.from("storybook_orders").update({ stripe_session_id: session.id }).eq("id", orderId);
    }


    return new Response(JSON.stringify({ clientSecret: session.client_secret, sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("create-checkout error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
