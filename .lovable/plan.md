# Fix the false 1:20 a.m. alert (and the Shopify wording)

## What actually happened

I checked the alert log and the payment records. The 1:20 a.m. text/email was a **false alarm**, twice over:

1. **The "11 payment/webhook issues" were not issues at all.** All 11 records from the last 24 hours are successes: 9 `pipeline_started` (a story generation kicked off normally) and 2 `addon_fulfillment_started`. The monitor flags anything whose result isn't the literal word `ok`, so normal success records get reported as problems.
2. **The "Shopify" line is dead leftover text.** The alert email prints a `Shopify:` label for every order, and it's always empty (`—`). Nothing is calling Shopify — it's just a stale word in the alert template and the order table column it reads.
3. **The 1 failed order is your own old test** (order `b0a6e213`, child "Milo", sent to mestar.orders@gmail.com) from yesterday evening — it timed out. No customer was involved. It keeps re-appearing because the monitor looks back 24 hours, so it re-alerts every ~50 minutes until it ages out.

## The fix

- Only treat a payment record as a problem when it actually is one — flag failures/errors explicitly (signature failures, errors, unprocessed) instead of "anything that isn't `ok`".
- Remove the `Shopify:` line from the alert email entirely.
- Ignore internal test orders (anything addressed to `mestar.orders@gmail.com`) in the failure alerts, so your own tests stop paging you at 1 a.m. Real customer failures still alert.

Result: alerts only when something is genuinely broken for a paying customer, and no Shopify wording anywhere in them.

## Technical detail

Single file: `supabase/functions/order-health-check/index.ts`.
- Replace the `.neq("result", "ok")` payment_events filter with an allow-list of genuine failure results (e.g. `signature_failed`, `error`, `unprocessed`), so `pipeline_started` / `addon_fulfillment_started` / `ok` are treated as healthy.
- Drop `shopify_order_id` from the select list, the `OrderRow` interface, and `fmtRow`.
- Exclude `customer_email = 'mestar.orders@gmail.com'` from the failed/stuck queries.
- Redeploy the function. No database migration, no other files touched.

Cost: one small edit plus one function deploy.
