-- Self-healing backstop: every 5 minutes, retry orders that paid but never
-- got a PDF (webhook missed, or generation crashed mid-pipeline). See the
-- retry-stuck-orders edge function for the full recovery logic. This
-- complements (not replaces) mestar-order-failures-hourly, which keeps
-- alerting a human about anything the retry can't fix.

do $$ begin perform cron.unschedule('mestar-retry-stuck-orders'); exception when others then null; end $$;

select cron.schedule(
  'mestar-retry-stuck-orders',
  '*/5 * * * *',
  $job$
  select net.http_post(
    url := 'https://gqgloucjqvhbbjyxfgqw.supabase.co/functions/v1/retry-stuck-orders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1)
    ),
    body := '{}'::jsonb
  );
  $job$
);
