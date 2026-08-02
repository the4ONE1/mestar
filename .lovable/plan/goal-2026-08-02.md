Admin Payments Dashboard — env, event_type, and webhook delivery filters

## Goal

Extend the existing `/admin/payments` page so the owner can quickly filter payment events by order ID, environment (live/sandbox), and event type, and see a clear webhook delivery status summary.

## Current state

- `src/pages/AdminPayments.tsx` already renders the event table and a 24-hour health summary.
- `supabase/functions/admin-payment-events/index.ts` already exposes a secure GET endpoint with `orderId` and `limit` query params.
- `payment_events` stores `event_type`, `result`, `message`, and `payload_summary`. Webhook events put `env` inside `payload_summary` (e.g., `{ env: "live" }`).

## What will be built

1. Backend filter support in `admin-payment-events`:
   - Accept `env` (live/sandbox) and `event_type` query params.
   - Apply `env` filter by reading `payload_summary->>'env'`.
   - Apply `event_type` filter by exact match.
   - Keep existing `orderId` and `limit` params.
   - Return distinct `event_type` values so the UI can build a dropdown.

2. Frontend updates in `AdminPayments.tsx`:
   - Add env filter dropdown: All / Live / Sandbox.
   - Add event_type filter dropdown: All / dynamic list from backend.
   - Keep existing orderId filter and retry action.
   - Add a "Webhook delivery status" summary showing counts by result (success, failed, ignored) for the current filtered view.
   - Highlight signature failures and pipeline failures.

3. Deploy the updated `admin-payment-events` edge function.

## Verification

- Load `/admin/payments`, filter to `env=live`, and confirm only live-mode webhook events appear.
- Filter by `event_type=checkout.session.completed` and confirm matching rows.
- Confirm the health card and delivery status summary update with the filtered results.
