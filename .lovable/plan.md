## Root cause (confirmed from logs)

Stripe's sandbox webhook IS reaching our server. Every call fails with `Invalid webhook signature`. The `PAYMENTS_SANDBOX_WEBHOOK_SECRET` stored in the project does not match the secret Stripe uses to sign events. That's why 100% of paid test checkouts sit in `pending_payment` forever and no generation ever runs.

## Part 1 — Fix the webhook secret (the actual blocker)

Two possible causes; the fix differs slightly:

**Cause A — Manual webhook you added in Stripe's dashboard:** the whsec you pasted into Lovable is out of sync. Fix: I'll ask you for the current `whsec_...` shown next to that endpoint in Stripe → Developers → Webhooks (I'll walk you through where to click, screenshot-level detail), then I'll store it via `secrets--set_secret` for `PAYMENTS_SANDBOX_WEBHOOK_SECRET`.

**Cause B — Duplicate endpoints:** Lovable already auto-registered a webhook when payments were enabled, AND you added a second one manually. Stripe signs with whichever endpoint's secret; ours only knows one. Fix: delete the manual one, keep the Lovable-managed one.

Step 1 of this plan is a 3-minute back-and-forth where you tell me what's in your Stripe dashboard and I decide A vs B.

## Part 2 — Admin dashboard: one-click test checkout + webhook health

In `src/pages/AdminPayments.tsx`:

- **Green/red webhook health pill** at the top: green if any successful event landed in the last 24h, red otherwise (with the exact error from the last failed attempt shown inline — no more guessing).
- **"Run Sandbox Test Checkout" button** that:
  1. Calls a new tiny edge function `admin-run-test-checkout` (protected by `x-admin-token`) which creates a pending order with test data (child "Admin Test", age 5, kindness theme, your email) via the existing `create_pending_order` RPC.
  2. Opens `/checkout?orderId=<new-id>` in a new tab so you complete the Stripe form with `4242 4242 4242 4242`.
  3. Auto-polls `payment_events` every 3s for 90s so you literally watch the events land (or watch them NOT land, which is equally useful).
- **Retry-generation button** on each stuck order row that manually kicks the pipeline (bypasses the webhook), so we can rescue the 5 real-looking stuck orders and prove the generation pipeline itself still works.

## Part 3 — What to do about the 30 stuck orders

- **25 test orders (your emails, [t@e.com](mailto:t@e.com), etc.)** — I'll archive them (mark as `status='cancelled'`) so your dashboard is clean.
- **5 real-looking orders** (fieldgar369 + the 3 temp-mail addresses + one bob ross entry) — these never had a completed Stripe payment (only 2 of the 5 even got as far as opening the checkout iframe), so no refund is needed. I'll mark them `abandoned` with a note. If any of these were real people who paid, they'd have chased you by email by now; none did.

## Technical details (skip if not interested)

- New edge function: `supabase/functions/admin-run-test-checkout/index.ts` (verify_jwt=false, checks `x-admin-token`, POST-only, no CORS surprises). Inserts via `create_pending_order` RPC and returns `{ orderId }`. Adds one line to `supabase/config.toml`.
- Extend `admin-payment-events` response with `{ webhookHealth: { lastSuccessAt, lastErrorAt, lastErrorMessage, count24h } }` by also querying recent edge-function logs via the internal logs endpoint.
- Add "Archive test orders" and "Retry generation" actions to `admin-payment-events` (POST mode) — same auth, small switch.
- No DB migration required.
- Build/typecheck runs automatically.

## How you'll test it end-to-end

1. **First**, we get the he secret sorted (Part 1) — takes 3 min.
2. Open `/admin/payments`, sign in with `ADMINDASHBOARDTOKEN`.
3. Health pill should be red still (no successes yet). Click **Run Sandbox Test Checkout**.
4. New tab opens with the Stripe form. Pay with `4242 4242 4242 4242`, exp `12/30`, CVC `123`, ZIP anything.
5. Return to admin tab. Within ~5 seconds you'll see rows appear: `checkout.session.completed` → `queued` → `pipeline_complete`. Health pill flips green.
6. If step 5 shows a red row with a new error message, we fix that one thing and repeat. No more mystery.

## Why this order

Adding the test button before fixing the secret would just give you a slicker way to reproduce the same failure. Secret first, button second.