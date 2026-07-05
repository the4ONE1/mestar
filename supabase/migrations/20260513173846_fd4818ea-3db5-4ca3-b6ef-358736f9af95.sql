
DROP FUNCTION IF EXISTS public.get_order_status(uuid);

CREATE FUNCTION public.get_order_status(_order_id uuid)
 RETURNS TABLE(id uuid, status text, story_title text, pdf_url text, child_name text, has_error boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, status, story_title, pdf_url, child_name, (status = 'failed') AS has_error
  FROM public.storybook_orders
  WHERE id = _order_id
  LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.get_order_status(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_order_status(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_status(uuid) TO anon;

CREATE OR REPLACE FUNCTION public.create_pending_order(_child_name text, _child_age text, _theme text, _strength text, _supporting_character_name text, _has_supporting_character boolean, _selected_addons jsonb, _customer_email text)
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

  INSERT INTO public.storybook_orders (
    child_name, child_age, theme, strength,
    supporting_character_name, has_supporting_character,
    selected_addons, customer_email, status
  )
  VALUES (
    trim(_child_name), _child_age, _theme, COALESCE(_strength, NULL),
    _supporting_character_name, COALESCE(_has_supporting_character, false),
    COALESCE(_selected_addons, '{}'::jsonb), lower(_customer_email),
    'pending_payment'
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_pending_order(text,text,text,text,text,boolean,jsonb,text) TO anon;
