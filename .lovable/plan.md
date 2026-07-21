## Goal
Make every page visually consistent: centered content, centered text/paragraphs, centered buttons, and consistent container widths across the site.

## Scope
All customer-facing pages in `src/pages/`:
- Index (Home)
- ProductsIndex, ProductLanding, ProductDetail
- About, FAQ, Reviews, WhyReadTogether
- Checkout, OrderComplete, Upsell, Preview, Library
- PrivacyPolicy, Unsubscribe, NotFound

Shared components: `Navbar`, `Footer`, `StoryPreview`, `RealMagicShowcase`, `NewsletterForm`, `WelcomePopup`.

Admin page (`/admin/payments`) is excluded — internal tool, left as-is.

## Standard being applied
1. **Page shell** — every page uses `min-h-screen py-12` with a single `container mx-auto` wrapper and a consistent max width tier:
   - Narrow (About, FAQ, Privacy, Unsubscribe, OrderComplete, Checkout): `max-w-2xl`
   - Standard (ProductLanding, ProductDetail, Reviews, WhyReadTogether, Upsell, Preview, Library): `max-w-4xl`
   - Wide (Index, ProductsIndex): `max-w-6xl`
2. **Text alignment** — all headings, paragraphs, eyebrow chips, and section intros use `text-center` on every viewport (removing the current mixed `text-center sm:text-left` pattern in About/FAQ/etc.).
3. **Buttons & CTAs** — every standalone CTA is wrapped in a `flex justify-center` (or `mx-auto` on the button) so it sits centered under its paragraph. Button groups use `flex flex-col sm:flex-row justify-center gap-3`.
4. **Cards & grids** — grids stay as-is structurally, but card internals (icon, title, body, button) are centered: `flex flex-col items-center text-center`. Icons use `mx-auto`.
5. **Forms** — form fields keep left-aligned labels for readability (accessibility best practice), but the form container itself is centered and submit buttons are centered.
6. **Navbar & Footer** — already centered via `container`; verify link groups use `justify-center` on mobile.

## What changes per page (high level)
- **About** — remove `text-center sm:text-left` on the two big cards; center all icons with `mx-auto`; center the CTA (already centered, verify).
- **FAQ** — same fix on `AccordionTrigger` / `AccordionContent` (drop `sm:text-left`); center the CTA block.
- **ProductsIndex** — center card contents (icon, title, price, description); center the button row.
- **ProductLanding / ProductDetail** — center hero copy, feature bullets, and the sticky/inline CTAs; keep the personalization form fields left-aligned inside a centered card.
- **Index (Home)** — audit each section (hero, StoryPreview, RealMagicShowcase, testimonials, final CTA) and enforce centered headings + centered CTAs.
- **Reviews / WhyReadTogether / Upsell / Preview / OrderComplete / Checkout / Privacy / Unsubscribe / NotFound** — apply the same standard: centered eyebrow → h1 → subhead → CTA pattern, consistent `py-12` and container width.
- **Footer** — ensure link columns center on mobile, left-align on desktop is fine (or center everywhere for full consistency — will center everywhere to match the rule).
- **NewsletterForm / WelcomePopup** — center headline, subtext, and submit button.

## Not changing
- Color tokens, fonts, spacing scale, or component logic.
- Form input alignment (labels stay left of inputs for usability).
- Admin dashboard (`/admin/payments`).
- Any backend / edge function code.

## Verification
After edits, spot-check each route in the preview at mobile (375px), tablet (768px), and desktop (1280px) widths using Playwright screenshots to confirm consistent centering and container widths.

## Technical notes
- Pure Tailwind class changes; no new dependencies.
- Uses existing semantic tokens — no hardcoded colors introduced.
- Estimated ~15 files touched, all in `src/pages/` and `src/components/`.
