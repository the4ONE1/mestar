REVOKE EXECUTE ON FUNCTION public.submit_rating(uuid, text, integer, text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_rating(uuid, text, integer, text) TO service_role;