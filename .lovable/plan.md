## Goal
Rebuild the full database schema on the new backend (project `ktkebsvoqbxsirgluxeo`) so `storybook_orders` and all supporting tables/functions exist, then redeploy edge functions and verify checkout works.

## Steps

1. **Inspect current state of the new backend**
   - Query the connected DB to list existing tables, functions, and policies.
   - Identify what's missing vs. what the app expects (`storybook_orders`, `customer_ratings`, `payment_events`, `gift_cards`, `email_send_log`, `email_send_state`, `email_subscribers`, `email_unsubscribe_tokens`, `suppressed_emails`, `storybook_audio`, plus RPCs like `create_pending_order`, `get_order_status`, `is_pending_order`, `confirm_pdf_received`, `submit_rating`, `enqueue_email`, `email_queue_wake`, `email_queue_dispatch`, `delete_email`, `move_to_dlq`, `read_email_batch`).

2. **Drop the stale `orders` table (if unused) and create the full schema in one migration**
   - `CREATE TABLE` for every table listed above with the columns the code actually reads/writes (derived from `src/integrations/supabase/types.ts` and edge functions).
   - For each `public` table: `GRANT` to `authenticated`/`service_role` (and `anon` only where a policy allows it), `ENABLE ROW LEVEL SECURITY`, then create the exact policies documented in security memory:
     - `storybook_orders`: no anon read; access via SECURITY DEFINER RPCs.
     - `customer_ratings`: no direct insert; only via `submit_rating` RPC with recovery token.
     - `email_*`: service-role-managed.
   - Recreate all SECURITY DEFINER functions currently in the old project (bodies already shown in context): `create_pending_order`, `get_order_status`, `is_pending_order`, `confirm_pdf_received`, `submit_rating`, `enqueue_email`, `delete_email`, `move_to_dlq`, `read_email_batch`, `email_queue_wake`, `email_queue_dispatch`.
   - Add `updated_at` triggers where appropriate.
   - Create storage buckets `storybooks` and `customer-photos` (private) with the same policies as before.

3. **Vault + cron plumbing**
   - Store `email_queue_service_role_key` in vault (required by `email_queue_wake`/`_dispatch`).
   - Note: cron scheduling of `process-email-queue` is created lazily by `email_queue_wake` at first enqueue — no explicit migration needed, but confirm `pg_cron` and `pg_net` extensions are enabled.

4. **Deploy all edge functions** to the new project (same 22-function list as before).

5. **Verify end to end**
   - Run `psql` sanity queries: table list, RLS on, sample RPC calls.
   - Call `create-pending-order` → `create-checkout` via curl with a test payload; confirm a Stripe session client_secret comes back.
   - Confirm Stripe webhook endpoint (sandbox `?env=sandbox`) is reachable; fire a test event and confirm a row lands in `payment_events`.
   - Report back with a clear pass/fail per step.

## Technical details / risks

- Old `orders` table: I'll only drop it if it has no rows or the user confirms it's disposable. Otherwise I'll leave it alongside the new `storybook_orders`.
- `SUPABASE_SERVICE_ROLE_KEY` for the new project must already be bound to edge functions (Lovable Cloud handles this automatically on connect — I'll verify by test-invoking one function).
- Stripe webhook secrets (`PAYMENTS_SANDBOX_WEBHOOK_SECRET`, `PAYMENTS_LIVE_WEBHOOK_SECRET`) are connector-managed. If webhook signature verification fails after redeploy, the connector needs to be reconnected in the Lovable UI — I'll flag that clearly rather than trying to rotate them myself.
- The recreated schema will match the current code exactly; no code changes should be required. If a mismatch surfaces during verification I'll list it and ask before editing code.

## Deliverable

One migration that brings the new backend to parity with what the app expects, all 22 edge functions deployed, and a short verification report (checkout session created + webhook received).