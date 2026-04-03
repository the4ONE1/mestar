
-- 1. Remove the overly permissive storage SELECT policy
DROP POLICY IF EXISTS "Allow public read via signed URLs" ON storage.objects;

-- 2. Add explicit deny policies for anon/authenticated on storybook_orders
CREATE POLICY "Deny anon access"
ON public.storybook_orders
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access"
ON public.storybook_orders
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);
