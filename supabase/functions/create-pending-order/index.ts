import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

function dataUrlToBytes(dataUrl: string): { bytes: Uint8Array; mime: string } | null {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl || "");
  if (!m) return null;
  const mime = m[1].toLowerCase();
  if (!ALLOWED_MIME.has(mime)) return null;
  try {
    const bin = atob(m[2]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    if (bytes.length > MAX_BYTES) return null;
    return { bytes, mime };
  } catch {
    return null;
  }
}

function extForMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const childName = typeof body.childName === "string" ? body.childName.trim() : "";
  const childAge = typeof body.childAge === "string" && body.childAge.trim() ? body.childAge.trim() : "4-7";
  const theme = typeof body.theme === "string" ? body.theme.trim() : "";
  const strength = typeof body.strength === "string" ? body.strength.trim() : null;
  const supportingCharacterName = typeof body.supportingCharacterName === "string" ? body.supportingCharacterName.trim() : null;
  const customerEmail = typeof body.customerEmail === "string" ? body.customerEmail.trim().toLowerCase() : "";

  if (!childName || childName.length > 100) {
    return new Response(JSON.stringify({ error: "Invalid child name" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!childAge || childAge.length > 20) {
    return new Response(JSON.stringify({ error: "Invalid child age" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (!theme || theme.length > 200) {
    return new Response(JSON.stringify({ error: "Invalid theme" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (strength && strength.length > 200) {
    return new Response(JSON.stringify({ error: "Invalid strength" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (supportingCharacterName && supportingCharacterName.length > 100) {
    return new Response(JSON.stringify({ error: "Invalid supporting character name" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (customerEmail && (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customerEmail) || customerEmail.length > 254)) {
    return new Response(JSON.stringify({ error: "Invalid customer email" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // 1. Create the pending order first (no photo paths yet) so we get an orderId.
  // Email is optional here because Stripe can collect it during checkout.
  const { data: insertedOrder, error } = await supabase
    .from("storybook_orders")
    .insert({
      child_name: childName,
      child_age: childAge,
      theme,
      strength,
      supporting_character_name: supportingCharacterName || null,
      has_supporting_character: !!body.hasSupportingCharacter,
      selected_addons: body.selectedAddons || {},
      customer_email: customerEmail || null,
      status: "pending_payment",
      child_photo_path: null,
      supporting_character_photo_path: null,
    })
    .select("id")
    .maybeSingle();

  const orderId = insertedOrder?.id;

  if (error || !orderId) {
    console.error("create_pending_order failed:", error);
    return new Response(JSON.stringify({ error: error?.message || "failed" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // 2. Upload photos server-side using the orderId as the filename prefix.
  const uploads: { field: "child_photo_path" | "supporting_character_photo_path"; label: "child" | "supporting"; dataUrl?: string }[] = [
    { field: "child_photo_path", label: "child", dataUrl: body.childPhotoDataUrl as string | undefined },
    { field: "supporting_character_photo_path", label: "supporting", dataUrl: body.supportingCharacterPhotoDataUrl as string | undefined },
  ];

  const updates: Record<string, string> = {};
  for (const u of uploads) {
    if (!u.dataUrl) continue;
    const parsed = dataUrlToBytes(u.dataUrl);
    if (!parsed) {
      console.warn(`skipping ${u.label} photo: invalid or too large`);
      continue;
    }
    const path = `${orderId}-${u.label}.${extForMime(parsed.mime)}`;
    const { error: upErr } = await supabase.storage
      .from("customer-photos")
      .upload(path, parsed.bytes, { contentType: parsed.mime, upsert: true });
    if (upErr) {
      console.error(`upload ${u.label} failed:`, upErr);
      continue;
    }
    updates[u.field] = path;
  }

  if (Object.keys(updates).length > 0) {
    const { error: updErr } = await supabase
      .from("storybook_orders")
      .update(updates)
      .eq("id", orderId);
    if (updErr) console.error("attach photo paths failed:", updErr);
  }

  // Return recovery_token so the client can hold it as a per-order access
  // secret (used to authorize /library audiobook access).
  const { data: tokenRow } = await supabase
    .from("storybook_orders")
    .select("recovery_token")
    .eq("id", orderId)
    .maybeSingle();

  return new Response(JSON.stringify({ orderId, recoveryToken: tokenRow?.recovery_token ?? null }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
