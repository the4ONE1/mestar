// Shared story-generation pipeline trigger. Used by the Stripe webhook, the
// checkout return-page fallback, and the stuck-order retry cron so all three
// entry points share one idempotency check and one call sequence instead of
// three copies drifting out of sync.
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export function svc() {
  return createClient(SUPABASE_URL, SERVICE_ROLE);
}

export async function triggerGenerationPipeline(orderId: string): Promise<void> {
  const supabase = svc();
  const { data: order, error } = await supabase
    .from("storybook_orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (error || !order) throw new Error(`Order ${orderId} not found`);

  // Idempotency — never regenerate completed orders. A previously failed or
  // stuck order is safe (and desirable) to retry.
  if (order.status === "complete") {
    console.log(`Order ${orderId} already complete — skipping`);
    return;
  }

  const selectedAddons = (order as any).selected_addons || {};
  await supabase
    .from("storybook_orders")
    .update({ status: "generating_story", error_message: null })
    .eq("id", orderId);

  const storyRes = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
    body: JSON.stringify({
      childName: (order as any).child_name,
      childAge: (order as any).child_age,
      childGender: (order as any).child_gender || "neutral",
      theme: (order as any).theme,
      strength: (order as any).strength,
      hasSupportingCharacter: (order as any).has_supporting_character,
      supportingCharacterName: (order as any).supporting_character_name,
      selectedAddons,
    }),
  });
  if (!storyRes.ok) {
    const t = await storyRes.text();
    await supabase.from("storybook_orders").update({ status: "failed", error_message: `generate-story: ${t}` }).eq("id", orderId);
    throw new Error(`generate-story ${storyRes.status}`);
  }
  const story = await storyRes.json();
  await supabase.from("storybook_orders").update({
    status: "generating_images", story_title: story.title, story_text: story.story,
  }).eq("id", orderId);

  const pdfRes = await fetch(`${SUPABASE_URL}/functions/v1/create-storybook`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_ROLE}` },
    body: JSON.stringify({
      orderId,
      title: story.title,
      story: story.story,
      coloringPrompts: story.coloringPrompts || [],
      bonusColoringPrompts: story.bonusColoringPrompts || [],
      illustrationPrompts: (story.illustrationPrompts?.length ? story.illustrationPrompts : story.scenes) || [],
      selectedAddons,
      customerEmail: (order as any).customer_email,
      childName: (order as any).child_name,
      childAge: (order as any).child_age,
      theme: (order as any).theme,
      strength: (order as any).strength,
      hasSupportingCharacter: (order as any).has_supporting_character,
      supportingCharacterName: (order as any).supporting_character_name,
    }),
  });
  if (!pdfRes.ok) {
    const t = await pdfRes.text();
    await supabase.from("storybook_orders").update({ status: "failed", error_message: `create-storybook: ${t}` }).eq("id", orderId);
    throw new Error(`create-storybook ${pdfRes.status}`);
  }
}
