import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import nodemailer from "npm:nodemailer@6.9.12";

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
  const auth = req.headers.get("Authorization");
  if (!SERVICE_ROLE_KEY || auth !== `Bearer ${SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!GMAIL_APP_PASSWORD) {
    return new Response(
      JSON.stringify({ error: "Gmail not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // HTML-escape user-supplied values before interpolating into the email template
  const esc = (v: unknown): string =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  try {
    const {
      childName: childNameRaw,
      childAge: childAgeRaw,
      theme: themeRaw,
      strength: strengthRaw,
      customerEmail,
      supportingCharacterName: supportingCharacterNameRaw,
      pdfUrl,
      orderId,
    } = await req.json();

    const childName = String(childNameRaw ?? "");
    const childAge = String(childAgeRaw ?? "");
    const theme = String(themeRaw ?? "");
    const strength = strengthRaw ? String(strengthRaw) : "";
    const supportingCharacterName = supportingCharacterNameRaw ? String(supportingCharacterNameRaw) : "";

    // HTML-escaped versions for use inside customerHtml only
    const eChildName = esc(childName);
    const eChildAge = esc(childAge);
    const eTheme = esc(theme);
    const eStrength = strength ? esc(strength) : "";
    const eSupportingCharacterName = supportingCharacterName ? esc(supportingCharacterName) : "";
    const eOrderPageUrlSafe = (url: string) => esc(url);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "mestar.orders@gmail.com",
        pass: GMAIL_APP_PASSWORD,
      },
    });

    // ── 1. Admin notification ──
    const adminSubject = `New MESTAR Order — ${childName}'s Storybook Ready`;
    const adminBody = `
New Storybook Order!
====================

Order ID: ${orderId || "N/A"}
Customer Email: ${customerEmail || "Not provided"}

Child's Name: ${childName}
Child's Age: ${childAge}
Theme: ${theme}
Strength: ${strength || "Not specified"}
Supporting Character: ${supportingCharacterName || "None"}

📥 Download PDF:
${pdfUrl}

---
This is an automated notification from MESTAR.
`;

    await transporter.sendMail({
      from: "mestar.orders@gmail.com",
      to: "mestar.orders@gmail.com",
      subject: adminSubject,
      text: adminBody,
    });
    console.log("Admin notification sent");

    // ── 2. Customer email (only if we have a valid email) ──
    if (customerEmail && customerEmail.includes("@")) {
      const customerSubject = `${childName}'s Personalized Storybook is Ready! ⭐`;
      const orderPageUrl = orderId
        ? `https://mestar.pro/order-complete?order_id=${orderId}`
        : pdfUrl;

      const customerHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; background: #ffffff;">
  <div style="text-align: center; padding: 16px 0;">
    <h1 style="font-size: 28px; margin: 0 0 8px;">⭐ ${childName}'s Storybook is Ready!</h1>
    <p style="color: #666; margin: 0;">Your personalized MESTAR storybook has been created.</p>
  </div>

  <div style="background: #f8f5ff; border: 1px solid #e7dfff; border-radius: 16px; padding: 28px; text-align: center; margin: 24px 0;">
    <p style="font-size: 16px; margin: 0 0 20px;">Click below to view and download your PDF:</p>
    <a href="${orderPageUrl}"
       style="display: inline-block; background: #6d28d9; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
      📖 View Your Storybook
    </a>
    <p style="font-size: 13px; color: #888; margin: 20px 0 0;">
      Or paste this link in your browser:<br/>
      <a href="${orderPageUrl}" style="color: #6d28d9; word-break: break-all;">${orderPageUrl}</a>
    </p>
  </div>

  <div style="background: #f5f5f5; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <h3 style="margin: 0 0 12px; font-size: 16px;">What's inside:</h3>
    <ul style="margin: 0; padding-left: 20px; color: #444;">
      <li>A unique story written just for ${childName}</li>
      <li>Beautiful personalized illustrations</li>
      <li>Bonus coloring pages (if included in your order)</li>
    </ul>
  </div>

  <div style="font-size: 14px; color: #555; padding: 0 8px;">
    <p style="margin: 0 0 8px;"><strong>Story details:</strong></p>
    <p style="margin: 4px 0;">• Child's name: ${childName}</p>
    <p style="margin: 4px 0;">• Age group: ${childAge}</p>
    <p style="margin: 4px 0;">• Theme: ${theme}</p>
    ${strength ? `<p style="margin: 4px 0;">• Featured strength: ${strength}</p>` : ""}
    ${supportingCharacterName ? `<p style="margin: 4px 0;">• Supporting character: ${supportingCharacterName}</p>` : ""}
  </div>

  <p style="font-size: 13px; color: #888; text-align: center; margin: 32px 0 8px;">
    💡 Tip: Save the PDF to your device or print it out — the download link is valid for 7 days.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0 16px;"/>
  <p style="font-size: 13px; color: #888; text-align: center; margin: 0;">
    Thank you for choosing MESTAR!<br/>
    Questions? Just reply to this email.
  </p>
</body>
</html>
`;

      const customerText = `Hi there!

${childName}'s personalized MESTAR storybook is ready.

👉 View and download your PDF here:
${orderPageUrl}

This link is valid for 7 days, so save your PDF or print it out!

— The MESTAR Team`;

      await transporter.sendMail({
        from: "MESTAR <mestar.orders@gmail.com>",
        to: customerEmail,
        subject: customerSubject,
        text: customerText,
        html: customerHtml,
      });
      console.log("Customer email sent to:", customerEmail);
    } else {
      console.log("No customer email provided — skipping customer email");
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
