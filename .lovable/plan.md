

## Plan: Roll out Option C theme + bright yellow "Star" — customer-facing only, zero functional impact

Strict rules I'll follow:
- **Only edit visible customer-facing UI** (pages, components, `index.html` title/meta)
- **Do NOT touch** any edge function (`supabase/functions/*`), webhook code, Shopify integration logic, cart sync logic, Supabase client, types, or any business logic
- **Do NOT change** route paths, component prop names, function names, or any code identifiers — only text content and CSS classes
- **Do NOT change** the lucide `<Star />` icon component (it's decorative, already gold)

### 1. Global theme (Option C — cream + champagne gold + muted navy)
- **Edit `src/index.css`**: update `:root` HSL tokens to Option C values (background, foreground=cream, card, primary=champagne gold, muted-foreground=readable warm cream, border). Add new token `--star-yellow: 50 100% 60%`.
- **Edit `tailwind.config.ts`**: add `star.yellow: "hsl(var(--star-yellow))"` so we have a `text-star-yellow` utility.

### 2. Brand name "My Star Stories" — color "Star" bright yellow
Wherever the brand name appears as visible text:
- `src/components/Navbar.tsx`
- `src/components/Footer.tsx` (if shown)
- `index.html` `<title>` stays as plain text "My Star Stories" (browser tab — can't color it)

Render as: `My <span className="text-star-yellow">Star</span> Stories`

### 3. Replace "star"/"Star" with ⭐ in all OTHER customer-visible copy
Sweep visible text only in:
- `src/pages/*.tsx` (Index, ProductDetail, About, FAQ, Reviews, WhyReadTogether, OrderComplete, PrivacyPolicy, NotFound)
- `src/components/*.tsx` (CartDrawer, StoryPreview, NavLink, Footer)
- `index.html` meta description / og tags

Skip: brand name, code identifiers, CSS class names (`star-gold`, `star-yellow`), lucide `<Star />` imports, any string passed to APIs/webhooks.

### 4. Remove plain white text → cream
Find `text-white`, `text-white/80`, `text-white/90`, hardcoded `#fff`/`#ffffff` in customer-facing files only. Replace with `text-cream` / `text-foreground` / `text-muted-foreground`.

### 5. Standardize headings (subtle, visual only)
- h1/h2 default to `text-primary` (champagne gold)
- h3/h4 default to `text-cream`
Across all customer pages. Pure className changes — no structural edits.

### 6. Remove temporary preview
- Delete `src/pages/StylePreview.tsx`
- Remove `/style-preview` route + import from `src/App.tsx`

### What I will NOT touch (protected)
- `supabase/functions/**` (all edge functions, webhooks, order notifications, story generation)
- `src/lib/shopify.ts`, `src/lib/products.ts`
- `src/integrations/supabase/*`
- `src/hooks/useCartSync.ts`, `src/stores/cartStore.ts`
- Any route paths, API calls, form field `name` attributes, or product IDs
- Cart, checkout, order, or webhook flows

### Files touched
- Edit: `src/index.css`, `tailwind.config.ts`, `src/App.tsx` (route removal only), `index.html` (meta text only), `src/components/Navbar.tsx`, `src/components/Footer.tsx`, `src/components/CartDrawer.tsx`, `src/components/StoryPreview.tsx`, `src/components/NavLink.tsx`, all 9 files in `src/pages/` except StylePreview
- Delete: `src/pages/StylePreview.tsx`

### Result
Visual refresh only. Every cart click, checkout, story generation, webhook, and order notification continues working identically — I'm only changing colors and swapping visible "star" words for ⭐.

