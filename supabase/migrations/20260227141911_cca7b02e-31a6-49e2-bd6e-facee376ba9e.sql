
-- Immutable date helper for index
CREATE OR REPLACE FUNCTION public.date_of(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
AS $$ SELECT ts::date $$;

-- Profile views tracking table
CREATE TABLE public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL,
  viewer_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX idx_profile_views_viewer_id ON public.profile_views(viewer_id);
CREATE INDEX idx_profile_views_created_at ON public.profile_views(created_at);

-- One view per viewer per profile per day
CREATE UNIQUE INDEX idx_profile_views_unique_daily ON public.profile_views(
  profile_id, viewer_id, public.date_of(created_at)
);

ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile views"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Authenticated users can insert profile views"
  ON public.profile_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id AND viewer_id != profile_id);

CREATE POLICY "Users can see own viewing history"
  ON public.profile_views FOR SELECT
  USING (auth.uid() = viewer_id);
