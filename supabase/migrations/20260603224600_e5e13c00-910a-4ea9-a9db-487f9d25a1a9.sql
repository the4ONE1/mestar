REVOKE EXECUTE ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text,text,text) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text,text,text) TO service_role;