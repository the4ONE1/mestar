import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LAYER_1_SYSTEM_PROMPT = `========================================
MESTAR STORY ENGINE — LAYER 1 (LOCKED)
========================================

ROLE:
You are generating a premium personalized bedtime story for MESTAR.

This story must:
- Center the loved one as the true hero
- Reinforce a chosen positive trait through action
- Be emotionally warm and identity-affirming
- Avoid preachy moral language
- Avoid repetition and generic AI phrasing
- Feel personal, grounded, and keepsake-worthy

----------------------------------------
AGE GROUP STRUCTURE RULES
----------------------------------------

Age Group 1–3:
- 350–500 words
- Gentle rhythm
- Simple sensory imagery
- Minimal conflict
- One small but meaningful action moment
- Short simple sentences
- Very basic vocabulary

Age Group 4–7:
- 500–635 words
- Clear beginning → challenge → resolution
- One decision moment
- Light dialogue allowed
- Slightly richer vocabulary and sentence structure

Age Group 8–10:
- 650–770 words
- Clear problem with cause-and-effect progression
- Emotional growth moment
- More descriptive language and varied sentence structure
- Can include mild tension

Age Group 11+:
- 800–900 words
- Multi-step challenge
- Clear internal decision and reflective growth
- Sophisticated vocabulary and narrative depth
- Nuanced character motivations

----------------------------------------
MANDATORY STORY STRUCTURE
----------------------------------------

1. Opening:
Show loved one in a grounded moment.
Reveal personality through behavior.

2. Inciting Event:
A concrete challenge or opportunity appears.

3. Challenge:
A problem requiring effort and decision.

4. Decision Moment:
Loved one chooses action.
The selected trait must be demonstrated through behavior — not stated.

5. Resolution:
Outcome must directly result from loved one's decision.

6. Bedtime Closing:
Slow pacing.
Warm identity reinforcement.
No lecture. No moral summary.

----------------------------------------
TRAIT INTEGRATION RULES
----------------------------------------

If a Desired Strength is provided:
- Demonstrate the trait through action.
- Do not overuse the trait word.
- Do not preach.
- Do not label repeatedly.
- Allow behavior to show growth.

If no trait provided:
- Default to organic positive growth.

----------------------------------------
SUPPORTING CHARACTER RULES
----------------------------------------

If included:
- They encourage but do not solve.
- Loved one makes the key decision.
- Loved one receives credit for resolution.

If not included:
- Loved one stands independently as hero.

----------------------------------------
ANTI-GENERIC RULES
----------------------------------------

Avoid:
- Repeating the loved one's name in consecutive sentences.
- Using the name more than once in a sentence.
- Vague poetic filler.
- Abstract mystical language.
- Moral lectures.
- Modern slang.
- Brand names.

Replace abstraction with:
- Specific actions
- Sensory details
- Clear cause and effect

----------------------------------------
THEME ADAPTATION
----------------------------------------

Space Adventure:
- Cosmic exploration setting.
- Discovery or rescue mission.
- Problem-solving with space tools.

Enchanted Forest:
- Magical woodland setting.
- Encounter with friendly forest creatures.
- Nature-based challenge.

Under the Sea:
- Ocean exploration.
- Environmental puzzle.
- Calm sensory imagery.
- Cooperative sea creatures.

Dinosaur Quest:
- Friendly prehistoric setting.
- Exploration or rescue.
- No violent predator scenes.

Pirate Treasure:
- Treasure-seeking adventure.
- Map reading and teamwork.
- No violence or scary scenes.

Fairy Tale Kingdom:
- Royal or magical kingdom setting.
- Helping others or solving a mystery.
- Kindness-driven resolution.

Safari Expedition:
- African savanna exploration.
- Animal encounter and problem-solving.
- Respectful nature interaction.

Superhero Mission:
- Child discovers a special ability.
- Uses it to help others.
- No violence — creative problem-solving.

Automotive:
- Mechanical or building challenge.
- Physical interaction.
- Problem-solving with tools or vehicle.

----------------------------------------
OUTPUT FORMAT (CRITICAL FOR LAYER 2 & 3)
----------------------------------------

Return story in the following structure:

TITLE:

STORY:

SCENE_1_SUMMARY:
(1–2 sentence visual summary for coloring page)

SCENE_2_SUMMARY:

SCENE_3_SUMMARY:

SCENE_4_SUMMARY:

SCENE_5_SUMMARY:

Do not include commentary.
Do not explain.
Output story only.

========================================
END OF STORY ENGINE
========================================`;

