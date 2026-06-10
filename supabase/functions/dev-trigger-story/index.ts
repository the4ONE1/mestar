// TEMP one-shot test trigger. Safe to delete after use.
// Calls generate-story using the deployed env's own service role key.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const payload = {
    childName: "Jaedan",
    childAge: "11+",
    theme: "Ocean Adventure & Pirates",
    strength: "brave",
    hasSupportingCharacter: false,
    supportingCharacterName: "",
    selectedAddons: { illustrations: true, coloring: true, character: false, audiobook: false },
  };

  const t0 = Date.now();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SRK}`,
      "apikey": SRK,
    },
    body: JSON.stringify(payload),
  });
  const elapsedMs = Date.now() - t0;
  const text = await res.text();
  let parsed: any = null;
  try { parsed = JSON.parse(text); } catch {}

  const story: string = parsed?.story || "";
  const wc = story.trim().split(/\s+/).filter(Boolean).length;

  return new Response(JSON.stringify({
    status: res.status,
    elapsedMs,
    title: parsed?.title,
    wordCount: wc,
    target: "1600-2000",
    hit: wc >= 1600 && wc <= 2000,
    preview: story.slice(0, 400),
    ending: story.slice(-400),
    rawIfError: res.ok ? undefined : text.slice(0, 500),
  }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
