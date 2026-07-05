CREATE TABLE public.email_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'popup',
  discount_code_sent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous signups (public form)
CREATE POLICY "Anyone can subscribe"
ON public.email_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- No public SELECT — only service role (backend) can read the list
CREATE INDEX idx_email_subscribers_created_at ON public.email_subscribers(created_at DESC);