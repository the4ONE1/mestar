

## Audit findings

I went page by page. Almost everything is properly centered with `container` + `text-center` + `mx-auto`. There is **one real layout bug** that affects every page, plus a couple of minor things worth flagging.

### 🔴 Real bug (affects every page including the homepage)

**`src/App.css` is forcing a 1280px max-width on `#root` with 2rem padding and `text-align: center`.**

This is leftover Vite starter CSS. It's silently fighting Tailwind on every single page — squishing wide sections (like the announcement bar, footer, and full-bleed hero) inside a 1280px box with extra padding around it. On a phone (your current 790px viewport), it adds 32px padding on every side.

This is almost certainly why the "How It Works" step 1 looks off — the whole page is being constrained and padded by this rogue CSS file.

**Fix:** Empty out `src/App.css` (or delete the `#root` rules). Tailwind's `container` class already handles centering and padding correctly.

### 🟡 Minor things I noticed (will only fix if you want)

1. **NotFound (404) page** uses `bg-muted` background instead of the site's normal dark navy — looks out of place if anyone hits it.
2. **Footer link row** wraps awkwardly on narrow phones (5 links in one line). Could stack better on mobile.
3. **WhyReadTogether** has two huge headings stacked (`text-4xl md:text-5xl` twice in a row) — visually heavy but not a centering issue.

These are taste calls, not bugs.

### ✅ What's already correctly centered
- Homepage hero, trust badges, How It Works, Story Preview, Products grid, final CTA
- About / FAQ / Reviews / WhyReadTogether — all use `container max-w-*` properly
- Product Detail — 2-column grid centered in container
- OrderComplete — centered states for loading/success/error
- Privacy Policy — centered
- Navbar — centered with container
- Cart Drawer — uses shadcn sheet (correct)

## Plan: one fix, three optional questions

**Definitely fix (no question needed — it's a clear bug):**
- Empty `src/App.css` so it stops constraining and padding every page.

**Then ask you about the 3 minor things:**
1. Want me to restyle the 404 page to match the site?
2. Want the footer links to stack nicer on mobile?
3. Want me to tone down the double huge heading on "Why Read Together"?

## Files I'll touch
- `src/App.css` — clear out the rogue rules

That's it. One file. Then I'll ask you the 3 yes/no questions before touching anything else.

