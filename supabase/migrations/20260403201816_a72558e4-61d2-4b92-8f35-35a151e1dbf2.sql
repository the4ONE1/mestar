
-- Drop the overly permissive existing policy
DROP POLICY IF EXISTS "Service upload storybooks" ON storage.objects;

-- Create a restricted policy that only allows service_role to upload
CREATE POLICY "Service role upload storybooks" ON storage.objects
FOR INSERT TO service_role
WITH CHECK (bucket_id = 'storybooks');
