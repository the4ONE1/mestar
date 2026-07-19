// Admin-only endpoint that creates a pending test order + Stripe checkout session
// so we can verify the webhook end-to-end. Protected by ADMIN_DASHBOARD_TOKEN.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const adminToken = Deno.env.get("ADMIN_DASHBOARD_TOKEN");
  const provided = req.headers.get("x-admin-token") || "";
  if (!adminToken || !provided || !timingSafeEqual(provided, adminToken)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Create pending order via the same RPC the customer flow uses
  const { data: orderId, error } = await supabase.rpc("create_pending_order", {
    _child_name: "Admin Test",
    _child_age: "5-7",
    _theme: "kindness",
    _strength: "curiosity",
    _supporting_character_name: null,
    _has_supporting_character: false,
    _selected_addons: {},
    _customer_email: "mestar.orders@gmail.com",
  });

  if (error || !orderId) {
    return new Response(JSON.stringify({ error: error?.message || "create failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ orderId }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
