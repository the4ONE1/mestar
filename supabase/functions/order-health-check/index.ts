// Order health-check.
// Two modes (controlled by ?mode=… or JSON body { mode }):
//   - "failures"  → alert if any orders have status='failed' OR are stuck >30min in
//                   pending_payment / queued / generating_images / assembling_pdf.
//                   Sends an alert email ONLY when something is wrong. Silent otherwise.
//   - "daily"     → daily summary of last 24h activity. Always sends an email.
// Default mode is "failures".
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { sendOwnerAlert } from "../_shared/alert.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALERT_TO = "mestar.orders@gmail.com";
const STUCK_STATUSES = ["pending_payment", "queued", "generating_images", "assembling_pdf"];
const STUCK_MINUTES = 30;

interface OrderRow {
  id: string;
  status: string;
  child_name: string;
  customer_email: string | null;
  shopify_order_id: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

function fmtRow(o: OrderRow): string {
  const ageMin = Math.round((Date.now() - new Date(o.created_at).getTime()) / 60000);
  return [
    `• Order ${o.id.slice(0, 8)} — ${o.child_name}`,
    `  Status: ${o.status}${o.error_message ? ` (error: ${o.error_message})` : ""}`,
    `  Email: ${o.customer_email || "—"}  Shopify: ${o.shopify_order_id || "—"}`,
    `  Created: ${o.created_at}  (${ageMin} min ago)`,
  ].join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // Require Supabase service-role key as bearer (server-to-server only; called by pg_cron).
  // The anon/publishable key is intentionally NOT accepted — it's embedded in the client
  // bundle and would let anyone trigger admin alert emails or read aggregate metrics.
  const CRON_TOKEN = Deno.env.get("CRON_ALERT_TOKEN");
  const auth = req.headers.get("Authorization") || "";
  const presented = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  const authorized =
    !!presented &&
    ((!!SERVICE_ROLE && presented === SERVICE_ROLE) || (!!CRON_TOKEN && presented === CRON_TOKEN));
  if (!authorized) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Parse mode from query OR JSON body (cron uses body)
  const url = new URL(req.url);
  let mode = url.searchParams.get("mode") || "failures";
  if (req.method === "POST") {
    try {
      const body = await req.json();
      if (body?.mode) mode = body.mode;
    } catch {
      // no body — keep default
    }
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    if (mode === "daily") {
      // Last 24h summary — always sent
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("storybook_orders")
        .select("id, status, child_name, customer_email, shopify_order_id, error_message, created_at, completed_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false });

      if (error) throw error;
      const orders = (data || []) as OrderRow[];

      const byStatus: Record<string, number> = {};
      orders.forEach((o) => (byStatus[o.status] = (byStatus[o.status] || 0) + 1));

      const failed = orders.filter((o) => o.status === "failed");
      const complete = orders.filter((o) => o.status === "complete");

      const lines = [
        `MESTAR Daily Order Summary — last 24h`,
        `=====================================`,
        ``,
        `Total orders: ${orders.length}`,
        `Completed: ${complete.length}`,
        `Failed: ${failed.length}`,
        ``,
        `Breakdown by status:`,
        ...Object.entries(byStatus).map(([s, n]) => `  ${s}: ${n}`),
        ``,
      ];

      if (failed.length > 0) {
        lines.push(`⚠️  Failed orders:`, ``, ...failed.map(fmtRow), ``);
      }

      if (orders.length === 0) {
        lines.push(`No orders in the last 24 hours.`);
      }

      await sendOwnerAlert({
        key: `daily_summary:${new Date().toISOString().slice(0, 10)}`,
        severity: "info",
        subject: `MESTAR Daily — ${orders.length} orders, ${failed.length} failed`,
        details: lines.join("\n"),
        sms: false,
        throttleMinutes: 0,
      });

      // Daily digest is email-only (no text) unless something actually failed.
      if (failed.length > 0) {
        await sendOwnerAlert({
          key: "daily_failures",
          severity: "warn",
          subject: `MESTAR daily: ${failed.length} failed order(s) in 24h`,
          smsText: `MESTAR: ${failed.length} failed order(s) in the last 24h out of ${orders.length}. Check your email for details.`,
          details: lines.join("\n"),
          throttleMinutes: 720,
        });
      }

      return new Response(JSON.stringify({ ok: true, mode, totals: byStatus }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === failures mode ===
    const stuckCutoff = new Date(Date.now() - STUCK_MINUTES * 60 * 1000).toISOString();
    const lookbackStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: failedOrders, error: failedErr } = await supabase
      .from("storybook_orders")
      .select("id, status, child_name, customer_email, shopify_order_id, error_message, created_at, completed_at")
      .eq("status", "failed")
      .gte("created_at", lookbackStart)
      .order("created_at", { ascending: false });
    if (failedErr) throw failedErr;

    const { data: stuckOrders, error: stuckErr } = await supabase
      .from("storybook_orders")
      .select("id, status, child_name, customer_email, shopify_order_id, error_message, created_at, completed_at")
      .in("status", STUCK_STATUSES)
      .lt("created_at", stuckCutoff)
      .gte("created_at", lookbackStart)
      .order("created_at", { ascending: false });
    if (stuckErr) throw stuckErr;

    // Payment webhook problems (signature failures, unprocessed payments, errors)
    const { data: badPayments } = await supabase
      .from("payment_events")
      .select("id, event_type, result, message, created_at")
      .neq("result", "ok")
      .gte("created_at", lookbackStart)
      .order("created_at", { ascending: false })
      .limit(50);
    const paymentProblems = (badPayments || []) as Array<{
      id: string; event_type: string; result: string; message: string | null; created_at: string;
    }>;

    // Email delivery problems: anything still unsent after 10 minutes, or dead-lettered.
    // A single email writes several rows sharing one message_id, so keep only the
    // latest row per message_id before judging it.
    const { data: emailRows } = await supabase
      .from("email_send_log")
      .select("message_id, template_name, recipient_email, status, error_message, created_at")
      .gte("created_at", lookbackStart)
      .order("created_at", { ascending: false })
      .limit(1000);
    const latestByMessage = new Map<string, {
      message_id: string; template_name: string; recipient_email: string;
      status: string; error_message: string | null; created_at: string;
    }>();
    for (const r of (emailRows || []) as Array<Record<string, string | null>>) {
      const key = (r.message_id as string) || `${r.template_name}:${r.created_at}`;
      if (!latestByMessage.has(key)) {
        latestByMessage.set(key, r as never);
      }
    }
    const emailStaleCutoff = Date.now() - 10 * 60 * 1000;
    const emailProblems = [...latestByMessage.values()].filter((r) =>
      r.status === "dlq" ||
      r.status === "failed" ||
      (r.status === "pending" && new Date(r.created_at).getTime() < emailStaleCutoff)
    );

    const failed = (failedOrders || []) as OrderRow[];
    const stuck = (stuckOrders || []) as OrderRow[];
    const total = failed.length + stuck.length + paymentProblems.length + emailProblems.length;

    if (total === 0) {
      return new Response(
        JSON.stringify({ ok: true, mode: "failures", alerts: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const lines = [
      `🚨 MESTAR Order Health Alert`,
      `============================`,
      ``,
      `${failed.length} failed order(s), ${stuck.length} stuck order(s) in the last 24h.`,
      ``,
    ];
    if (failed.length > 0) {
      lines.push(`--- FAILED ---`, ``, ...failed.map(fmtRow), ``);
    }
    if (stuck.length > 0) {
      lines.push(
        `--- STUCK >${STUCK_MINUTES} min ---`,
        ``,
        ...stuck.map(fmtRow),
        ``,
        `These orders started but never finished. Likely causes:`,
        `  • Story generation timed out`,
        `  • PDF assembly crashed`,
        `  • Email send failed`,
        ``,
      );
    }
    if (paymentProblems.length > 0) {
      lines.push(
        `--- PAYMENT / WEBHOOK PROBLEMS ---`,
        ``,
        ...paymentProblems.map(
          (p) => `• ${p.created_at} — ${p.event_type} → ${p.result}${p.message ? ` (${p.message})` : ""}`,
        ),
        ``,
      );
    }
    if (emailProblems.length > 0) {
      lines.push(
        `--- EMAIL DELIVERY PROBLEMS ---`,
        ``,
        ...emailProblems.map(
          (e) =>
            `• ${e.created_at} — ${e.template_name} → ${e.recipient_email} [${e.status}]${
              e.error_message ? ` (${e.error_message})` : ""
            }`,
        ),
        ``,
        `Customer emails are NOT going out. This blocks story delivery.`,
        ``,
      );
    }
    lines.push(
      `Action: check edge function logs for these order IDs.`,
      `Time: ${new Date().toISOString()}`,
    );

    const smsParts: string[] = [];
    if (failed.length) smsParts.push(`${failed.length} failed order(s)`);
    if (stuck.length) smsParts.push(`${stuck.length} stuck order(s)`);
    if (paymentProblems.length) smsParts.push(`${paymentProblems.length} payment/webhook issue(s)`);
    if (emailProblems.length) smsParts.push(`${emailProblems.length} undelivered email(s)`);

    await sendOwnerAlert({
      key: `order_health:${failed.length}:${stuck.length}:${paymentProblems.length}:${emailProblems.length}`,
      severity: "critical",
      subject: `MESTAR alert — ${smsParts.join(", ")}`,
      smsText: `MESTAR ALERT: ${smsParts.join(", ")}. Customer deliveries may be affected. Check email/admin now.`,
      details: lines.join("\n"),
      throttleMinutes: 45,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        mode: "failures",
        alerts: total,
        failed: failed.length,
        stuck: stuck.length,
        paymentProblems: paymentProblems.length,
        emailProblems: emailProblems.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("health-check error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
