CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NULL,
  stripe_session_id text NULL,
  stripe_payment_intent_id text NULL,
  event_type text NOT NULL,
  result text NOT NULL,
  message text NULL,
  payload_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_events_order_id ON public.payment_events(order_id);
CREATE INDEX idx_payment_events_created_at ON public.payment_events(created_at DESC);
CREATE INDEX idx_payment_events_session_id ON public.payment_events(stripe_session_id);

GRANT ALL ON public.payment_events TO service_role;

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.payment_events FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');