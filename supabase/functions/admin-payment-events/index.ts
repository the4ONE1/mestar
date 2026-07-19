// Admin-only endpoint that returns recent Stripe webhook events for review.
// Requires an X-Admin-Token header matching ADMIN_DASHBOARD_TOKEN secret.
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const adminToken = Deno.env.get("ADMIN_DASHBOARD_TOKEN");
  const provided = req.headers.get("x-admin-token") || "";
  if (!adminToken || !provided || !timingSafeEqual(provided, adminToken)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId")?.trim() || null;
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  let query = supabase
    .from("payment_events")
    .select("id, order_id, stripe_session_id, stripe_payment_intent_id, event_type, result, message, payload_summary, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (orderId && /^[0-9a-f-]{36}$/i.test(orderId)) {
    query = query.eq("order_id", orderId);
  }

  const { data: events, error } = await query;
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Also fetch related order summaries for context
  const orderIds = [...new Set((events || []).map((e: any) => e.order_id).filter(Boolean))];
  let orders: any[] = [];
  if (orderIds.length > 0) {
    const { data: orderRows } = await supabase
      .from("storybook_orders")
      .select("id, status, child_name, customer_email, story_title, stripe_session_id, stripe_payment_intent_id, created_at, completed_at, error_message")
      .in("id", orderIds);
    orders = orderRows || [];
  }

  return new Response(JSON.stringify({ events: events || [], orders }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
