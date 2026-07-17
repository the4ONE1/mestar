
-- Fix: customer_ratings public read exposes emails
DROP POLICY IF EXISTS "Anyone can read ratings" ON public.customer_ratings;
-- No SELECT policy for anon/authenticated => reads blocked; service_role bypasses RLS.

-- Fix: SECURITY DEFINER functions callable by signed-in users
REVOKE EXECUTE ON FUNCTION public.confirm_pdf_received(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_pending_order(uuid) FROM PUBLIC, anon, authenticated;
