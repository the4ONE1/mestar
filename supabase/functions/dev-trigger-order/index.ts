// Dev-only end-to-end order trigger. (v2 - auth disabled for demo)
// Mirrors what the Shopify "order paid" webhook does, minus Shopify:
//   1. Create a storybook_orders row (forces audiobook = true by default)
//   2. Call generate-story
//   3. Call create-storybook (which auto-fires generate-audiobook)
//
// Requires Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY or any configured server key>
// so the browser can never invoke it without the service key.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function getServerKeys(): string[] {
  const keys: (string | undefined)[] = [
    Deno.env.get("LOVABLE_API_KEY"),
    SUPABASE_SERVICE_ROLE_KEY,
  ];
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const parsed = JSON.parse(secretKeys);
      if (Array.isArray(parsed)) keys.push(...parsed);
      else if (typeof parsed === "string") keys.push(parsed);
      else if (parsed && typeof parsed === "object")
        keys.push(...Object.values(parsed).filter((v): v is string => typeof v === "string"));
    } catch {
      keys.push(...secretKeys.split(/[\n,]/));
    }
  }
  return keys.map((k) => k?.trim()).filter((k): k is string => Boolean(k));
}

function isAuthorized(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice("Bearer ".length).trim();
  const keys = getServerKeys();
  return keys.length > 0 && keys.includes(token);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  if (!isAuthorized(req.headers.get("Authorization"))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const body = await req.json().catch(() => ({}));
    const {
      childName = "Test Kid",
      childAge = "8-10",
      childGender = "boy",
      theme = "space adventure",
      strength = "courage",
      hasSupportingCharacter = false,
      supportingCharacterName = "",
      customerEmail = "dev-test@mestar.pro",
      forceAudiobook = true,
      forceIllustrations = true,
      forceColoring = false,
    } = body || {};

    const selectedAddons = {
      illustrations: !!forceIllustrations,
      coloring: !!forceColoring,
      character: false,
      audiobook: !!forceAudiobook,
    };

    // 1. Create order row
    const { data: order, error: orderError } = await supabase
      .from("storybook_orders")
      .insert({
        customer_email: String(customerEmail).toLowerCase(),
        child_name: childName,
        child_age: childAge,
        theme,
        strength: strength || null,
        has_supporting_character: !!hasSupportingCharacter,
        supporting_character_name: supportingCharacterName || null,
        selected_addons: selectedAddons,
        status: "dev_test",
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order insert failed:", orderError);
      return new Response(JSON.stringify({ error: "Failed to create test order", detail: orderError?.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderId = order.id as string;
    console.log("dev-trigger-order: created", orderId);

    // 2. generate-story
    await supabase
      .from("storybook_orders")
      .update({ status: "generating_story" })
      .eq("id", orderId);

    const storyRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        childName,
        childAge,
        childGender,
        theme,
        strength,
        hasSupportingCharacter,
        supportingCharacterName,
        selectedAddons,
      }),
    });

    if (!storyRes.ok) {
      const errText = await storyRes.text();
      await supabase
        .from("storybook_orders")
        .update({ status: "failed", error_message: `generate-story: ${errText}` })
        .eq("id", orderId);
      return new Response(JSON.stringify({ error: "generate-story failed", detail: errText, orderId }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const story = await storyRes.json();

    await supabase
      .from("storybook_orders")
      .update({
        status: "generating_images",
        story_title: story.title,
        story_text: story.story,
      })
      .eq("id", orderId);

    // 3. create-storybook (this fires generate-audiobook internally when addon set)
    const pdfRes = await fetch(`${SUPABASE_URL}/functions/v1/create-storybook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        orderId,
        title: story.title,
        story: story.story,
        coloringPrompts: story.coloringPrompts || [],
      bonusColoringPrompts: story.bonusColoringPrompts || [],
        illustrationPrompts:
          (story.illustrationPrompts && story.illustrationPrompts.length
            ? story.illustrationPrompts
            : story.scenes) || [],
        selectedAddons,
        customerEmail,
        childName,
        childAge,
        theme,
        strength,
        hasSupportingCharacter,
        supportingCharacterName,
      }),
    });

    if (!pdfRes.ok) {
      const errText = await pdfRes.text();
      await supabase
        .from("storybook_orders")
        .update({ status: "failed", error_message: `create-storybook: ${errText}` })
        .eq("id", orderId);
      return new Response(JSON.stringify({ error: "create-storybook failed", detail: errText, orderId }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pdfData = await pdfRes.json();

    return new Response(
      JSON.stringify({
        ok: true,
        orderId,
        libraryUrl: `/library/${orderId}`,
        title: story.title,
        pdfUrl: pdfData.pdfUrl,
        audiobookQueued: selectedAddons.audiobook,
        note: "Audiobook generation runs in the background; check /library/<orderId> in ~30s.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("dev-trigger-order error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
