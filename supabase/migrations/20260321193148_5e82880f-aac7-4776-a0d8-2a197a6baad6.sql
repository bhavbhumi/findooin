
-- Table to store pause/resume state for registry sync at source and granular SEBI type level
CREATE TABLE public.registry_sync_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  sebi_intm_id INTEGER,
  is_paused BOOLEAN NOT NULL DEFAULT false,
  paused_by UUID REFERENCES auth.users(id),
  paused_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, sebi_intm_id)
);

-- Allow NULLs in unique constraint to work (source-level pause has NULL sebi_intm_id)
CREATE UNIQUE INDEX registry_sync_config_source_only ON public.registry_sync_config (source) WHERE sebi_intm_id IS NULL;

ALTER TABLE public.registry_sync_config ENABLE ROW LEVEL SECURITY;

-- Only staff can read/write
CREATE POLICY "Staff can manage sync config"
  ON public.registry_sync_config
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_staff = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_staff = true));
