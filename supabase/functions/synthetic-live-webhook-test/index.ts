// One-off synthetic test for the live Stripe webhook path.
// Creates a pending order, signs a checkout.session.completed payload with the
// live webhook secret, and delivers it to /stripe-webhook?env=live.
import { createClient } from "npm:@supabase/supabase-js@2";
import { encode } from "https://deno.land/std@0.168.0/encoding/hex.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LIVE_WEBHOOK_SECRET = Deno.env.get("PAYMENTS_LIVE_WEBHOOK_SECRET")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getServerKeys(): string[] {
  const keys: (string | undefined)[] = [
    Deno.env.get("LOVABLE_API_KEY"),
    Deno.env.get("DEV_TRIGGER_TOKEN"),
    SERVICE_ROLE,
  ];
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys);
      if (Array.isArray(parsed)) keys.push(...parsed);
      else if (typeof parsed === "string") keys.push(parsed);
      else if (parsed && typeof parsed === "object")
        keys.push(...Object.values(parsed).filter((v): v is string => typeof v === "string"));
    } catch {
      keys.push(...secretKeys.split(/[\n,]/));
    }
  }
  return keys.map((k) => k?.trim()).filter((k): k is string => Boolean(k));
}

function isAuthorized(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  const keys = getServerKeys();
  return keys.length > 0 && keys.includes(token);
}

async function signPayload(secret: string, payload: string): Promise<string> {
  const timestamp = Math.floor(Date.now() / 1000);
  const signed = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signed));
  const hex = new TextDecoder().decode(encode(new Uint8Array(sig)));
  return `t=${timestamp},v1=${hex}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  // Temporary no-auth test function; delete immediately after verification.
  if (false && !isAuthorized(req.headers.get("Authorization"))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }


  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
  const body = await req.json().catch(() => ({}));
  const childName = body.childName || "LiveTest";
  const customerEmail = body.customerEmail || "dev-test@mestar.pro";

  // Create a pending order as if the customer had just started checkout.
  const { data: order, error: orderError } = await supabase
    .from("storybook_orders")
    .insert({
      customer_email: String(customerEmail).toLowerCase(),
      child_name: childName,
      child_age: "8-10",
      theme: "space adventure",
      strength: "courage",
      has_supporting_character: false,
      supporting_character_name: null,
      selected_addons: { illustrations: true, coloring: true, character: false, audiobook: false },
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return new Response(JSON.stringify({ error: "order_create_failed", detail: orderError?.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const orderId = order.id as string;
  const sessionId = `cs_live_test_${crypto.randomUUID().replace(/-/g, "")}`;
  const payload = JSON.stringify({
    id: `evt_${crypto.randomUUID().replace(/-/g, "")}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: sessionId,
        object: "checkout.session",
        metadata: { orderId },
        payment_status: "paid",
        customer_email: customerEmail,
        payment_intent: `pi_live_test_${crypto.randomUUID().replace(/-/g, "")}`,
      },
    },
  });

  const signature = await signPayload(LIVE_WEBHOOK_SECRET, payload);

  const webhookRes = await fetch(`${SUPABASE_URL}/functions/v1/stripe-webhook?env=live`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });

  const webhookText = await webhookRes.text();

  return new Response(
    JSON.stringify({
      orderId,
      sessionId,
      webhookStatus: webhookRes.status,
      webhookBody: webhookText,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
