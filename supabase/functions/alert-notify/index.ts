// Central alert dispatcher.
// Sends an alert to the owner by EMAIL and by SMS (AT&T email-to-SMS gateway).
// Called server-to-server (service-role bearer only) from:
//   - create-storybook / generate-story  → AI credits refused (HTTP 402)
//   - order-health-check                 → failed / stuck orders, webhook problems
//
// Repeat alerts with the same `key` are throttled (default 60 min) so a burst of
// failures does not turn into a burst of text messages.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import nodemailer from "npm:nodemailer@6.9.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALERT_EMAIL = "mestar.orders@gmail.com";
// AT&T email-to-SMS gateway for 405-287-4004
const ALERT_SMS = "4052874004@txt.att.net";
const DEFAULT_THROTTLE_MIN = 60;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");

  const auth = req.headers.get("Authorization") || "";
  const presented = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!presented || !SERVICE_ROLE || presented !== SERVICE_ROLE) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!SUPABASE_URL || !GMAIL_APP_PASSWORD) {
    return new Response(JSON.stringify({ error: "Missing env vars" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: {
    key?: string;
    severity?: string;
    subject?: string;
    smsText?: string;
    details?: string;
    throttleMinutes?: number;
    sms?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const key = (body.key || "generic").slice(0, 120);
  const subject = (body.subject || "MESTAR alert").slice(0, 200);
  const details = (body.details || "").slice(0, 8000);
  const severity = body.severity === "info" ? "info" : body.severity === "warn" ? "warn" : "critical";
  const throttleMinutes = Number.isFinite(body.throttleMinutes)
    ? Math.max(0, Math.min(1440, Number(body.throttleMinutes)))
    : DEFAULT_THROTTLE_MIN;
  const wantSms = body.sms !== false;
  // Keep SMS short — carrier gateways truncate around 160 chars.
  const smsText = (body.smsText || subject).slice(0, 155);

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  try {
    if (throttleMinutes > 0) {
      const since = new Date(Date.now() - throttleMinutes * 60_000).toISOString();
      const { data: recent } = await supabase
        .from("alert_log")
        .select("id")
        .eq("alert_key", key)
        .gte("created_at", since)
        .limit(1);
      if (recent && recent.length > 0) {
        return new Response(JSON.stringify({ ok: true, throttled: true, key }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: ALERT_EMAIL, pass: GMAIL_APP_PASSWORD },
    });

    const emailBody = [
      subject,
      "=".repeat(Math.min(subject.length, 60)),
      "",
      details || "(no extra detail)",
      "",
      `Severity: ${severity}`,
      `Time: ${new Date().toISOString()}`,
    ].join("\n");

    const results: Record<string, string> = {};

    try {
      await transporter.sendMail({
        from: `MESTAR Alerts <${ALERT_EMAIL}>`,
        to: ALERT_EMAIL,
        subject: `${severity === "critical" ? "🚨 " : ""}${subject}`,
        text: emailBody,
      });
      results.email = "sent";
    } catch (e) {
      results.email = `failed: ${e instanceof Error ? e.message : String(e)}`;
      console.error("alert email failed", e);
    }

    if (wantSms) {
      try {
        await transporter.sendMail({
          from: `MESTAR <${ALERT_EMAIL}>`,
          to: ALERT_SMS,
          subject: "",
          text: smsText,
        });
        results.sms = "sent";
      } catch (e) {
        results.sms = `failed: ${e instanceof Error ? e.message : String(e)}`;
        console.error("alert sms failed", e);
      }
    }

    await supabase.from("alert_log").insert({
      alert_key: key,
      severity,
      subject,
      details,
      channels: results,
    });

    return new Response(JSON.stringify({ ok: true, key, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("alert-notify error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
