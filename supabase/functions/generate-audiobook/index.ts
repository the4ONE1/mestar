// Generates a karaoke-style audiobook for a storybook order.
// For each storybook_audio row (one per story page), calls ElevenLabs
// "with-timestamps" TTS, derives word-level timings, uploads the MP3 to
// the `storybooks` bucket, and writes the audio_storage_path + word_timings
// back to the row. Runs sequentially to stay within ElevenLabs rate limits
// and edge-function memory.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Universal female narrator — Sarah (warm, gentle, kid-friendly)
const VOICE_ID = "EXAVITQu4vr4xnSDxMaL";
const MODEL_ID = "eleven_turbo_v2_5";

interface WordTiming {
  word: string;
  start: number;
  end: number;
}

// Convert ElevenLabs character-level alignment into word-level timings
function charsToWords(
  characters: string[],
  startTimes: number[],
  endTimes: number[],
): WordTiming[] {
  const words: WordTiming[] = [];
  let current = "";
  let wordStart = 0;

  for (let i = 0; i < characters.length; i++) {
    const c = characters[i];
    const isSpace = /\s/.test(c);

    if (isSpace) {
      if (current.length > 0) {
        words.push({
          word: current,
          start: wordStart,
          end: endTimes[i - 1] ?? startTimes[i] ?? wordStart,
        });
        current = "";
      }
    } else {
      if (current.length === 0) {
        wordStart = startTimes[i] ?? 0;
      }
      current += c;
    }
  }

  if (current.length > 0) {
    words.push({
      word: current,
      start: wordStart,
      end: endTimes[endTimes.length - 1] ?? wordStart,
    });
  }

  return words;
}

function getServerKeys(): string[] {
  const keys = [
    Deno.env.get("LOVABLE_API_KEY"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  ];
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys);
      if (Array.isArray(parsed)) keys.push(...parsed);
    } catch {
      keys.push(...secretKeys.split(/[\n,]/));
    }
  }
  return keys.map((k) => k?.trim()).filter((k): k is string => Boolean(k));
}

function isAuthorized(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  return getServerKeys().includes(token);
}

async function synthesizePage(
  text: string,
  apiKey: string,
): Promise<{ audio: Uint8Array; words: WordTiming[] } | null> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/with-timestamps?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true,
          speed: 0.95,
        },
      }),
    },
  );

  if (!res.ok) {
    console.error("ElevenLabs TTS failed:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  const b64 = data.audio_base64 as string | undefined;
  const alignment = data.alignment || data.normalized_alignment;
  if (!b64 || !alignment) {
    console.error("Missing audio_base64 or alignment from ElevenLabs");
    return null;
  }

  // Decode base64 → bytes
  const binary = atob(b64);
  const audio = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) audio[i] = binary.charCodeAt(i);

  const words = charsToWords(
    alignment.characters || [],
    alignment.character_start_times_seconds || [],
    alignment.character_end_times_seconds || [],
  );

  return { audio, words };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!isAuthorized(req.headers.get("Authorization"))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!ELEVENLABS_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Server configuration error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) {
    return new Response(JSON.stringify({ error: "Missing orderId" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Load seeded audio rows for this order
  const { data: rows, error: fetchErr } = await supabase
    .from("storybook_audio")
    .select("id, page_number, page_text, audio_storage_path")
    .eq("order_id", orderId)
    .order("page_number", { ascending: true });

  if (fetchErr) {
    console.error("Failed to load storybook_audio rows:", fetchErr);
    return new Response(JSON.stringify({ error: fetchErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!rows || rows.length === 0) {
    return new Response(
      JSON.stringify({ ok: true, skipped: "no_audio_rows" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  let generated = 0;
  let failed = 0;

  for (const row of rows) {
    // Skip already-generated pages (idempotent retry)
    if (row.audio_storage_path) {
      continue;
    }

    const text = (row.page_text || "").trim();
    if (!text) {
      failed++;
      continue;
    }

    console.log(`Generating audio for order ${orderId} page ${row.page_number}`);
    const result = await synthesizePage(text, ELEVENLABS_API_KEY);
    if (!result) {
      failed++;
      continue;
    }

    const path = `${orderId}/audio/page-${row.page_number}.mp3`;
    const { error: upErr } = await supabase.storage
      .from("storybooks")
      .upload(path, result.audio, {
        contentType: "audio/mpeg",
        upsert: true,
      });

    if (upErr) {
      console.error(`Audio upload failed for page ${row.page_number}:`, upErr);
      failed++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from("storybook_audio")
      .update({
        audio_storage_path: path,
        word_timings: result.words,
      })
      .eq("id", row.id);

    if (updateErr) {
      console.error(`DB update failed for page ${row.page_number}:`, updateErr);
      failed++;
      continue;
    }

    generated++;
  }

  console.log(`Audiobook done for ${orderId}: ${generated} pages generated, ${failed} failed`);

  return new Response(
    JSON.stringify({ ok: true, orderId, generated, failed, total: rows.length }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
