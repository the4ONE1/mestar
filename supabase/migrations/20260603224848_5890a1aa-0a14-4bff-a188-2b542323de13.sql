DROP POLICY IF EXISTS "Anon can read order status by id" ON public.storybook_orders;
CREATE POLICY "Deny anon access"
ON public.storybook_orders
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

REVOKE SELECT (id, status, story_title, pdf_url, child_name, customer_email, selected_addons) ON public.storybook_orders FROM anon;