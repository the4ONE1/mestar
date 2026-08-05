# Bring the sample-level quality into every real story

## What I verified in the code (not guessing)

- **Illustrations**: the live pipeline already calls the newest image model (`google/gemini-3-pro-image`) in `create-storybook`. So the image *model* upgrade did ship.
- **Story text**: every text call in `generate-story` (story, coloring prompts, illustration prompts, repair passes) still runs on `google/gemini-2.5-flash` — a **previous-generation** model. The quality upgrade was never applied to the writing/prompt-writing side. This is the biggest gap.
- **Time budget**: images are capped at 100s per pass with 4 images per pass and a 45s per-image timeout. When the budget runs out, remaining images are **skipped** — so a real order can ship with fewer/weaker pages than a sample.
- **Test orders just run** used free-text themes ("ocean adventure", "underwater ocean adventure") instead of the site's canonical theme names, and produced 3.6k–4.2k character stories — shorter than the longer-story target set earlier. Nothing was in fallback mode (no credit exhaustion), so the shortfall comes from the model + prompt path, not an error.

## What I'll change

1. **Upgrade the story engine model.** Move all `generate-story` text calls from `google/gemini-2.5-flash` to a current-generation model, keeping the same request shape and the same locked Layer 1/2/3 rulesets. The story, coloring prompts and illustration prompts all get the newer model's reasoning quality.
2. **Verify per-model request fields** against the model's API reference before shipping (token-limit field, temperature support) so nothing 400s.
3. **Raise the illustration prompt fidelity**: pass the canonical theme wording plus the age-based detail guidance into Layer 3 so scene prompts describe the sample-grade art direction instead of a generic scene line.
4. **Stop silent quality loss**: when the image budget is exhausted, the remaining pages are picked up by the next resume pass instead of being dropped, so no delivered book has missing or lower-effort pages.
5. **Confirm story length** actually hits the longer-story target with the new model; if the model returns short, tighten the length instruction rather than post-processing.
6. **Run one real end-to-end test order** after the change and compare its illustrations and story against the sample section before calling it done.

## Technical notes

- Files touched: `supabase/functions/generate-story/index.ts` (model ids + Layer 3 inputs + length enforcement), `supabase/functions/create-storybook/index.ts` (budget handoff so skipped images resume).
- No schema, checkout, or pricing changes.
- Existing completed orders are untouched; this affects all future generations.
