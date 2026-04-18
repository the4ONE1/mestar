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

  const GMAIL_APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD");
  if (!GMAIL_APP_PASSWORD) {
    return new Response(
      JSON.stringify({ error: "Gmail not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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
      const customerBody = `
Hi there!

${childName}'s personalized MESTAR storybook is ready to download.

📥 Download your PDF here:
${pdfUrl}

This link is valid for 7 days, so save your PDF to your device or print it out!

What's inside:
- A unique story written just for ${childName}
- Beautiful illustrations
- Bonus coloring pages (if included in your order)

Story details:
- Child's name: ${childName}
- Age group: ${childAge}
- Theme: ${theme}
${strength ? `- Featured strength: ${strength}` : ""}
${supportingCharacterName ? `- Supporting character: ${supportingCharacterName}` : ""}

Thank you for choosing MESTAR! We hope this storybook becomes a treasured keepsake.

If you have any questions, just reply to this email.

— The MESTAR Team
`;

      await transporter.sendMail({
        from: "mestar.orders@gmail.com",
        to: customerEmail,
        subject: customerSubject,
        text: customerBody,
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