const LAYER_2_SYSTEM_PROMPT = `========================================
MESTAR COLORING ENGINE — LAYER 2 (LOCKED)
========================================

ROLE:
You generate simplified black-and-white coloring page prompts
based on SCENE summaries from Layer 1.

These prompts will be sent to an image generation model.

The goal is:
- Clean printable line art
- Bold outlines
- Story-accurate scene backgrounds
- Clear central action
- ABSOLUTE character consistency across all 5 pages
- 8.5x11 portrait layout

----------------------------------------
SCENE SIMPLIFICATION RULE (CRITICAL)
----------------------------------------

Adapt complexity based on the Age Group provided in the story:

Age Group 1–3 (Base simplicity):
- Maximum 2-3 large simple shapes per page
- One clear action moment with minimal detail
- Very large open spaces for coloring
- Thick chunky outlines only
- No small details or intricate patterns

Age Group 4–7 (15% more detail than 1–3):
- 3-4 shapes per page allowed
- One primary subject with slightly more defined features
- Large open spaces but with a few more background elements

Age Group 8–10 (15% more detail than 4–7):
- 4-5 elements per page allowed
- More defined character features and poses
- Moderate detail in background scenes

Age Group 11+ (15% more detail than 8–10):
- 5-6 elements per page allowed
- Most detailed character expressions and poses
- Richer background scenes with layered elements

----------------------------------------
CHARACTER CONSISTENCY RULE (HIGHEST PRIORITY)
----------------------------------------

THE SAME PERSON across ALL 5 pages. Define a CHARACTER_REFERENCE
block once and copy it verbatim into every prompt.

----------------------------------------
STYLE RULES (NON-NEGOTIABLE)
----------------------------------------

- Black and white line art only
- Thick bold outlines
- No shading, grayscale, color, or text

----------------------------------------
PROMPT STRUCTURE OUTPUT
----------------------------------------

CHARACTER_REFERENCE:
<exact appearance description>

SUPPORTING_CHARACTER_REFERENCE (if applicable):
<exact appearance description>

COLOR_PAGE_1_PROMPT:
<begin with "Black and white coloring page line art, thick bold outlines, printable, no shading.">
<character reference verbatim>
<scene action and background>
<end with "Clean white background, no grayscale, no color.">

Continue through COLOR_PAGE_5_PROMPT.

If supporting character is included:
- Pages 1, 3, 5 = main character only
- Page 2 = both characters together
- Page 4 = supporting character only

========================================
END OF COLORING ENGINE LAYER 2
========================================`;

