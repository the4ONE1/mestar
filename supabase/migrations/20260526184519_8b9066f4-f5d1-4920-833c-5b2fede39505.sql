-- Tighten customer-photos bucket: limit size, allowed mime types, and strict path format
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/jpg']
WHERE id = 'customer-photos';

DROP POLICY IF EXISTS "Anon can upload customer photos" ON storage.objects;
CREATE POLICY "Anon can upload customer photos to valid path"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'customer-photos'
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(child|supporting)\.(jpg|jpeg|png|webp)$'
);

-- email_subscribers: validate email on insert + explicit restrictive deny for reads/updates/deletes
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.email_subscribers;
CREATE POLICY "Anon can subscribe with valid email"
ON public.email_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(email) <= 254
);

CREATE POLICY "Deny non-service read on subscribers"
ON public.email_subscribers
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (false);

CREATE POLICY "Deny non-service update on subscribers"
ON public.email_subscribers
AS RESTRICTIVE
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny non-service delete on subscribers"
ON public.email_subscribers
AS RESTRICTIVE
FOR DELETE
TO anon, authenticated
USING (false);

CREATE POLICY "Service role can read subscribers"
ON public.email_subscribers
FOR SELECT
TO service_role
USING (true);

-- Restrict SECURITY DEFINER create_pending_order (10-arg) so only anon (checkout flow) can execute it
REVOKE EXECUTE ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text,text,text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text,text,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text,text,text) TO anon;