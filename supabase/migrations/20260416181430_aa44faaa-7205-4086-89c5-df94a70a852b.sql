-- Add new columns to storybook_orders for illustrations and add-on tracking
ALTER TABLE public.storybook_orders
ADD COLUMN IF NOT EXISTS illustration_prompts jsonb,
ADD COLUMN IF NOT EXISTS illustration_storage_paths jsonb,
ADD COLUMN IF NOT EXISTS selected_addons jsonb DEFAULT '{"coloring": false, "character": false, "illustrations": true, "audiobook": false}'::jsonb;

-- Create storybook_audio table for interactive audiobook reader
CREATE TABLE IF NOT EXISTS public.storybook_audio (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.storybook_orders(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  page_text text NOT NULL,
  audio_storage_path text,
  word_timings jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (order_id, page_number)
);

-- Enable RLS
ALTER TABLE public.storybook_audio ENABLE ROW LEVEL SECURITY;

-- Deny anon and authenticated access (service role only)
CREATE POLICY "Deny anon access on audio"
ON public.storybook_audio
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Deny authenticated access on audio"
ON public.storybook_audio
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Service role full access on audio"
ON public.storybook_audio
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Index for fast page lookups
CREATE INDEX IF NOT EXISTS idx_storybook_audio_order_page
ON public.storybook_audio (order_id, page_number);