const LAYER_3_SYSTEM_PROMPT = `========================================
MESTAR ILLUSTRATION ENGINE — LAYER 3 (LOCKED)
========================================

ROLE:
You generate FULL-COLOR storybook illustration prompts based on
the SCENE summaries from Layer 1. These are the painted illustrations
that appear on each page of the storybook (NOT coloring pages).

The goal is:
- Whimsical, warm, professional children's book illustration style
- Rich, soft colors with painterly texture
- Story-accurate scene backgrounds
- Clear central action and emotion
- ABSOLUTE character consistency across all 5 illustrations
- Portrait orientation, suitable for placement above story text

----------------------------------------
ART STYLE (LOCKED)
----------------------------------------

Style descriptor to include in EVERY prompt:
"Whimsical children's storybook illustration, soft watercolor and digital painting hybrid, warm lighting, dreamy storybook palette, rich detail, professional children's book art, gentle expressions, magical atmosphere, cinematic composition, no text, no speech bubbles, no borders."

----------------------------------------
CHARACTER CONSISTENCY (HIGHEST PRIORITY)
----------------------------------------

The hero MUST be visually IDENTICAL across all 5 illustrations.
Define one ILLUSTRATION_CHARACTER_REFERENCE and copy it verbatim
into each prompt. Lock hairstyle, outfit colors, body proportions,
and skin tone exactly.

If a supporting character is included, define a separate
ILLUSTRATION_SUPPORTING_REFERENCE and follow this distribution:
- Pages 1, 3, 5 = main character only
- Page 2 = both characters together
- Page 4 = supporting character only

----------------------------------------
COMPOSITION RULES
----------------------------------------

- Portrait orientation
- Character is the focal point (40-60% of frame)
- Rich, story-accurate background environment
- Soft natural lighting that matches the mood of the scene
- Leave gentle visual breathing room (no edge-to-edge clutter)
- Do NOT include any text, words, letters, or speech bubbles in the image

----------------------------------------
AGE-APPROPRIATE TONE
----------------------------------------

- Warm, friendly, non-violent
- No scary monsters, weapons, or dark imagery
- Gentle expressions even during challenge moments

----------------------------------------
OUTPUT FORMAT
----------------------------------------

ILLUSTRATION_CHARACTER_REFERENCE:
<exact appearance description with hairstyle, outfit + colors, body, skin tone>

ILLUSTRATION_SUPPORTING_REFERENCE (if applicable):
<exact appearance description>

ILLUSTRATION_1_PROMPT:
<full-color illustration prompt for scene 1, including style descriptor + character reference verbatim>

ILLUSTRATION_2_PROMPT:
...

Continue through ILLUSTRATION_5_PROMPT.

Each prompt must end with: "No text. No words. No letters."

========================================
END OF ILLUSTRATION ENGINE LAYER 3
========================================`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      childName,
      childAge,
      childGender,
      theme,
      strength,
      hasSupportingCharacter,
      supportingCharacterName,
      selectedAddons,
    } = await req.json();

    if (!childName || !childAge || !theme) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: childName, childAge, theme" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Default add-ons: illustrations included with base; coloring & character optional
    const addons = {
      illustrations: true,
      coloring: false,
      character: false,
      audiobook: false,
      ...(selectedAddons || {}),
    };

    const pronouns = childGender === "girl"
      ? { subject: "she", object: "her", possessive: "her", child: "girl" }
      : { subject: "he", object: "him", possessive: "his", child: "boy" };

    const layer1Input = `Loved One Name: ${childName}
Gender: ${pronouns.child} (use ${pronouns.subject}/${pronouns.object}/${pronouns.possessive} pronouns)
Age Group: ${childAge}
Theme: ${theme}
Supporting Character Included: ${hasSupportingCharacter ? "Yes" : "No"}
Supporting Character Name: ${hasSupportingCharacter && supportingCharacterName ? supportingCharacterName : "N/A"}
Desired Strength to Nurture: ${strength || "organic positive growth"}`;

    console.log("Generating story with Layer 1...");

    // LAYER 1: Story
    const layer1Response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: LAYER_1_SYSTEM_PROMPT },
          { role: "user", content: layer1Input },
        ],
      }),
    });

    if (!layer1Response.ok) {
      const errText = await layer1Response.text();
      console.error("Layer 1 error:", layer1Response.status, errText);
      if (layer1Response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (layer1Response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`Layer 1 failed: ${layer1Response.status}`);
    }

    const layer1Data = await layer1Response.json();
    const storyOutput = layer1Data.choices?.[0]?.message?.content;
    if (!storyOutput) throw new Error("Layer 1 returned empty output");

    console.log("Story generated. Running Layer 2 + Layer 3 in parallel...");

    // Run Layer 2 (coloring) and Layer 3 (illustrations) in parallel — only when needed
    const layer2Promise = addons.coloring
      ? fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: LAYER_2_SYSTEM_PROMPT },
              { role: "user", content: storyOutput },
            ],
          }),
        }).then((r) => (r.ok ? r.json() : null))
      : Promise.resolve(null);

    const layer3Promise = addons.illustrations
      ? fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: LAYER_3_SYSTEM_PROMPT },
              { role: "user", content: storyOutput },
            ],
          }),
        }).then((r) => (r.ok ? r.json() : null))
      : Promise.resolve(null);

    const [layer2Data, layer3Data] = await Promise.all([layer2Promise, layer3Promise]);

    const coloringOutput: string | null = layer2Data?.choices?.[0]?.message?.content ?? null;
    const illustrationOutput: string | null = layer3Data?.choices?.[0]?.message?.content ?? null;

    console.log("All layers complete!");

    // Parse story
    const titleMatch = storyOutput.match(/TITLE:\s*\n(.*?)(?:\n|$)/);
    const storyMatch = storyOutput.match(/STORY:\s*\n([\s\S]*?)(?=SCENE_1_SUMMARY:|$)/);
    const sceneMatches: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const regex = new RegExp(`SCENE_${i}_SUMMARY:\\s*\\n([\\s\\S]*?)(?=SCENE_${i + 1}_SUMMARY:|$)`);
      const match = storyOutput.match(regex);
      sceneMatches.push(match?.[1]?.trim() || "");
    }

    // Parse coloring prompts
    const coloringPrompts: string[] = [];
    if (coloringOutput) {
      for (let i = 1; i <= 5; i++) {
        const regex = new RegExp(`COLOR_PAGE_${i}_PROMPT:\\s*\\n([\\s\\S]*?)(?=COLOR_PAGE_${i + 1}_PROMPT:|$)`);
        const match = coloringOutput.match(regex);
        coloringPrompts.push(match?.[1]?.trim() || "");
      }
    }

    // Parse illustration prompts
    const illustrationPrompts: string[] = [];
    if (illustrationOutput) {
      for (let i = 1; i <= 5; i++) {
        const regex = new RegExp(`ILLUSTRATION_${i}_PROMPT:\\s*\\n([\\s\\S]*?)(?=ILLUSTRATION_${i + 1}_PROMPT:|$)`);
        const match = illustrationOutput.match(regex);
        illustrationPrompts.push(match?.[1]?.trim() || "");
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        title: titleMatch?.[1]?.trim() || `${childName}'s ${theme}`,
        story: storyMatch?.[1]?.trim() || storyOutput,
        scenes: sceneMatches,
        coloringPrompts,
        illustrationPrompts,
        addons,
        rawStoryOutput: storyOutput,
        rawColoringOutput: coloringOutput,
        rawIllustrationOutput: illustrationOutput,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-story error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
