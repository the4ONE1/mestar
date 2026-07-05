-- Store the service role key in Vault so it isn't hard-coded in migration files,
-- then reschedule the order-health-check cron jobs to use it instead of the
-- publicly-known anon key.

-- 1. Ensure vault has the service role key (idempotent insert).
do $$
declare
  v_key text;
begin
  -- Only insert a placeholder if the secret doesn't already exist; the user
  -- will set the real value via the Vault UI / a secret manager.
  if not exists (select 1 from vault.secrets where name = 'service_role_key') then
    perform vault.create_secret('REPLACE_WITH_SERVICE_ROLE_KEY', 'service_role_key');
  end if;
end $$;

-- 2. Unschedule the old jobs (which embedded the anon key) if present.
do $$ begin perform cron.unschedule('mestar-order-failures-hourly'); exception when others then null; end $$;
do $$ begin perform cron.unschedule('mestar-order-daily-summary'); exception when others then null; end $$;

-- 3. Reschedule using the service role key pulled from Vault at runtime.
select cron.schedule(
  'mestar-order-failures-hourly',
  '0 * * * *',
  $job$
  select net.http_post(
    url := 'https://gqgloucjqvhbbjyxfgqw.supabase.co/functions/v1/order-health-check',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1)
    ),
    body := '{"mode": "failures"}'::jsonb
  );
  $job$
);

select cron.schedule(
  'mestar-order-daily-summary',
  '0 9 * * *',
  $job$
  select net.http_post(
    url := 'https://gqgloucjqvhbbjyxfgqw.supabase.co/functions/v1/order-health-check',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1)
    ),
    body := '{"mode": "daily"}'::jsonb
  );
  $job$
);