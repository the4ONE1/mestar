DROP POLICY "Deny anon access" ON public.storybook_orders;
DROP POLICY "Deny authenticated access" ON public.storybook_orders;

CREATE POLICY "Deny anon access" ON public.storybook_orders
  AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);

CREATE POLICY "Deny authenticated access" ON public.storybook_orders
  AS RESTRICTIVE FOR ALL TO authenticated USING (false) WITH CHECK (false);