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
    const { priceIds, orderId, customerEmail, returnUrl, environment } = body as {
      priceIds: string[]; orderId: string; customerEmail?: string; returnUrl: string; environment: StripeEnv;
    };

    if (!Array.isArray(priceIds) || priceIds.length === 0) throw new Error("priceIds required");
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) throw new Error("valid orderId required");
    if (!returnUrl) throw new Error("returnUrl required");
    if (environment !== "sandbox" && environment !== "live") throw new Error("invalid environment");
    for (const p of priceIds) if (!/^[a-zA-Z0-9_-]+$/.test(p)) throw new Error("invalid price id");

    const stripe = createStripeClient(environment);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: order } = await supabase
      .from("storybook_orders")
      .select("id, selected_addons")
      .eq("id", orderId)
      .maybeSingle();
    if (!order) throw new Error("Order was not created. Please restart checkout from the story preview.");

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

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: returnUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      payment_intent_data: { description: product.name },
      metadata: { orderId, priceIds: priceIds.join(",") },
      managed_payments: { enabled: true },
    } as any);

    // Persist stripe_session_id on the order
    await supabase.from("storybook_orders").update({ stripe_session_id: session.id }).eq("id", orderId);

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
