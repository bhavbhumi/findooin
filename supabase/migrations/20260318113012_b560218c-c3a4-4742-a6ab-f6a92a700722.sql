
-- Feature flags table
CREATE TABLE public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_enabled boolean NOT NULL DEFAULT false,
  rollout_percentage integer NOT NULL DEFAULT 100,
  target_segment text NOT NULL DEFAULT 'all',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage feature flags"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can read enabled flags
CREATE POLICY "Authenticated users can read enabled flags"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (is_enabled = true);

-- Feature flag audit log (reuses audit_logs table)
-- No separate table needed

-- Index for fast lookups
CREATE INDEX idx_feature_flags_key ON public.feature_flags (flag_key);
CREATE INDEX idx_feature_flags_enabled ON public.feature_flags (is_enabled);
