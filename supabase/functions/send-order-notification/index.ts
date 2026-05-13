import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Service-role auth: this function is server-to-server only
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const auth = req.headers.get("Authorization");
  if (!SERVICE_ROLE_KEY || !SUPABASE_URL || auth !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const {
      childName,
      childAge,
      theme,
      strength,
      customerEmail,
      supportingCharacterName,
      pdfUrl,
      orderId,
    } = await req.json();

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const orderPageUrl = orderId
      ? `https://mestar.pro/order-complete?order_id=${orderId}`
      : pdfUrl;

    const templateData = {
      childName: String(childName ?? ""),
      childAge: String(childAge ?? ""),
      theme: String(theme ?? ""),
      strength: strength ? String(strength) : "",
      supportingCharacterName: supportingCharacterName ? String(supportingCharacterName) : "",
      pdfUrl: String(pdfUrl ?? ""),
      orderPageUrl: String(orderPageUrl ?? ""),
    };

    // ── 1. Customer delivery email via Lovable Emails ──
    if (customerEmail && String(customerEmail).includes("@")) {
      const { error: customerErr } = await supabase.functions.invoke(
        "send-transactional-email",
        {
          body: {
            templateName: "story-delivery",
            recipientEmail: customerEmail,
            idempotencyKey: `story-delivery-${orderId || crypto.randomUUID()}`,
            templateData,
          },
        }
      );
      if (customerErr) {
        console.error("Customer email send failed:", customerErr);
      } else {
        console.log("Customer delivery email enqueued for:", customerEmail);
      }
    } else {
      console.log("No customer email provided — skipping customer email");
    }

    // ── 2. Admin notification (also via Lovable Emails) ──
    const { error: adminErr } = await supabase.functions.invoke(
      "send-transactional-email",
      {
        body: {
          templateName: "story-delivery",
          recipientEmail: "mestar.orders@gmail.com",
          idempotencyKey: `story-delivery-admin-${orderId || crypto.randomUUID()}`,
          templateData: {
            ...templateData,
            childName: `[ADMIN] ${templateData.childName}`,
          },
        },
      }
    );
    if (adminErr) {
      console.error("Admin notification failed:", adminErr);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("send-order-notification error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Failed to send notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
