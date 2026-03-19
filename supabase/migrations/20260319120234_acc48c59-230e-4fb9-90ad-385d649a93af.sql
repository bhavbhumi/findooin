
-- Moderation flags table for SEBI 2026 coded messaging compliance
CREATE TABLE public.moderation_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  author_id UUID NOT NULL,
  content_excerpt TEXT NOT NULL DEFAULT '',
  detection_summary TEXT NOT NULL DEFAULT '',
  matched_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  severity TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for admin queries
CREATE INDEX idx_moderation_flags_status ON public.moderation_flags (status);
CREATE INDEX idx_moderation_flags_severity ON public.moderation_flags (severity);
CREATE INDEX idx_moderation_flags_resource ON public.moderation_flags (resource_type, resource_id);
CREATE INDEX idx_moderation_flags_author ON public.moderation_flags (author_id);
CREATE INDEX idx_moderation_flags_created ON public.moderation_flags (created_at DESC);

-- Enable RLS
ALTER TABLE public.moderation_flags ENABLE ROW LEVEL SECURITY;

-- Only admins can manage moderation flags
CREATE POLICY "Admins can manage moderation flags"
ON public.moderation_flags
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Staff (moderators) can view moderation flags
CREATE POLICY "Staff can view moderation flags"
ON public.moderation_flags
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_staff = true));

-- Authenticated users can insert flags for their own content
CREATE POLICY "Authenticated users can insert own flags"
ON public.moderation_flags
FOR INSERT
TO authenticated
WITH CHECK (author_id = auth.uid());

-- Auto-update updated_at
CREATE TRIGGER update_moderation_flags_updated_at
  BEFORE UPDATE ON public.moderation_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();
