import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const orderId = new URL(req.url).searchParams.get("orderId")?.trim();
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    return new Response(JSON.stringify({ error: "Invalid orderId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: order, error } = await supabase
    .from("storybook_orders")
    .select("id, status, story_title, pdf_url, child_name, customer_email, selected_addons")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const addons = (order.selected_addons as Record<string, boolean>) || {};
  return new Response(JSON.stringify({
    id: order.id,
    status: order.status,
    story_title: order.story_title,
    pdf_url: order.pdf_url,
    child_name: order.child_name,
    customer_email: order.customer_email,
    has_audiobook: !!addons.audiobook,
    has_error: order.status === "failed",
  }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});