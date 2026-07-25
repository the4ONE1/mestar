-- Drop the permissive insert policy that only checked order existence
DROP POLICY IF EXISTS "Insert rating for existing order" ON public.customer_ratings;
REVOKE INSERT ON public.customer_ratings FROM anon, authenticated;

-- Validated rating submission: requires the order's recovery_token
CREATE OR REPLACE FUNCTION public.submit_rating(
  p_order_id uuid,
  p_recovery_token text,
  p_stars int,
  p_comment text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
BEGIN
  IF p_stars IS NULL OR p_stars < 1 OR p_stars > 5 THEN
    RAISE EXCEPTION 'Invalid stars';
  END IF;
  IF p_recovery_token IS NULL OR length(p_recovery_token) < 8 THEN
    RAISE EXCEPTION 'Missing token';
  END IF;

  SELECT customer_email INTO v_email
  FROM public.storybook_orders
  WHERE id = p_order_id
    AND recovery_token IS NOT NULL
    AND recovery_token::text = p_recovery_token;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found or token invalid';
  END IF;

  INSERT INTO public.customer_ratings (order_id, customer_email, stars, comment)
  VALUES (
    p_order_id,
    v_email,
    p_stars,
    NULLIF(btrim(COALESCE(p_comment, '')), '')
  )
  ON CONFLICT (order_id) DO NOTHING;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_rating(uuid, text, int, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_rating(uuid, text, int, text) TO anon, authenticated;