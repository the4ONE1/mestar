// Fulfils add-ons purchased AFTER the base storybook payment (the upsell page).
//
// The base payment fires the generation pipeline immediately. If the customer then
// buys the audiobook or the bonus coloring book on the upsell page, that purchase
// lands while the story is generating (or after it finished), so nothing would ever
// produce the paid content. This function closes that gap:
//
//   audiobook  -> seed storybook_audio page rows + fire generate-audiobook
//   coloring   -> rebuild the PDF via create-storybook so the 8 bonus pages exist
//
// It waits for the base generation to reach a terminal state first, and is
// idempotent via selected_addons.addonFulfillment.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IN_FLIGHT = ["pending_payment", "pending", "queued", "generating_story", "generating_images", "assembling_pdf"];

function svc() {
  return createClient(SUPABASE_URL, SERVICE_ROLE);
}

// Mirrors create-storybook's page splitting so audio pages line up with the PDF.
function splitStoryIntoPages(story: string, pages: number): string[] {
  const sentences = story.match(/[^.!?]+[.!?]+(\s|$)/g) || [story];
  const perPage = Math.ceil(sentences.length / pages);
  const chunks: string[] = [];
  for (let i = 0; i < pages; i++) {
    chunks.push(sentences.slice(i * perPage, (i + 1) * perPage).join("").trim());
  }
  return chunks.filter(Boolean);
}

async function waitForBaseGeneration(orderId: string) {
  for (let i = 0; i < 30; i++) {
    const { data } = await svc()
      .from("storybook_orders")
      .select("status")
      .eq("id", orderId)
      .maybeSingle();
    const status = String((data as any)?.status || "");
    if (!IN_FLIGHT.includes(status)) return status;
    await new Promise((r) => setTimeout(r, 8000));
  }
  return "timeout";
}

export async function fulfillAddons(orderId: string) {
  const supabase = svc();
  const finalStatus = await waitForBaseGeneration(orderId);

  const { data: order } = await supabase
    .from("storybook_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) throw new Error(`Order ${orderId} not found`);

  const addons = ((order as any).selected_addons || {}) as Record<string, any>;
  const fulfilled = (addons.addonFulfillment || {}) as Record<string, boolean>;
  const done: string[] = [];

  // ── Bonus coloring book: needs the PDF rebuilt with the extra pages ──
  if (addons.coloring && !fulfilled.coloring && (order as any).story_text) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/create-storybook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
      body: JSON.stringify({
        orderId,
        reuseImages: true,
        title: (order as any).story_title,
        story: (order as any).story_text,
        coloringPrompts: (order as any).coloring_prompts || [],
        bonusColoringPrompts: [],
        illustrationPrompts: (order as any).illustration_prompts || [],
        selectedAddons: { ...addons, coloring: true },
        customerEmail: (order as any).customer_email,
        childName: (order as any).child_name,
        childAge: (order as any).child_age,
        theme: (order as any).theme,
        strength: (order as any).strength,
        hasSupportingCharacter: (order as any).has_supporting_character,
        supportingCharacterName: (order as any).supporting_character_name,
      }),
    });
    if (!res.ok) {
      console.error("fulfill-addons coloring rebuild failed:", await res.text());
    } else {
      done.push("coloring");
    }
    // create-storybook also seeds audio when the audiobook add-on is present,
    // so re-read fulfillment state below rather than double-firing.
  }

  // ── Audiobook: seed pages + fire TTS if not already done ──
  const { data: refreshed } = await supabase
    .from("storybook_orders")
    .select("selected_addons, story_text")
    .eq("id", orderId)
    .maybeSingle();
  const addons2 = ((refreshed as any)?.selected_addons || addons) as Record<string, any>;
  const fulfilled2 = (addons2.addonFulfillment || {}) as Record<string, boolean>;

  if (addons2.audiobook && !fulfilled2.audiobook) {
    const { count } = await supabase
      .from("storybook_audio")
      .select("id", { count: "exact", head: true })
      .eq("order_id", orderId);

    if ((count || 0) === 0) {
      const story = String((refreshed as any)?.story_text || (order as any).story_text || "");
      const pages = splitStoryIntoPages(story, 5);
      if (pages.length) {
        const { error } = await supabase.from("storybook_audio").insert(
          pages.map((text, i) => ({ order_id: orderId, page_number: i + 1, page_text: text })),
        );
        if (error) console.error("fulfill-addons audio seed failed:", error);
      }
    }

    await fetch(`${SUPABASE_URL}/functions/v1/generate-audiobook`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
      body: JSON.stringify({ orderId }),
    }).catch((e) => console.error("generate-audiobook trigger failed:", e));
    done.push("audiobook");
  }

  const finalAddons = {
    ...addons2,
    addonFulfillment: {
      ...(addons2.addonFulfillment || {}),
      ...(done.includes("coloring") && { coloring: true }),
      ...(done.includes("audiobook") && { audiobook: true }),
    },
  };
  await supabase.from("storybook_orders").update({ selected_addons: finalAddons }).eq("id", orderId);

  return { orderId, baseStatus: finalStatus, fulfilled: done };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const auth = req.headers.get("Authorization") || "";
  if (auth !== `Bearer ${SERVICE_ROLE}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId)) throw new Error("valid orderId required");
    const result = await fulfillAddons(orderId);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fulfill-addons error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
