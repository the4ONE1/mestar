// TEMP one-shot test trigger. Background work + writes result to a known order row.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
};

const RESULT_ORDER_ID = "d696aab7-c3a2-42a6-a00f-da7cf8af7eed"; // Jaedan 11+ test order

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SRK = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(SUPABASE_URL, SRK);

  const payload = {
    childName: "Jaedan",
    childAge: "11+",
    theme: "Ocean Adventure & Pirates",
    strength: "brave",
    hasSupportingCharacter: false,
    supportingCharacterName: "",
    selectedAddons: { illustrations: true, coloring: true, character: false, audiobook: false },
  };

  // Mark started
  await supabase.from("storybook_orders").update({
    story_title: "[TEST-RUNNING] " + new Date().toISOString(),
  }).eq("id", RESULT_ORDER_ID);

  // Background work
  (globalThis as any).EdgeRuntime?.waitUntil?.((async () => {
    const t0 = Date.now();
    try {
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

      await supabase.from("storybook_orders").update({
        story_title: `[TEST-DONE] status=${res.status} wc=${wc} ms=${elapsedMs} title=${(parsed?.title || "").slice(0,80)}`,
        story_text: res.ok ? story : `ERROR ${res.status}: ${text.slice(0, 1000)}`,
      }).eq("id", RESULT_ORDER_ID);
    } catch (e) {
      await supabase.from("storybook_orders").update({
        story_title: `[TEST-FAILED] ${(e as Error).message}`,
      }).eq("id", RESULT_ORDER_ID);
    }
  })());

  return new Response(JSON.stringify({ started: true, resultOrderId: RESULT_ORDER_ID }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
