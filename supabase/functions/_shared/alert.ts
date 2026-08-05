// Fire-and-forget owner alert (email + SMS) from any edge function.
// Never throws — alerting must never break a customer order.
export async function sendOwnerAlert(opts: {
  key: string;
  subject: string;
  smsText?: string;
  details?: string;
  severity?: "critical" | "warn" | "info";
  throttleMinutes?: number;
  sms?: boolean;
}): Promise<void> {
  try {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceRole) return;
    await fetch(`${url}/functions/v1/alert-notify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRole}`,
      },
      body: JSON.stringify(opts),
    });
  } catch (e) {
    console.error("sendOwnerAlert failed (ignored):", e);
  }
}
