
-- Recovery token for abandoned Stripe checkouts
ALTER TABLE public.storybook_orders
  ADD COLUMN IF NOT EXISTS recovery_token uuid NOT NULL DEFAULT gen_random_uuid();

-- Tighten customer_ratings: order_id required, must match an existing order, one rating per order
DELETE FROM public.customer_ratings WHERE order_id IS NULL;

ALTER TABLE public.customer_ratings
  ALTER COLUMN order_id SET NOT NULL;

ALTER TABLE public.customer_ratings
  DROP CONSTRAINT IF EXISTS customer_ratings_order_unique;
ALTER TABLE public.customer_ratings
  ADD CONSTRAINT customer_ratings_order_unique UNIQUE (order_id);

-- Replace the loose anon INSERT policy with one that requires a real order
DROP POLICY IF EXISTS "Anyone can insert a rating" ON public.customer_ratings;
CREATE POLICY "Insert rating for existing order"
  ON public.customer_ratings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    stars BETWEEN 1 AND 5
    AND EXISTS (SELECT 1 FROM public.storybook_orders o WHERE o.id = order_id)
  );
