REVOKE EXECUTE ON FUNCTION public.get_order_status(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_order_status(uuid) TO service_role;