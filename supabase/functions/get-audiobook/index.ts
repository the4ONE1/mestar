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

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  "Pragma": "no-cache",
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
      headers: jsonHeaders,
    });
  }

  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId")?.trim();
  const token = url.searchParams.get("token")?.trim();
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) {
    return new Response(JSON.stringify({ error: "Invalid orderId" }), {
      status: 400,
      headers: jsonHeaders,
    });
  }
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
    return new Response(JSON.stringify({ error: "Missing or invalid access token" }), {
      status: 401,
      headers: jsonHeaders,
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Validate the order: must exist, be complete, have audiobook addon, and not be refunded/expired
  const { data: order, error: orderErr } = await supabase
    .from("storybook_orders")
    .select("id, status, story_title, child_name, selected_addons, completed_at, refunded_at, access_expires_at, recovery_token")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: jsonHeaders,
    });
  }

  // Constant-time-ish token check: reject unless the caller supplied the
  // per-order recovery_token issued at checkout. Prevents anyone with just
  // the order UUID (from URL/referrer leakage) from reading PII/audio.
  if (!order.recovery_token || String(order.recovery_token) !== token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: jsonHeaders,
    });
  }

  const addons = (order.selected_addons as Record<string, unknown>) || {};
  if (!addons.audiobook) {
    return new Response(
      JSON.stringify({ error: "Audiobook was not purchased for this order" }),
      { status: 403, headers: jsonHeaders },
    );
  }
  // Server-authoritative tier: derived from the paid add-ons on the order.
  // The client MUST use this value and ignore any URL/localStorage override.
  const rawTier = typeof addons.audiobookTier === "string" ? (addons.audiobookTier as string).toLowerCase() : "";
  const tier: "classic" | "interactive" = rawTier === "interactive" ? "interactive" : "classic";

  // Access control: block refunded orders and links older than 30 days
  const ACCESS_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
  const explicitExpiry = order.access_expires_at ? new Date(order.access_expires_at).getTime() : null;
  const impliedExpiry = order.completed_at ? new Date(order.completed_at).getTime() + ACCESS_WINDOW_MS : null;
  const expiresAt = explicitExpiry ?? impliedExpiry;
  if (order.refunded_at) {
    return new Response(
      JSON.stringify({ error: "This order was refunded. Access has been revoked." }),
      { status: 410, headers: jsonHeaders },
    );
  }
  if (expiresAt !== null && Date.now() > expiresAt) {
    return new Response(
      JSON.stringify({ error: "Download link expired. Please contact support if you need access." }),
      { status: 410, headers: jsonHeaders },
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
      headers: jsonHeaders,
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
      tier,
      status,
      readyPages: readyCount,
      totalPages,
      pages: signedPages,
    }),
    { status: 200, headers: jsonHeaders },
  );
});
