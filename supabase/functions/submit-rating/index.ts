import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const orderId = typeof body?.order_id === "string" ? body.order_id.trim() : "";
    const token = typeof body?.token === "string" ? body.token.trim() : "";
    const stars = Number(body?.stars);
    const rawComment = typeof body?.comment === "string" ? body.comment.trim() : "";
    const comment = rawComment ? rawComment.slice(0, 2000) : null;

    if (!UUID_RE.test(orderId) || !UUID_RE.test(token)) {
      return new Response(JSON.stringify({ error: "Invalid order or token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return new Response(JSON.stringify({ error: "Stars must be an integer 1-5" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase.rpc("submit_rating", {
      p_order_id: orderId,
      p_recovery_token: token,
      p_stars: stars,
      p_comment: comment,
    });

    if (error) {
      console.error("submit_rating failed", error.message);
      return new Response(JSON.stringify({ error: "Could not save rating" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("submit-rating error", e);
    return new Response(JSON.stringify({ error: "Unexpected error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
