-- Add columns needed for Shopify webhook-driven order pipeline
ALTER TABLE public.storybook_orders
  ADD COLUMN IF NOT EXISTS shopify_order_id text,
  ADD COLUMN IF NOT EXISTS shopify_checkout_token text,
  ADD COLUMN IF NOT EXISTS pdf_url text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_storybook_orders_shopify_order_id
  ON public.storybook_orders (shopify_order_id)
  WHERE shopify_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_storybook_orders_shopify_checkout_token
  ON public.storybook_orders (shopify_checkout_token)
  WHERE shopify_checkout_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_storybook_orders_status
  ON public.storybook_orders (status);

-- Allow the /order-complete page to poll a single order row by id (anon) WITHOUT exposing the whole table.
-- We only return safe fields via a SECURITY DEFINER function, so we keep RLS fully locked.
CREATE OR REPLACE FUNCTION public.get_order_status(_order_id uuid)
RETURNS TABLE (
  id uuid,
  status text,
  story_title text,
  pdf_url text,
  error_message text,
  child_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, status, story_title, pdf_url, error_message, child_name
  FROM public.storybook_orders
  WHERE id = _order_id
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_status(uuid) TO anon, authenticated;

-- Allow anon (the browser, before checkout) to create a pending order row via a tightly-scoped function.
CREATE OR REPLACE FUNCTION public.create_pending_order(
  _child_name text,
  _child_age text,
  _theme text,
  _strength text,
  _supporting_character_name text,
  _has_supporting_character boolean,
  _selected_addons jsonb,
  _customer_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.storybook_orders (
    child_name, child_age, theme, strength,
    supporting_character_name, has_supporting_character,
    selected_addons, customer_email, status
  )
  VALUES (
    _child_name, _child_age, _theme, COALESCE(_strength, NULL),
    _supporting_character_name, COALESCE(_has_supporting_character, false),
    COALESCE(_selected_addons, '{}'::jsonb), _customer_email,
    'pending_payment'
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_pending_order(text, text, text, text, text, boolean, jsonb, text) TO anon, authenticated;