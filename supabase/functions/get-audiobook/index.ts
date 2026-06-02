// Public endpoint that returns the karaoke audiobook data for an order.
// No auth required — the order ID is an unguessable UUID and the function
// only returns data for completed orders that included the audiobook add-on.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId")?.trim();
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    return new Response(JSON.stringify({ error: "Invalid orderId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Validate the order: must exist, be complete, and have audiobook addon
  const { data: order, error: orderErr } = await supabase
    .from("storybook_orders")
    .select("id, status, story_title, child_name, selected_addons")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const addons = (order.selected_addons as Record<string, boolean>) || {};
  if (!addons.audiobook) {
    return new Response(
      JSON.stringify({ error: "Audiobook was not purchased for this order" }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Load pages
  const { data: pages, error: pagesErr } = await supabase
    .from("storybook_audio")
    .select("page_number, page_text, audio_storage_path, word_timings")
    .eq("order_id", orderId)
    .order("page_number", { ascending: true });

  if (pagesErr) {
    return new Response(JSON.stringify({ error: pagesErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Sign URLs (1 hour expiry) for each page that has audio
  const signedPages = [];
  let readyCount = 0;
  for (const p of pages || []) {
    let audioUrl: string | null = null;
    if (p.audio_storage_path) {
      const { data: signed } = await supabase.storage
        .from("storybooks")
        .createSignedUrl(p.audio_storage_path, 60 * 60);
      audioUrl = signed?.signedUrl ?? null;
      if (audioUrl) readyCount++;
    }
    signedPages.push({
      pageNumber: p.page_number,
      text: p.page_text,
      audioUrl,
      wordTimings: p.word_timings || [],
    });
  }

  const totalPages = signedPages.length;
  const status =
    totalPages === 0
      ? "pending"
      : readyCount === totalPages
        ? "ready"
        : readyCount === 0
          ? "pending"
          : "partial";

  return new Response(
    JSON.stringify({
      orderId,
      storyTitle: order.story_title,
      childName: order.child_name,
      status,
      readyPages: readyCount,
      totalPages,
      pages: signedPages,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
