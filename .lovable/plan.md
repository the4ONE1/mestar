## Revised plan (with your latest answers folded in)

Every purchase-looking button funnels into the photo-upload personalization flow. Lazy shoppers get a Gift Card path. Failed generations show a plain-English fixable error + Retry — no auto-refund.

---

### 1. Every "buy" button routes to personalization (photo upload first)

Audit shows purchase-y CTAs in these places today:
- `Index.tsx` — hero "Create Your Story" + section CTAs
- `ProductDetail.tsx` — "Add to Cart"
- `About.tsx`, `FAQ.tsx`, `WhyReadTogether.tsx`, `Reviews.tsx` — various "Start", "Get yours", "Order now" style buttons
- `Footer.tsx` — currently no buy button (will add "Shop" link)
- New `/products` page — every product card

**Fix (site-wide rule):**
- Every purchase-intent CTA becomes a link to `/product/personalized-storybook#personalize` (auto-scrolls straight to the photo-upload step, not the top of the page).
- Add-on cards on `/products` open the "add-on modal", Continue → same URL with `?addon=supporting` (pre-checks the box).
- Add a small utility `<BuyButton>` component so every CTA on the site uses the same routing logic — no more one-off `<Link to="...">` variants.

### 2. "Skip personalization — Buy a Gift Card"

Prominent secondary button next to every main CTA and on `/products`:
- Click → `/gift-card` page.
- Simple form: amount ($19.99 default, allow $29.99 / $49.99 / custom), recipient email (optional — else sends to buyer), personal note.
- Stripe Embedded Checkout using new price `gift_card_onetime` ($ variable via `price_data`).
- On `checkout.session.completed` in `stripe-webhook`, if `metadata.product_type === "gift_card"`:
  - Generate a unique redemption code (`MESTAR-XXXX-XXXX`).
  - Insert into new `gift_cards` table (`code`, `amount_cents`, `buyer_email`, `recipient_email`, `note`, `redeemed_order_id`, `expires_at` = +1 year).
  - Send styled "You've been gifted a personalized storybook!" email to recipient with the code + a big "Redeem now" button.
- **Redemption:** Recipient clicks Redeem → lands on `/product/personalized-storybook?gift=CODE`. Personalization form loads normally. At checkout, the code auto-applies as a 100% discount (or partial — if their cart exceeds the gift amount, they pay the difference).
- `create-checkout` gains a `giftCode` param that validates + reserves the code, and the webhook marks it `redeemed_order_id` on success.

### 3. Failed-generation UX — no auto-refund, always fixable

Rework `stripe-webhook` background pipeline:
- **Soft/transient errors** (rate limit, timeout, network): silent retry with exponential backoff, up to 5 attempts. Existing `callChatWithRetry` already does most of this — extend to `create-storybook` image calls too.
- **Hard/user-fixable errors** classified into named categories, each with a customer-facing explanation:

| Category | Trigger | Customer message + action |
|---|---|---|
| `photo_unclear` | face-detection or image-analysis rejects the photo | "We couldn't clearly see your child's face in the photo. Please upload a clearer, front-facing photo (good lighting, no sunglasses)." + **Upload new photo** button |
| `photo_missing` | photo path 404s in storage | "Your photo didn't upload successfully. Please re-upload." + **Upload new photo** button |
| `content_policy` | AI provider refuses (e.g. theme flagged) | "Our AI couldn't create a story from this theme. Please pick a different adventure or reword it." + **Edit story details** button |
| `supporting_char_photo_unclear` | 2nd photo unusable | Same as above but for supporting character |
| `system_error` | genuine internal failure after all retries | "Something went wrong on our end. We've been notified and will email you within 24 hours." + email `mestar.orders@gmail.com` alert |

- New order columns: `failure_category` (text), `failure_hint` (text), `retry_count` (int).
- `OrderComplete.tsx` (and `/library/:orderId`) render this as a friendly card with a **Retry** button. Retry calls new edge function `retry-generation` which:
  - Accepts optional replacement photo(s) or edited fields (name/theme/etc.)
  - Writes them to `storybook_orders`
  - Re-fires the `generate-story → create-storybook` pipeline
  - Keeps `status = "queued"`, clears `failure_category`
- No refund fires automatically. Add a small "Need a refund instead?" mailto link only for `system_error`.

