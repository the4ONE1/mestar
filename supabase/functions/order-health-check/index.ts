// Order health-check.
// Two modes (controlled by ?mode=… or JSON body { mode }):
//   - "failures"  → alert if any orders have status='failed' OR are stuck >30min in
//                   pending_payment / queued / generating_images / assembling_pdf.
//                   Sends an alert email ONLY when something is wrong. Silent otherwise.
//   - "daily"     → daily summary of last 24h activity. Always sends an email.
// Default mode is "failures".
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import nodemailer from "npm:nodemailer@6.9.12";

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

async function sendEmail(subject: string, body: string, gmailPass: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: "mestar.orders@gmail.com", pass: gmailPass },
  });
  await transporter.sendMail({
    from: "MESTAR Health Check <mestar.orders@gmail.com>",
    to: ALERT_TO,
    subject,
    text: body,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

  // Require Supabase service-role or anon key as bearer (called by pg_cron only)
  const auth = req.headers.get("Authorization") || "";
  const presented = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : "";
  if (!presented || (presented !== SERVICE_ROLE && presented !== ANON_KEY)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!SUPABASE_URL || !SERVICE_ROLE || !GMAIL_APP_PASSWORD) {
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

      await sendEmail(
        `MESTAR Daily — ${orders.length} orders, ${failed.length} failed`,
        lines.join("\n"),
        GMAIL_APP_PASSWORD,
      );

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

    const failed = (failedOrders || []) as OrderRow[];
    const stuck = (stuckOrders || []) as OrderRow[];
    const total = failed.length + stuck.length;

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
    lines.push(
      `Action: check edge function logs for these order IDs.`,
      `Time: ${new Date().toISOString()}`,
    );

    await sendEmail(
      `🚨 MESTAR alert — ${failed.length} failed, ${stuck.length} stuck`,
      lines.join("\n"),
      GMAIL_APP_PASSWORD,
    );

    return new Response(
      JSON.stringify({ ok: true, mode: "failures", alerts: total, failed: failed.length, stuck: stuck.length }),
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
