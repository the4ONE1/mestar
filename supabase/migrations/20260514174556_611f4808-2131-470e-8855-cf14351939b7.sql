
-- 1. Photo path columns on orders
ALTER TABLE public.storybook_orders
  ADD COLUMN IF NOT EXISTS child_photo_path text,
  ADD COLUMN IF NOT EXISTS supporting_character_photo_path text;

-- 2. Private bucket for customer photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('customer-photos', 'customer-photos', false)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage policies: anon can INSERT only; service role full access (default)
DROP POLICY IF EXISTS "Anon can upload customer photos" ON storage.objects;
CREATE POLICY "Anon can upload customer photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'customer-photos');

-- 4. Updated RPC: now accepts two optional photo paths
CREATE OR REPLACE FUNCTION public.create_pending_order(
  _child_name text,
  _child_age text,
  _theme text,
  _strength text,
  _supporting_character_name text,
  _has_supporting_character boolean,
  _selected_addons jsonb,
  _customer_email text,
  _child_photo_path text DEFAULT NULL,
  _supporting_character_photo_path text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  IF _child_name IS NULL OR length(trim(_child_name)) = 0 OR length(_child_name) > 100 THEN
    RAISE EXCEPTION 'Invalid child name';
  END IF;
  IF _child_age IS NULL OR length(_child_age) > 20 THEN
    RAISE EXCEPTION 'Invalid child age';
  END IF;
  IF _theme IS NULL OR length(_theme) > 200 THEN
    RAISE EXCEPTION 'Invalid theme';
  END IF;
  IF _strength IS NOT NULL AND length(_strength) > 200 THEN
    RAISE EXCEPTION 'Invalid strength';
  END IF;
  IF _supporting_character_name IS NOT NULL AND length(_supporting_character_name) > 100 THEN
    RAISE EXCEPTION 'Invalid supporting character name';
  END IF;
  IF _customer_email IS NULL OR _customer_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' OR length(_customer_email) > 254 THEN
    RAISE EXCEPTION 'Invalid customer email';
  END IF;
  IF _child_photo_path IS NOT NULL AND length(_child_photo_path) > 500 THEN
    RAISE EXCEPTION 'Invalid child photo path';
  END IF;
  IF _supporting_character_photo_path IS NOT NULL AND length(_supporting_character_photo_path) > 500 THEN
    RAISE EXCEPTION 'Invalid supporting character photo path';
  END IF;

  INSERT INTO public.storybook_orders (
    child_name, child_age, theme, strength,
    supporting_character_name, has_supporting_character,
    selected_addons, customer_email, status,
    child_photo_path, supporting_character_photo_path
  )
  VALUES (
    trim(_child_name), _child_age, _theme, COALESCE(_strength, NULL),
    _supporting_character_name, COALESCE(_has_supporting_character, false),
    COALESCE(_selected_addons, '{}'::jsonb), lower(_customer_email),
    'pending_payment',
    NULLIF(_child_photo_path, ''),
    NULLIF(_supporting_character_photo_path, '')
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;
