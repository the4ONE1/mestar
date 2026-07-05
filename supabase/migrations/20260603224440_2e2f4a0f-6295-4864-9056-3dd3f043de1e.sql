DROP FUNCTION IF EXISTS public.get_order_status(uuid);

CREATE FUNCTION public.get_order_status(_order_id uuid)
RETURNS TABLE(
  id uuid,
  status text,
  story_title text,
  pdf_url text,
  child_name text,
  customer_email text,
  has_audiobook boolean,
  has_error boolean
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT
    id,
    status,
    story_title,
    pdf_url,
    child_name,
    customer_email,
    COALESCE((selected_addons ->> 'audiobook')::boolean, false) AS has_audiobook,
    (status = 'failed') AS has_error
  FROM public.storybook_orders
  WHERE id = _order_id
  LIMIT 1;
$function$;

GRANT SELECT (id, status, story_title, pdf_url, child_name, customer_email, selected_addons) ON public.storybook_orders TO anon;

DROP POLICY IF EXISTS "Deny anon access" ON public.storybook_orders;
CREATE POLICY "Anon can read order status by id"
ON public.storybook_orders
FOR SELECT
TO anon
USING (true);

REVOKE ALL ON FUNCTION public.get_order_status(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_order_status(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_status(uuid) TO anon;