## The actual problem (from edge function logs)

`stripe-webhook` returns `504` because it `await`s the full story + image + PDF pipeline before responding to Stripe. Stripe's webhook timeout is ~10 seconds; generation takes 60+ seconds. Confirmed in logs:

```
ERROR handler error Error: create-storybook 504
```

Consequences you're seeing right now:
- Payment goes through (Stripe charges the card)
- "Payment received!" page shows (that's client-side, unrelated to the webhook)
- Order row stays in `pending_payment` / never advances
- **View My Story** → Library errors because there's no story to load
- **No confirmation email** because the email is sent at the end of the pipeline, which never finishes
- Stripe dashboard shows failed webhook deliveries

The `confirm-checkout-payment` fallback (the return-URL safety net) has the same blocking `await`, so it can't rescue the order either.

## Fix

1. **`supabase/functions/stripe-webhook/index.ts`** — replace the blocking `await fireGeneration(orderId)` with `EdgeRuntime.waitUntil(fireGeneration(orderId))`. The webhook returns 200 to Stripe immediately; generation continues in the background. `fireGeneration` already writes `status='failed'` on error, so failures are still recorded.

2. **`supabase/functions/confirm-checkout-payment/index.ts`** — same pattern: `EdgeRuntime.waitUntil(triggerPipeline(orderId))` so the return-URL handler doesn't stall the customer's browser either.

3. **Verify** with one real test-mode purchase (card `4242 4242 4242 4242`):
   - `stripe-webhook` logs show 200, no more `create-storybook 504`
   - Order row transitions `pending_payment` → `generating_story` → `generating_images` → `complete`
   - Confirmation email arrives at the buyer address
   - Library loads the finished PDF

## What I will NOT touch

- No changes to `create-checkout`, `generate-story`, `create-storybook`, `send-transactional-email`, or any UI
- No new secrets, no schema changes, no Stripe dashboard changes
- No guessing — every change is driven by the log evidence above

## Why this is the whole fix

The generation pipeline works when invoked out-of-band. Signature verification is working. Checkout session creation is working. The single point of failure is the synchronous `await` blocking the webhook response, and that's what breaks both the story delivery AND the email.

## Cost expectation

Two small edits + one verification purchase. Should be a tiny fraction of what previous attempts cost, because this time the diagnosis is confirmed from logs, not guessed.