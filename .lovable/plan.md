

## Plan: 3 visual mockups so you can pick

I'll build a single hidden preview page at `/style-preview` that shows all 3 mood options side-by-side (or stacked on mobile). Each mockup will use a **mini version of your homepage hero + one product card + a heading sample** so you see exactly how it'd feel in real use.

### What you'll see on `/style-preview`

Three labeled sections, each a self-contained "mini site" card:

**Option A — Magical Bedtime / Dreamy**
- Background: deep navy (current)
- Primary: gold star
- NEW accent: soft lavender (`260 60% 70%`) for badges/secondary text highlights
- Muted text: brightened cream
- Vibe: cozy, nighttime, storybook

**Option B — Warm & Playful**
- Background: deep teal-navy (`200 35% 8%`)
- Primary: warm gold
- NEW accent: coral pink (`10 75% 65%`) for badges
- Muted text: warm cream
- Vibe: friendlier, daytime-friendly, kid-energy

**Option C — Premium & Calm**
- Background: muted navy (`220 20% 10%`) — slightly lighter, less saturated
- Primary: soft champagne gold (less neon)
- Accent: none — just cream + gold
- Muted text: clean light gray-cream
- More whitespace, fewer emoji
- Vibe: high-end gift / Apple-like calm

### For each mockup I'll also show 2 heading styles
Inside each option you'll see the same sample heading rendered two ways:
1. **Solid gold bold** — `Your Child Is the Star`
2. **Cream with gold accent words** — `Your Child Is the` *Star* (only "Star" in gold)

So in total you get 3 moods × 2 heading styles = 6 quick visual samples on one page.

### How it stays isolated
- New file: `src/pages/StylePreview.tsx`
- New route added in `src/App.tsx`: `/style-preview` (not linked from anywhere — only you and I will know it exists)
- Each mockup uses **inline color values**, NOT global tokens — so nothing on the live site changes until you pick a winner
- A "Pick this one" button under each option (just a label for now — when you tell me which letter + heading style, I roll it out globally)

### After you pick
Once you say "Option B with cream + gold accent words" (or whatever combo), I'll:
1. Update the global tokens in `src/index.css` and `tailwind.config.ts` to match
2. Standardize heading styles across every page
3. Brighten muted text site-wide for readability
4. Remove the temporary `/style-preview` page

### Files I'll touch (this round only)
- **Create** `src/pages/StylePreview.tsx` — the mockup gallery
- **Edit** `src/App.tsx` — add the hidden `/style-preview` route

Nothing else. Your live site stays exactly as it is until you pick.

