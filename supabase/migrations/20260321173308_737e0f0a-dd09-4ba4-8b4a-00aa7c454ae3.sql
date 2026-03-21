
CREATE TABLE public.registry_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  sync_type text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'running',
  records_found integer DEFAULT 0,
  records_inserted integer DEFAULT 0,
  records_updated integer DEFAULT 0,
  records_skipped integer DEFAULT 0,
  error_message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  triggered_by uuid,
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE public.registry_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sync log"
ON public.registry_sync_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_registry_sync_log_source ON public.registry_sync_log (source, started_at DESC);
