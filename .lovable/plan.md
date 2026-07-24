## What the user wants
The screenshot they attached is the `RealMagicShowcase` section further down the homepage — two card-style before/after examples (Izzy + Jaedan fishing) with "Real Photo" / "Story Hero" labels, name, theme chip, and caption. They want **exactly that visual** — but with **no header text** ("These are real MESTAR kids…" etc. removed) — to be the full-screen intro for the first 4 seconds when someone opens mestar.pro, then auto-dismiss into the normal homepage like the commercial used to.

## Why they didn't see my previous change
My earlier intro was a raw full-bleed split (no card frame, no labels the way the screenshot shows), so it didn't match what they had in mind. This plan replaces that intro with the card layout from the screenshot.

## Changes — single file: `src/pages/Index.tsx`

Replace the current intro `if (showIntro) { … }` block with a new intro that:

1. **Full-viewport dark overlay** (`fixed inset-0 z-50 bg-background`) sitting above everything for 4 seconds, then auto-dismisses (existing 4s timer stays).
2. **No text/headline/navbar** — the overlay covers the navbar so the user sees only the two example cards. No "Real Kids, Real Magic" chip, no "One Photo. One Hero…" headline, no explanation line — just the cards.
3. **Two cards, stacked vertically** filling the screen, styled to match the `RealMagicShowcase` card exactly:
   - Rounded card with border, real photo on the left half, story hero on the right half.
   - "REAL PHOTO" chip (camera icon) top-left over the real photo.
   - "STORY HERO" chip (sparkles icon) top-left over the story hero.
   - Below the images: name (bold display font) on the left, theme chip on the right, then a one-line caption.
   - **Card 1:** Izzy · Fairy Tale · "Same bow. Same big eyes. Same little hero."
   - **Card 2:** Jaedan · Ocean Adventure & Pirates · "His real fishing day — reimagined as a pirate captain's adventure."
4. **Tap-anywhere-to-dismiss** and a small "Skip →" button (top-right) so nobody feels trapped, mirroring the old commercial's skip affordance.
5. **Mobile-first sizing**: cards use `flex-1` inside a vertical flex column with small padding so both fit on a phone without scrolling; images use `object-cover` and clamp their height so the card + caption always fit.
6. **Auto-advance to homepage after 4s** — same timer already in place.

## What is NOT changing
- The `RealMagicShowcase` section further down the homepage stays exactly as it is (that's the section shown in the screenshot; it will still appear after the intro dismisses).
- The commercial file `/public/videos/promo-ad.mp4` stays in place, unreferenced, for future use.
- No routing, SEO, checkout, or backend changes.
- Uses image imports already in `Index.tsx` — no new assets.

## Technical notes
- Purely presentation edit in `src/pages/Index.tsx`.
- Uses existing Tailwind utilities and the `animate-fade-in` / `animate-scale-in` animations already in the project — no new CSS.
- The `Camera` and `Sparkles` icons are already imported from `lucide-react` in the file (or will be added to the existing import list — no new dependency).

## Verification
- Load `/` on the preview: for the first ~4 seconds you see only the two example cards (Izzy top, Jaedan-fishing bottom) with labels and captions — no navbar, no headline text.
- Tap the screen or "Skip" — intro dismisses immediately to the normal homepage.
- After 4s with no interaction, the intro auto-dismisses to the normal homepage (same behavior as the old commercial).
- Check at mobile viewport 443px: both cards visible without scrolling, captions readable.