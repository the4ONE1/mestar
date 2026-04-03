-- Storage bucket for generated storybook PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('storybooks', 'storybooks', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to storybook files
CREATE POLICY "Public read storybooks" ON storage.objects FOR SELECT USING (bucket_id = 'storybooks');

-- Allow service role to upload storybook files
CREATE POLICY "Service upload storybooks" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'storybooks');

-- Orders tracking table
CREATE TABLE public.storybook_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text,
  child_name text NOT NULL,
  child_age integer NOT NULL,
  theme text NOT NULL,
  strength text,
  has_supporting_character boolean DEFAULT false,
  supporting_character_name text,
  story_title text,
  story_text text,
  coloring_prompts jsonb,
  pdf_storage_path text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.storybook_orders ENABLE ROW LEVEL SECURITY;

-- No RLS policies needed - only edge functions with service role access this table