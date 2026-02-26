
CREATE OR REPLACE FUNCTION public.update_post_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE public.post_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  post_kind TEXT NOT NULL DEFAULT 'normal',
  post_type TEXT NOT NULL DEFAULT 'text',
  query_category TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  scheduled_at TIMESTAMPTZ,
  schedule_time TEXT,
  poll_options JSONB,
  survey_questions JSONB,
  mentioned_users JSONB,
  hashtags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.post_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own drafts"
  ON public.post_drafts
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_post_drafts_updated_at
  BEFORE UPDATE ON public.post_drafts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_post_drafts_updated_at();
