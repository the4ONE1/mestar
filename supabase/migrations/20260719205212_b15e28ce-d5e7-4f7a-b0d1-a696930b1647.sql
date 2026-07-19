-- Drop the older 8-arg overload of create_pending_order so PostgREST can
-- unambiguously resolve calls (the 10-arg version with photo paths is the one
-- the checkout flow uses). This unblocks new orders from being created.
DROP FUNCTION IF EXISTS public.create_pending_order(
  text, text, text, text, text, boolean, jsonb, text
);