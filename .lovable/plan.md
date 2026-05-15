## Goal
Stop forcing every story to have 5 illustrations + 5 coloring pages. Scale the count to match story length / age group, so younger kids get fewer scenes and older kids get more.

## New scene counts per age group

| Age Group | Scenes (illustrations) | Coloring pages |
|-----------|------------------------|----------------|
| 1–3       | 1                      | 1              |
| 4–7       | 2                      | 2              |
| 8–10      | 3                      | 3              |
| 11+       | 4                      | 4              |

Coloring pages mirror illustration count so the same scenes appear in both formats (keeps character consistency clean — each coloring page is generated from its matching color illustration).

## Changes (all in `supabase/functions/generate-story/index.ts`)

1. **Add a helper** `sceneCountForAge(childAge)` that returns 1 / 2 / 3 / 4 based on the age group string.

2. **Update Layer 1 (story) prompt dynamically**:
   - Inject the scene count into the system prompt: "Output exactly N SCENE_X_SUMMARY blocks."
   - Update the OUTPUT FORMAT section so it only asks for N scenes instead of always 5.

3. **Update Layer 2 (coloring) prompt dynamically**:
   - Inject N: "Generate exactly N coloring page prompts (COLOR_PAGE_1_PROMPT … COLOR_PAGE_N_PROMPT)."
   - Update supporting-character distribution rule to scale (e.g. 1 scene = main only; 2 scenes = main + both; 3 scenes = main, both, supporting; 4 scenes = main, both, main, supporting).

4. **Update Layer 3 (illustration) prompt dynamically**:
   - Same as Layer 2 but for ILLUSTRATION_X_PROMPT blocks.

5. **Update parsing loops**:
   - Replace the hard-coded `for (let i = 1; i <= 5; i++)` loops with `for (let i = 1; i <= sceneCount; i++)` for scenes, coloring prompts, and illustration prompts.

## Downstream effects (no code change needed)
- `create-storybook/index.ts` already iterates over the prompt arrays it receives — if the array has 2 entries, it generates 2 illustrations + 2 coloring pages. So shrinking the arrays automatically shrinks the job.
- PDF assembly already loops over whatever pages exist.

## What stays the same
- Story word counts per age group (already defined in Layer 1).
- Image style, character consistency rules, photo-as-reference pipeline.
- Add-on toggles (coloring on/off, etc.).

## Out of scope
- No UI/frontend changes — the customer doesn't pick scene count; it's derived from the child's age they already enter.
- No pricing changes.