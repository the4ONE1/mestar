CREATE TABLE public.alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_key text NOT NULL,
  severity text NOT NULL DEFAULT 'critical',
  subject text NOT NULL,
  details text NULL,
  channels jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_alert_log_key_created ON public.alert_log(alert_key, created_at DESC);

GRANT ALL ON public.alert_log TO service_role;

ALTER TABLE public.alert_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON public.alert_log FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');