// Creates a Stripe Embedded Checkout session for a MESTAR order.
// Accepts an existing pending storybook_orders.id plus an array of price IDs
// (main storybook + add-ons). Returns { clientSecret } for the embedded UI.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { type StripeEnv, createStripeClient } from "../_shared/stripe.ts";

interface RequestBody {
  orderId: string;
  priceIds: string[];
  customerEmail?: string;
  returnUrl: string;
  environment: StripeEnv;
  recoveryToken?: string;
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    if (!body?.orderId || !Array.isArray(body.priceIds) || body.priceIds.length === 0) {
      return new Response(JSON.stringify({ error: "orderId and priceIds required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (body.environment !== "sandbox" && body.environment !== "live") {
      return new Response(JSON.stringify({ error: "invalid environment" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.orderId)) {
      return new Response(JSON.stringify({ error: "invalid orderId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    for (const pid of body.priceIds) {
      if (!/^[a-zA-Z0-9_-]+$/.test(pid)) {
        return new Response(JSON.stringify({ error: "invalid priceId" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Confirm the order exists and is still pending (prevents double-charge).
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: order, error: orderErr } = await supabase
      .from("storybook_orders")
      .select("id, status, customer_email")
      .eq("id", body.orderId)
      .maybeSingle();
    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (order.status !== "pending_payment") {
      return new Response(JSON.stringify({ error: "Order already processed" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = createStripeClient(body.environment);

    // Resolve each human-readable price ID via lookup_keys.
    const prices = await stripe.prices.list({
      lookup_keys: body.priceIds,
      expand: ["data.product"],
    });
    if (prices.data.length !== body.priceIds.length) {
      return new Response(
        JSON.stringify({ error: "One or more prices not found in Stripe" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const lineItems = prices.data.map((p) => ({ price: p.id, quantity: 1 }));

    // Human-readable description on the PaymentIntent for the payments dashboard.
    const productNames = prices.data
      .map((p) => (typeof p.product === "object" && p.product && "name" in p.product ? (p.product as any).name : ""))
      .filter(Boolean);
    const description = productNames.length > 1
      ? `${productNames[0]} + ${productNames.length - 1} add-on(s)`
      : productNames[0] || "MESTAR Storybook";

    const customerEmail = body.customerEmail || order.customer_email || undefined;

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      ui_mode: "embedded_page",
      return_url: body.returnUrl,
      ...(customerEmail && { customer_email: customerEmail }),
      payment_intent_data: { description },
      metadata: {
        mestar_order_id: body.orderId,
        price_ids: body.priceIds.join(","),
      },
      // Full compliance handling (tax + fraud + disputes handled by Stripe)
      managed_payments: { enabled: true },
    } as any);

    // Save the Stripe session id on the order for webhook idempotency + audit.
    await supabase
      .from("storybook_orders")
      .update({ stripe_session_id: session.id })
      .eq("id", body.orderId);

    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("create-checkout error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