### 4. Everything from the prior plan still stands

- **Shop link in navbar** (first item).
- **`/products` catalog page** with all products + coming-soon labels + add-on modal + paperback/hardback waitlist.
- **30-day expiration warning**: big banner on `/order-complete`, countdown, matching warning in delivery email.
- **`/resend` self-serve PDF re-send** page + `resend-pdf` edge function (rate-limited).
- **`send-checkout-recovery` security fix**: status guard (only `expired` / `payment_failed` orders can be reset) + require server bearer token.
- **Kill dead audiobook state** in `ProductDetail.tsx` so the total is always accurate.

### 5. Database change (one migration)

New table `gift_cards`:
- `id`, `code` (unique), `amount_cents`, `buyer_email`, `recipient_email`, `note`, `stripe_session_id`, `redeemed_order_id` (FK nullable), `redeemed_at`, `expires_at`, `created_at`.
- Service-role-only RLS (all reads/writes via edge functions).

Add columns to `storybook_orders`:
- `failure_category text`, `failure_hint text`, `retry_count integer default 0`, `gift_card_code text`.

### 6. Files that change

- **New pages**: `ProductsIndex.tsx`, `Resend.tsx`, `GiftCard.tsx`, `GiftCardRedeem.tsx` (or `?gift=` param handling on `ProductDetail`)
- **New components**: `BuyButton.tsx`, `AddonModal.tsx`, `ComingSoonWaitlist.tsx`, `FailureCard.tsx`
- **New edge functions**: `resend-pdf`, `retry-generation`, `redeem-gift-card`
- **Modified**: `App.tsx` (routes), `Navbar.tsx` (Shop), `Footer.tsx` (Resend + Gift Cards), `Index.tsx` / `About.tsx` / `FAQ.tsx` / `WhyReadTogether.tsx` / `Reviews.tsx` (swap CTAs → `<BuyButton>`), `ProductDetail.tsx` (photo-upload anchor, `?addon=`/`?gift=` params, kill dead audiobook state, expiration warning), `OrderComplete.tsx` (30-day banner + countdown + `FailureCard`), `Library.tsx` (same `FailureCard`), `create-checkout` (gift code support), `stripe-webhook` (gift-card branch, failure categorization, silent retries), `generate-story` + `create-storybook` (classify errors into categories, extend retry logic), `send-checkout-recovery` (status guard + auth), `story-delivery.tsx` email (expiration warning)

---

## How to test in preview (Stripe TEST MODE — orange banner up top)

**Test card:** `4242 4242 4242 4242` • any future expiry (`12/30`) • any CVC (`123`) • any ZIP (`10001`)

**Flow A — Every button funnels to photo upload**
Click every "Create", "Start", "Buy", "Get Yours" button on Home, About, FAQ, Why Read, Reviews, Products. Each one must land you at the photo upload step of `/product/personalized-storybook` — not the top, not somewhere else.

**Flow B — Add-on routing**
On `/products`, click Supporting Character → modal → Continue → storybook page loads with the box checked.

**Flow C — Gift card purchase + redemption**
1. Click **Buy a Gift Card** (any page). Pick $19.99, put your own email as recipient. Pay with test card.
2. Check inbox → open gift email → copy code.
3. Open incognito, paste `/product/personalized-storybook?gift=MESTAR-XXXX-XXXX`.
4. Fill personalization. At checkout total shows **$0.00** and completes with no card. Story generates.

**Flow D — Fixable failure + retry**
I'll trigger this by temporarily forcing `generate-story` to throw `photo_unclear`, run a real test checkout, watch `/order-complete` show the friendly "photo unclear — upload a clearer one" card, click Retry with a new photo, watch it succeed. Then I remove the force-throw. You'll just review the final screenshots.

**Flow E — 30-day expiration visibility**
After Flow C completes, confirm the orange "Save your PDF — expires in 30 days" banner and countdown are visible on `/order-complete` and in the delivery email.

**Flow F — Resend lost PDF**
Visit `/resend`, enter the email used at checkout → get the delivery email again. Try immediately again → rate-limit message.

---

Approve and I'll build it in this order: gift-card infra → failure categorization + retry → universal `<BuyButton>` swap → `/products` + Shop nav → 30-day warnings → `/resend` → security patch.