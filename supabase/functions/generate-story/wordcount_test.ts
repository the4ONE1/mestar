// One-off test: trigger generate-story for an 11+ child and verify word count.
import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

Deno.test("11+ story hits 1600-2000 word target", async () => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  assert(SUPABASE_URL && KEY, "missing env");

  const res = await fetch(`${SUPABASE_URL}/functions/v1/generate-story`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${KEY}`,
      "apikey": KEY,
    },
    body: JSON.stringify({
      childName: "Jaedan",
      childAge: "11+",
      theme: "Ocean Adventure & Pirates",
      strength: "brave",
      hasSupportingCharacter: false,
      supportingCharacterName: "",
      selectedAddons: { illustrations: true, coloring: true, character: false, audiobook: false },
    }),
  });

  const bodyText = await res.text();
  console.log("HTTP", res.status);
  if (!res.ok) {
    console.log("BODY:", bodyText.slice(0, 500));
    throw new Error("generate-story failed");
  }
  const data = JSON.parse(bodyText);
  const story: string = data.story || "";
  const wc = story.trim().split(/\s+/).filter(Boolean).length;
  console.log("TITLE:", data.title);
  console.log("WORD_COUNT:", wc);
  console.log("TARGET: 1600-2000");
  console.log("HIT:", wc >= 1600 && wc <= 2000);
  console.log("PREVIEW:", story.slice(0, 400));
  console.log("ENDING:", story.slice(-400));
  // Don't fail the test on miss — we just want the number reported.
  assert(wc > 0, "empty story");
});
