## Fix Plan — Checkout & Order Flow Cleanup

### 1. Hide the Hardback Bundle
- Remove hardback from the cart / add-on UI so no one can add it.
- Leave the Stripe product in place (it stays available for later reactivation).
- Add a short code comment marking it "hidden — physical, needs shipping+tax rework before re-enabling."

### 2. Remove the Shopify checkout button
- Cart drawer: delete the "Checkout via Shopify" button and its handler. Stripe becomes the only checkout path.
- Keep the Shopify webhook handler in place so any in-flight Shopify orders still complete.
- Fix the leftover copy on `/order-complete` that says *"Complete your purchase in the Shopify tab"* → change to a Stripe-friendly waiting message.

### 3. Expand Stripe webhook coverage
Update `stripe-webhook` to also handle:
- `checkout.session.expired` → mark order `expired`, trigger recovery email (see §5).
- `checkout.session.async_payment_failed` and `payment_intent.payment_failed` → mark order `payment_failed` with error message.
- `checkout.session.async_payment_succeeded` → same as `.completed` (for delayed payment methods).
- Everything else: log and 200.

### 4. Tighten `customer_ratings` security
- RLS: allow anon INSERT only when `order_id` exists in `storybook_orders` AND `stars` is 1–5.
- Add a unique constraint on `(order_id)` so one rating per order.
- Frontend already gates rating behind download, so this just hardens the API.

### 5. Abandoned-cart recovery
- New DB column: `storybook_orders.recovery_token uuid` (auto-generated on order create).
- New edge function: `send-checkout-recovery` — sends an email with a resume link `/checkout?order_id=…&prices=…&recover=<token>`.
- Webhook `checkout.session.expired` → sets status to `expired` and enqueues the recovery email (uses the existing transactional email pipeline).
- New transactional template: `checkout-recovery` (subject: "Your storybook is one click away 💛").

### 6. Order-complete polish
- Show a friendlier "Payment received — starting your story" state as soon as the return_url loads, without waiting for webhook (informational only; real status still comes from polling).
- Small "Test mode banner" already renders on `/checkout`; add it on `/order-complete` too during test purchases.

### 7. Housekeeping
- Update the memory index to note "Shopify checkout removed; Stripe is sole payment path."
- Add short JSDoc comments on the checkout + webhook files describing the full flow (for future you or another agent).

---

### Technical details

**Files created**
- `supabase/functions/send-checkout-recovery/index.ts`
- `supabase/functions/_shared/transactional-email-templates/checkout-recovery.tsx`
- `supabase/migrations/<ts>_checkout_hardening.sql` — adds `recovery_token`, `expired`/`payment_failed` allowed statuses, ratings constraint + policy tightening.

**Files edited**
- `src/components/CartDrawer.tsx` — remove Shopify button + hardback add-on option.
- `src/pages/OrderComplete.tsx` — fix pending copy, add "payment received" transitional state, add test-mode banner.
- `src/components/Personalizer.tsx` (or the add-on selector) — hide hardback bundle.
- `supabase/functions/stripe-webhook/index.ts` — handle expired / failed / async-succeeded events.
- `supabase/functions/create-pending-order/index.ts` — return `recovery_token` alongside `orderId`.
- `supabase/functions/_shared/transactional-email-templates/registry.ts` — register new template.
- `supabase/config.toml` — add `[functions.send-checkout-recovery] verify_jwt = false`.

**No changes** to: auth (you have none — correct for guest checkout), entitlement (one-off product), billing periods (no subs), Stripe product catalog (only visibility hidden), the shared Stripe utility.

---

### How to test end-to-end in the preview

Once shipped, do this in the Lovable preview (not published):

1. Open the site. Confirm the orange **"All payments made in the preview are in test mode"** banner shows at the top.
2. Click **Create Your Story** → fill the form (any child name, age 5, pick a theme) → **Add to Cart**.
3. Open the cart. You should see **only one button**: *"Pay Securely with Card ⭐"*. Click it.
4. On `/checkout`, the Stripe form loads. Use test card:
   - **Card number**: `4242 4242 4242 4242`
   - **Expiry**: any future date (e.g. `12/34`)
   - **CVC**: any 3 digits (e.g. `123`)
   - **ZIP**: any 5 digits (e.g. `10001`)
5. Click Pay. You'll land on `/order-complete`. First you'll see "Payment received — starting your story", then the progress stages, then within ~90 s the PDF opens in a new tab.
6. Click **"Yes, I got my storybook!"** — a confirmation email goes to `mestar.orders@gmail.com`.
7. Leave a 5-star rating → the same email will include the stars.

**Testing the failure paths** (all use test cards from Stripe's sandbox):
- **Declined card**: `4000 0000 0000 0002` → order should flip to `payment_failed` and stay recoverable.
- **Abandoned checkout**: leave `/checkout` open, close the tab. After Stripe's 24 h expiry, you'll receive a recovery email at the address you used. (For faster local testing I can trigger it manually — just ask.)
- **3D Secure**: `4000 0025 0000 3155` → walks you through the Stripe authentication modal, then completes.

Nothing you do in the preview touches real money. Live mode only activates after you complete Stripe go-live from the Payments panel.
