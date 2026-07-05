
-- Helper to verify the uploaded photo filename matches an existing pending order
CREATE OR REPLACE FUNCTION public.is_pending_order(_order_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.storybook_orders
    WHERE id = _order_id
      AND status IN ('pending_payment', 'pending')
      AND created_at > now() - interval '24 hours'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_pending_order(uuid) TO anon, authenticated;

-- Replace permissive upload policy with one that also verifies the order exists
DROP POLICY IF EXISTS "Anon can upload customer photos to valid path" ON storage.objects;

CREATE POLICY "Anon can upload customer photos to valid path"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'customer-photos'
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-(child|supporting)\.(jpg|jpeg|png|webp)$'
  AND ((metadata ->> 'size')::bigint <= 5242880)
  AND lower(metadata ->> 'mimetype') = ANY (ARRAY['image/jpeg','image/jpg','image/png','image/webp'])
  AND public.is_pending_order(
    (substring(name from '^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'))::uuid
  )
);
