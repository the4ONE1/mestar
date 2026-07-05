DROP POLICY IF EXISTS "Anon can upload customer photos to valid path" ON storage.objects;

CREATE POLICY "Anon can upload customer photos to valid path"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'customer-photos'
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(child|supporting)\.(jpg|jpeg|png|webp)$'
  AND (metadata->>'size')::bigint <= 5242880
  AND lower(metadata->>'mimetype') IN ('image/jpeg','image/jpg','image/png','image/webp')
);