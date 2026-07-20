// Admin-only endpoint that returns recent Stripe webhook events for review,
// plus webhook health summary. POST supports actions: retry_generation.
// Requires X-Admin-Token header matching ADMIN_DASHBOARD_TOKEN secret.
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

const SUCCESS_RESULTS = new Set(["queued", "pipeline_complete", "refunded"]);
const FAILURE_RESULTS = new Set(["signature_invalid", "pipeline_failed", "payment_failed"]);

async function computeHealth(supabase: ReturnType<typeof createClient>) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: recent } = await supabase
    .from("payment_events")
    .select("result, message, event_type, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(500);
  const rows = recent || [];
  const successes = rows.filter((r: any) => SUCCESS_RESULTS.has(r.result));
  const failures = rows.filter((r: any) => FAILURE_RESULTS.has(r.result));
  const lastSuccess = successes[0] || null;
  const lastFailure = failures[0] || null;
  const healthy = successes.length > 0 && (!lastFailure || (lastSuccess && new Date(lastSuccess.created_at) > new Date(lastFailure.created_at)));
  return {
    healthy,
    count24h: rows.length,
    successes24h: successes.length,
    failures24h: failures.length,
    lastSuccessAt: lastSuccess?.created_at || null,
    lastFailureAt: lastFailure?.created_at || null,
    lastFailureMessage: lastFailure?.message || null,
    lastFailureEventType: lastFailure?.event_type || null,
  };
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  // POST: actions
  if (req.method === "POST") {
    let body: any = {};
    try { body = await req.json(); } catch (_) { /* ignore */ }
    const action = body?.action;

    if (action === "retry_generation") {
      const orderId = String(body?.orderId || "");
      if (!/^[0-9a-f-]{36}$/i.test(orderId)) {
        return new Response(JSON.stringify({ error: "Invalid orderId" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: order } = await supabase
        .from("storybook_orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();
      if (!order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      // Force status to queued and re-run pipeline in background
      await supabase.from("storybook_orders").update({ status: "queued", error_message: null }).eq("id", orderId);
      await supabase.from("payment_events").insert({
        order_id: orderId,
        event_type: "admin.retry_generation",
        result: "queued",
        message: "manual retry triggered from admin dashboard",
        payload_summary: {},
      });

      // Kick pipeline (fire-and-forget)
      (async () => {
        try {
          const storyRes = await fetch(`${supabaseUrl}/functions/v1/generate-story`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
            body: JSON.stringify({
              childName: order.child_name,
              childAge: order.child_age,
              theme: order.theme,
              strength: order.strength || "",
              hasSupportingCharacter: !!order.has_supporting_character,
              supportingCharacterName: order.supporting_character_name || "",
              selectedAddons: order.selected_addons || {},
            }),
          });
          if (!storyRes.ok) throw new Error(`generate-story failed: ${await storyRes.text()}`);
          const story = await storyRes.json();
          await supabase.from("storybook_orders").update({
            status: "generating_images", story_title: story.title, story_text: story.story,
          }).eq("id", orderId);
          const pdfRes = await fetch(`${supabaseUrl}/functions/v1/create-storybook`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
            body: JSON.stringify({
              orderId, title: story.title, story: story.story,
              childName: order.child_name, childAge: order.child_age,
              theme: order.theme, strength: order.strength || "",
              customerEmail: order.customer_email || "",
              hasSupportingCharacter: !!order.has_supporting_character,
              supportingCharacterName: order.supporting_character_name || "",
              selectedAddons: order.selected_addons || {},
              coloringPrompts: story.coloringPrompts || [],
      bonusColoringPrompts: story.bonusColoringPrompts || [],
              illustrationPrompts: (story.illustrationPrompts?.length ? story.illustrationPrompts : story.scenes) || [],
            }),
          });
          if (!pdfRes.ok) throw new Error(`create-storybook failed: ${await pdfRes.text()}`);
          await supabase.from("payment_events").insert({
            order_id: orderId, event_type: "admin.retry_generation",
            result: "pipeline_complete", message: story.title || "PDF regenerated",
            payload_summary: {},
          });
        } catch (e) {
          const errMsg = e instanceof Error ? e.message : String(e);
          await supabase.from("storybook_orders").update({
            status: "failed", error_message: errMsg,
          }).eq("id", orderId);
          await supabase.from("payment_events").insert({
            order_id: orderId, event_type: "admin.retry_generation",
            result: "pipeline_failed", message: errMsg, payload_summary: {},
          });
        }
      })();

      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // GET: list events + health
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId")?.trim() || null;
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "100", 10) || 100, 500);

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

  const orderIds = [...new Set((events || []).map((e: any) => e.order_id).filter(Boolean))];
  let orders: any[] = [];
  if (orderIds.length > 0) {
    const { data: orderRows } = await supabase
      .from("storybook_orders")
      .select("id, status, child_name, customer_email, story_title, stripe_session_id, stripe_payment_intent_id, created_at, completed_at, error_message")
      .in("id", orderIds);
    orders = orderRows || [];
  }

  const health = await computeHealth(supabase);

  return new Response(JSON.stringify({ events: events || [], orders, health }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
