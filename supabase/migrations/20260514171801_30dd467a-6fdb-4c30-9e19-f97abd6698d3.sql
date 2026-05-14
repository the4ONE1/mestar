-- One-time resend of the delivery notification for order 72c22e94-8001-4711-9257-e37454980771 (Shopify order 116).
-- The original send failed because the send-order-notification function was missing verify_jwt=false in config.toml,
-- which caused the gateway to reject the in-process call from create-storybook with 401 Unauthorized.
do $$
declare
  v_key text;
begin
  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name in ('service_role_key', 'email_queue_service_role_key')
  order by case name when 'service_role_key' then 1 else 2 end
  limit 1;

  if v_key is null or v_key = 'REPLACE_WITH_SERVICE_ROLE_KEY' then
    raise notice 'No usable service_role_key in vault — skipping resend';
    return;
  end if;

  perform net.http_post(
    url := 'https://gqgloucjqvhbbjyxfgqw.supabase.co/functions/v1/send-order-notification',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := jsonb_build_object(
      'childName', 'jaedan',
      'childAge', '4-7',
      'theme', 'Outer Space',
      'strength', '',
      'customerEmail', 'mestar.orders@gmail.com',
      'supportingCharacterName', '',
      'pdfUrl', 'https://mestar.pro/order-complete?order_id=72c22e94-8001-4711-9257-e37454980771',
      'orderId', '72c22e94-8001-4711-9257-e37454980771',
      'selectedAddons', '{}'::jsonb
    )
  );
end $$;