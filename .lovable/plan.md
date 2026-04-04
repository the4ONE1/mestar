

# Plan: Update Story Themes to Final 5

## What Changes

Replace the current 8 themes with your chosen 5:

1. **Fairy Tale**
2. **Ocean Adventure & Pirates**
3. **Prince & Princess**
4. **Mythical Creatures** (unicorns, elves, fairies)
5. **Dinosaurs**

## Technical Details

**Two files to update:**

1. **`src/pages/ProductDetail.tsx`** — Replace the `STORY_THEMES` array (lines ~14-23) with the new 5 themes.

2. **`supabase/functions/generate-story/index.ts`** — If themes are referenced in the story engine prompts, update them there too to match.

No other changes needed — the theme is passed as a string to the AI, so it works automatically with any theme name.

