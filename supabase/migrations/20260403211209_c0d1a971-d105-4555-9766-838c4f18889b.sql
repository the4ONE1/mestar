-- Add SELECT policy on storybooks bucket so signed URLs work
-- (service_role already handles uploads; SELECT allows download via signed URLs)
CREATE POLICY "Allow public read via signed URLs"
ON storage.objects
FOR SELECT
TO authenticated, anon
USING (bucket_id = 'storybooks');

-- Add DELETE policy scoped to service_role only
CREATE POLICY "Service role can delete storybooks"
ON storage.objects
FOR DELETE
TO service_role
USING (bucket_id = 'storybooks');