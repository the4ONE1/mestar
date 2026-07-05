
ALTER TABLE public.storybook_orders ENABLE ROW LEVEL SECURITY;

-- Only the service role (used by edge functions) can access orders.
-- No public/anon/authenticated access needed since all CRUD happens server-side.
CREATE POLICY "Service role full access"
ON public.storybook_orders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
