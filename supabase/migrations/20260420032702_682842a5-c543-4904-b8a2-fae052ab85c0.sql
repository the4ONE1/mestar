-- Enable required extensions for scheduled HTTP calls
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Remove any prior versions of these jobs (safe if they don't exist)
do $$
begin
  perform cron.unschedule('mestar-order-failures-hourly');
exception when others then null;
end $$;

do $$
begin
  perform cron.unschedule('mestar-order-daily-summary');
exception when others then null;
end $$;

-- Hourly failure check (runs at minute 0 of every hour)
select cron.schedule(
  'mestar-order-failures-hourly',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://gqgloucjqvhbbjyxfgqw.supabase.co/functions/v1/order-health-check',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZ2xvdWNqcXZoYmJqeXhmZ3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzgwMjEsImV4cCI6MjA5MDgxNDAyMX0.MQ9w8FY6maFP-ue_1Qzar5qoOPj5Z_BQmUp4poA0UYE"}'::jsonb,
    body := '{"mode": "failures"}'::jsonb
  );
  $$
);

-- Daily summary at 09:00 UTC
select cron.schedule(
  'mestar-order-daily-summary',
  '0 9 * * *',
  $$
  select net.http_post(
    url := 'https://gqgloucjqvhbbjyxfgqw.supabase.co/functions/v1/order-health-check',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxZ2xvdWNqcXZoYmJqeXhmZ3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMzgwMjEsImV4cCI6MjA5MDgxNDAyMX0.MQ9w8FY6maFP-ue_1Qzar5qoOPj5Z_BQmUp4poA0UYE"}'::jsonb,
    body := '{"mode": "daily"}'::jsonb
  );
  $$
);