// Temporary dev-only trigger: calls generate-audiobook server-to-server using
// the deployed environment's SUPABASE_SERVICE_ROLE_KEY. Delete after testing.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const { orderId } = await req.json();

  const t0 = Date.now();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-audiobook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE}` },
    body: JSON.stringify({ orderId }),
  });
  const text = await res.text();
  return new Response(
    JSON.stringify({ status: res.status, ms: Date.now() - t0, body: text }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
