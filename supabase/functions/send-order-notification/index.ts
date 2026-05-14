import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getServerKeys(): string[] {
  const keys = [Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")];
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys);
      if (Array.isArray(parsed)) keys.push(...parsed);
      else if (typeof parsed === "string") keys.push(parsed);
      else if (parsed && typeof parsed === "object") keys.push(...Object.values(parsed).filter((value): value is string => typeof value === "string"));
    } catch {
      keys.push(...secretKeys.split(/[\n,]/));
    }
  }

  return keys.map((key) => key?.trim()).filter((key): key is string => Boolean(key));
}

function getInternalAuthKey(): string | null {
  return getServerKeys()[0] ?? null;
}

function isAuthorized(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  return getServerKeys().includes(token);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Service-role auth: this function is server-to-server only
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const INTERNAL_AUTH_KEY = getInternalAuthKey();
  const auth = req.headers.get("Authorization");
  if (!INTERNAL_AUTH_KEY || !SUPABASE_URL || !isAuthorized(auth)) {
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

    const supabase = createClient(SUPABASE_URL, INTERNAL_AUTH_KEY);

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

    const enqueueDeliveryEmail = async (
      recipientEmail: string,
      idempotencyKey: string,
      data: Record<string, string>,
    ) => {
      return fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INTERNAL_AUTH_KEY}`,
        },
        body: JSON.stringify({
          templateName: "story-delivery",
          recipientEmail,
          idempotencyKey,
          templateData: data,
        }),
      });
    };

    // ── 1. Customer delivery email via Lovable Emails ──
    if (customerEmail && String(customerEmail).includes("@")) {
      const customerRes = await enqueueDeliveryEmail(
        customerEmail,
        `story-delivery-${orderId || crypto.randomUUID()}`,
        templateData,
      );
      if (!customerRes.ok) {
        console.error("Customer email enqueue failed:", await customerRes.text());
      } else {
        console.log("Customer delivery email enqueued for:", customerEmail);
      }
    } else {
      console.log("No customer email provided — skipping customer email");
    }

    // ── 2. Admin notification (also via Lovable Emails) ──
    const adminRes = await enqueueDeliveryEmail(
      "mestar.orders@gmail.com",
      `story-delivery-admin-${orderId || crypto.randomUUID()}`,
      {
        ...templateData,
        childName: `[ADMIN] ${templateData.childName}`,
      },
    );
    if (!adminRes.ok) {
      console.error("Admin notification enqueue failed:", await adminRes.text());
    }

    // Try to process the queue immediately; the scheduled worker remains as backup.
    const queueRes = await fetch(`${SUPABASE_URL}/functions/v1/process-email-queue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${INTERNAL_AUTH_KEY}`,
      },
      body: "{}",
    });
    if (!queueRes.ok) {
      console.error("Immediate email queue processing failed:", await queueRes.text());
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
