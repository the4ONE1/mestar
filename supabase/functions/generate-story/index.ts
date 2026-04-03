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
AGE STRUCTURE RULES
----------------------------------------

Age 0–2:
- 350–500 words
- Gentle rhythm
- Simple sensory imagery
- Minimal conflict
- One small but meaningful action moment

Age 3–5:
- 500–750 words
- Clear beginning → challenge → resolution
- One decision moment
- Light dialogue allowed

Age 6–8:
- 800–1100 words
- Clear problem
- Cause-and-effect progression
- Emotional growth moment

Age 9–12:
- 1100–1500 words
- Multi-step challenge
- Clear internal decision
- Reflective growth resolution

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
OUTPUT FORMAT (CRITICAL FOR LAYER 2)
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
- Minimal background clutter
- Clear central action
- Consistent character design
- 8.5x11 portrait layout

----------------------------------------
SCENE SIMPLIFICATION RULE (CRITICAL)
----------------------------------------

Each SCENE summary must be simplified into:
- One clear action moment
- One primary subject (loved one)
- Maximum one supporting character (if included)
- Minimal environmental detail
- Large open spaces for coloring

Remove:
- Complex scenery
- Background crowds
- Excess objects
- Small intricate details
- Cinematic perspective

Focus on:
- The hero
- The action
- The emotional moment

----------------------------------------
CHARACTER CONSISTENCY RULE
----------------------------------------

The loved one must appear visually consistent across all 5 pages.

Maintain:
- Same hairstyle
- Same outfit style
- Same facial proportions
- Same body scale

If supporting character included:
- Must remain visually consistent across scenes.

----------------------------------------
STYLE RULES (NON-NEGOTIABLE)
----------------------------------------

- Black and white line art only
- Thick bold outlines
- No shading
- No grayscale
- No cross-hatching
- No gradients
- No text
- No speech bubbles
- No color
- No background blur
- No heavy background texture

Style must resemble:
Printable children's coloring book page.

----------------------------------------
COMPOSITION RULES
----------------------------------------

- Portrait orientation (8.5x11 ratio)
- Large central subject
- Clear white space areas
- No overcrowding
- Clear foreground separation

----------------------------------------
PROMPT STRUCTURE OUTPUT
----------------------------------------

For each scene output:

COLOR_PAGE_1_PROMPT:
<clean detailed image prompt>

COLOR_PAGE_2_PROMPT:
...

Continue through COLOR_PAGE_5_PROMPT.

Each prompt must:

1. Begin with:
"Black and white coloring page line art, thick bold outlines, printable, no shading."

2. Then describe:
- The simplified action moment
- Character positioning
- Minimal setting

3. End with:
"Clean white background, no grayscale, no color."

----------------------------------------
QUALITY CONTROL RULE
----------------------------------------

Before finalizing prompts, verify:
- Each page centers the loved one.
- Each page depicts a distinct action moment.
- No page is visually identical.
- Prompts are concise but descriptive.
- Background details are minimal.

========================================
END OF COLORING ENGINE LAYER 2
========================================`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childName, childAge, theme, strength, hasSupportingCharacter, supportingCharacterName } = await req.json();

    // Validate inputs
    if (!childName || !childAge || !theme) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: childName, childAge, theme" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build Layer 1 input
    const layer1Input = `Loved One Name: ${childName}
Age: ${childAge}
Theme: ${theme}
Supporting Character Included: ${hasSupportingCharacter ? "Yes" : "No"}
Supporting Character Name: ${hasSupportingCharacter && supportingCharacterName ? supportingCharacterName : "N/A"}
Desired Strength to Nurture: ${strength || "organic positive growth"}`;

    console.log("Generating story with Layer 1...");

    // LAYER 1: Generate story
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

    if (!storyOutput) {
      throw new Error("Layer 1 returned empty output");
    }

    console.log("Story generated. Running Layer 2 for coloring prompts...");

    // LAYER 2: Generate coloring page prompts
    const layer2Response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
    });

    if (!layer2Response.ok) {
      const errText = await layer2Response.text();
      console.error("Layer 2 error:", layer2Response.status, errText);
      // Still return story even if coloring fails
      return new Response(
        JSON.stringify({
          success: true,
          story: storyOutput,
          coloringPrompts: null,
          error: "Coloring page generation failed, but your story is ready!",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const layer2Data = await layer2Response.json();
    const coloringOutput = layer2Data.choices?.[0]?.message?.content;

    console.log("Both layers complete!");

    // Parse the story output
    const titleMatch = storyOutput.match(/TITLE:\s*\n(.*?)(?:\n|$)/);
    const storyMatch = storyOutput.match(/STORY:\s*\n([\s\S]*?)(?=SCENE_1_SUMMARY:|$)/);
    const sceneMatches = [];
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

    return new Response(
      JSON.stringify({
        success: true,
        title: titleMatch?.[1]?.trim() || `${childName}'s ${theme}`,
        story: storyMatch?.[1]?.trim() || storyOutput,
        scenes: sceneMatches,
        coloringPrompts,
        rawStoryOutput: storyOutput,
        rawColoringOutput: coloringOutput,
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
