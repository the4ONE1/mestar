import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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

    const client = new SmtpClient();
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: "mestar.orders@gmail.com",
      password: GMAIL_APP_PASSWORD,
    });

    const subject = `New MESTAR Order — ${childName}'s Storybook Ready`;

    const body = `
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

    await client.send({
      from: "mestar.orders@gmail.com",
      to: "mestar.orders@gmail.com",
      subject,
      content: body,
    });

    await client.close();

    console.log("Order notification sent to mestar.orders@gmail.com");

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
