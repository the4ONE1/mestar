
-- 1. Ratings table for 1-click 5-star reviews
CREATE TABLE public.customer_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.storybook_orders(id) ON DELETE SET NULL,
  customer_email TEXT,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.customer_ratings TO anon;
GRANT SELECT, INSERT ON public.customer_ratings TO authenticated;
GRANT ALL ON public.customer_ratings TO service_role;

ALTER TABLE public.customer_ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a rating (public form after PDF download)
CREATE POLICY "Anyone can insert a rating"
  ON public.customer_ratings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (stars BETWEEN 1 AND 5);

-- Anyone can read ratings (used for public review counts / averages)
CREATE POLICY "Anyone can read ratings"
  ON public.customer_ratings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 2. Fulfillment confirmation tracking on orders
ALTER TABLE public.storybook_orders
  ADD COLUMN IF NOT EXISTS fulfillment_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

CREATE INDEX IF NOT EXISTS idx_storybook_orders_stripe_session
  ON public.storybook_orders(stripe_session_id);

-- 3. RPC: customer confirms PDF received (public, uses order id — same trust model as get_order_status)
CREATE OR REPLACE FUNCTION public.confirm_pdf_received(_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _already TIMESTAMPTZ;
BEGIN
  SELECT fulfillment_confirmed_at INTO _already
  FROM public.storybook_orders
  WHERE id = _order_id AND status = 'complete';

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF _already IS NOT NULL THEN
    RETURN TRUE; -- idempotent
  END IF;

  UPDATE public.storybook_orders
  SET fulfillment_confirmed_at = now()
  WHERE id = _order_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.confirm_pdf_received(UUID) TO anon, authenticated;
