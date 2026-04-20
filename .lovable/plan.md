

## Plan: Fix the bottom CTA buttons so they actually navigate

### The problem
On `/why-read-together` (and `/faq`, `/reviews`), the bottom "Create Your Story Now" button uses a fallback link `href="/#products"` when Shopify products haven't loaded yet. From any page other than the homepage, clicking `#products` does nothing because that anchor only exists on `/`. So the button appears dead.

Also, while products load (a brief moment) the button is rendered with the broken fallback, so even on a fast click it can feel like "nothing happens."

### The fix (3 small content-only edits)

For each of these 3 pages, change the fallback link so it always goes somewhere real:

1. **`src/pages/WhyReadTogether.tsx`** — change the fallback `<a href="/#products">` to `<Link to="/#products">` (React Router will route to home and then scroll). If we're being safest, just send them to `/` (homepage) which always works.
2. **`src/pages/FAQ.tsx`** — same fix.
3. **`src/pages/Reviews.tsx`** — same fix.

Specifically I'll:
- Replace the `<a href="/#products">…</a>` fallback with `<Link to="/">…</Link>` (homepage — guaranteed to work, and the products section is on the homepage anyway)
- Keep the primary path (`/product/${firstHandle}`) unchanged — that already works when products load

### What I will NOT touch
- Navbar, footer links (already work)
- Any route, webhook, edge function, Shopify integration, cart, or checkout logic
- Theme, brand styling, or copy
- The Index page's own CTA (it's on the same page as `#products`, so it works)

### Result
Every bottom CTA on About/FAQ/Reviews/Why Read goes to a real page (the product page when loaded, the homepage as fallback) — no more dead clicks.

