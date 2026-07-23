## Goal
When a visitor lands on mestar.pro, instead of the promo video they immediately see a full-screen "real photo → storybook hero" reveal for Izzy and Jaedan, then continue into the normal homepage. Keep the commercial video file in place (unused) so it can be re-enabled later.

## Changes — single file: `src/pages/Index.tsx`

1. **Replace the video intro block** (currently the `if (showIntro) { return <video …/> }` return at ~lines 470–524) with a new full-screen "MagicReveal" intro:
   - Fixed, full-viewport overlay (`fixed inset-0 z-50`) on a dark background.
   - Split vertically into two equal halves:
     - **Top half — Izzy:** real photo (`izzyReal.url`) on the left, storybook character (`izzyStory`) on the right, with a small label under each ("Real photo" / "Story hero") and Izzy's name + theme chip ("Fairy Tale").
     - **Bottom half — Jaedan (fishing):** `jaedanFishing.url` on the left, `jaedanFishingStory` on the right, labeled the same way, name + theme chip ("Ocean Adventure & Pirates").
   - Fast entrance so the magic is visible within ~1–2s: real photos fade in first (~0.3s), then the story-hero side slides/fades in (~0.6s) with a subtle sparkle accent.
   - A single "Enter site →" button (bottom center) and tap-anywhere-to-continue, mirroring the current skip-to-dismiss behavior.
   - Auto-advance to the homepage after ~4 seconds so nobody gets stuck on the reveal.

2. **Remove video-only logic that is no longer needed:**
   - Delete `videoRef`, `isMuted`, `handleUnmute`, and the `useEffect` that plays the video.
   - Keep `showIntro` state + `handleVideoEnd` (rename usage kept internally; still toggles the intro off).
   - Do **not** delete `/public/videos/promo-ad.mp4` — the file stays so the commercial can be re-enabled later; only the reference to it is removed.

3. **No changes** to:
   - The rest of the homepage (headline, CTA, `RealMagicShowcase`, product grid) — it renders exactly as it does today after the intro dismisses.
   - Routing, SEO tags, cart, checkout, edge functions, or any backend logic.
   - Mobile responsiveness: the split stays 50/50 top/bottom on all sizes; on very small screens the two images inside each half stack tightly side-by-side (`grid-cols-2`) so both real + hero are always visible together.

## Technical notes
- Purely frontend/presentation change in one file.
- Uses existing image imports already at the top of `Index.tsx` (`izzyReal`, `izzyStory`, `jaedanFishing`, `jaedanFishingStory`) — no new assets.
- Uses existing Tailwind animation utilities (`animate-fade-in`, `animate-scale-in`) — no new dependencies or keyframes needed.

## Verification
- Load `/` in the preview: intro shows Izzy on top half, Jaedan-fishing on bottom half, real photo on the left, story hero on the right; tap or wait ~4s to enter the homepage; the rest of the site is unchanged.
- Check mobile viewport (443px): both halves and both images per half still visible without scrolling.
- Confirm no console errors and that `/videos/promo-ad.mp4` still exists in `public/videos/` for future use.