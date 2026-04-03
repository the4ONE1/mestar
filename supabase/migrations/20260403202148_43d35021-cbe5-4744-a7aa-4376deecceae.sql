
-- Make the storybooks bucket private
UPDATE storage.buckets SET public = false WHERE id = 'storybooks';

-- Remove the public read policy
DROP POLICY IF EXISTS "Public read storybooks" ON storage.objects;
