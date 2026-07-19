
-- Archive test orders (your own emails + placeholders) as cancelled
UPDATE public.storybook_orders
SET status = 'cancelled',
    error_message = COALESCE(error_message, 'archived: test order')
WHERE status = 'pending_payment'
  AND (
    customer_email IN (
      'mestar.orders@gmail.com',
      'test-checkout@mestar.pro',
      'test@example.com',
      'tester@example.com',
      'e2e@example.com',
      't@e.com',
      'e@x.com'
    )
    OR child_name IN ('Test Kid','Tester','Testy','E2E','T','Test')
  );

-- Mark remaining real-looking pending orders as abandoned (never paid)
UPDATE public.storybook_orders
SET status = 'abandoned',
    error_message = COALESCE(error_message, 'abandoned: checkout never completed')
WHERE status = 'pending_payment';
