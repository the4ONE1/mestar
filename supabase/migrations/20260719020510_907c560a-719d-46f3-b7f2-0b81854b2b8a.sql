-- Fix: customer_ratings — remove SELECT grants (belt-and-suspenders on top
-- of the existing "no SELECT policy" RLS lockdown). Ratings are inserted by
-- customers and read only by service_role / admin dashboards.
REVOKE SELECT ON public.customer_ratings FROM anon, authenticated;

-- Fix: SECURITY DEFINER functions callable by signed-in users. These are only
-- invoked from edge functions using the service role, so anon/authenticated
-- have no legitimate reason to execute them directly.
REVOKE EXECUTE ON FUNCTION public.get_order_status(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_pending_order(text, text, text, text, text, boolean, jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_pending_order(text, text, text, text, text, boolean, jsonb, text, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;