## Fix mismatched themes in "Watch the Transformation"

The showcase currently uses two themes that aren't in the offered catalog. Real photos stay the same — only the storybook side and label change.

### Changes

**Card 2 — Jaedan fishing photo**
- New theme: **Ocean Adventure & Pirates**
- Regenerate `src/assets/jaedan-fishing-story.jpg` as Jaedan holding a fish on the deck of a small pirate ship, tricorn hat, treasure map, sunset ocean — preserving his face/likeness from the source photo.
- Update label: `"Great Outdoors"` → `"Ocean Adventure & Pirates"`
- Update caption to match new theme.

**Card 3 — Jaedan cowboy photo**
- New theme: **Prince & Princess**
- Regenerate `src/assets/jaedan-cowboy-story.jpg` as Jaedan as a young prince on horseback outside a castle at golden hour, royal cape, small crown — preserving his face/likeness (the cowboy hat becomes a crown, horse stays).
- Update label: `"Wild West"` → `"Prince & Princess"`
- Update caption to match new theme.

**Card 1 — Izzy Fairy Tale** stays as-is (already matches offered themes).

### File touched
- `src/components/RealMagicShowcase.tsx` — update `themeLabel` and `caption` for cards 2 and 3.
- `src/assets/jaedan-fishing-story.jpg` — regenerated via `edit_image` from real photo (keeps likeness).
- `src/assets/jaedan-cowboy-story.jpg` — regenerated via `edit_image` from real photo (keeps likeness).

### Cost estimate
- 2 image edits at standard quality ≈ **2 credits (~$0.30)**. Fits well within your 45.91 remaining.

### After I ship
You'll see three cards in the "Watch the Transformation" section that each map to a real offered theme (Fairy Tale, Ocean Adventure & Pirates, Prince & Princess), so nothing on the page promises a theme customers can't actually buy.
