## Plan: Updated preview at `/style-preview` with brand-name "Star" treatments

You want to revisit the preview AND see⁶⁶ for how the word **"Star"** in the brand name "My Star Stories" should be styled (since it stays as text, not ⭐). Everywhere else, "star" still becomes ⭐ when we roll out.

### What I'll update on `/style-preview`

Keep the existing 3 moods × 2 heading styles, and **add a new section at the top** showing 4 brand-name treatments so you can pick how "Star" looks in "My Star Stories":

**Brand-name treatments** (all on Option C background, since you already picked C):

1. **Bright yellow solid** — "My **Star** Stories" — Star in pure bright yellow (`hsl(50 100% 60%)`), bold
2. **Champagne gold (matches site primary)** — "My **Star** Stories" — Star in the new soft gold from Option C
3. **Bright yellow + tiny ⭐ after** — "My **Star**⭐ Stories" — yellow word plus a small star emoji
4. **Bright yellow italic display font** — "My *Star* Stories" — yellow, italicized, slightly larger for personality

Each treatment shown in a card with a "Pick this" label so you can tell me "Brand option 2" etc.

### Rest of the preview page stays the same

The 3 mood mockups + 2 heading styles below remain exactly as they are so you can confirm Option C + heading choice at the same time.

### After you pick (next round, not now)

Once you say e.g. "Brand option 1, heading 2", I will:

1. Apply Option C tokens globally (`src/index.css`)
2. Style the navbar "Star" word with your chosen yellow treatment
3. Replace every other "star" / "Star" in user-facing copy with ⭐
4. Remove all plain white text → cream
5. Delete `/style-preview`

### Files I'll touch this round

- **Edit** `src/pages/StylePreview.tsx` — add the new "Brand name treatments" section at the top

Nothing else changes. Live site untouched.