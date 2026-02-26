
-- Table to track all file uploads across the app
CREATE TABLE IF NOT EXISTS public.file_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bucket TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS policies
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own uploads"
  ON public.file_uploads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own uploads"
  ON public.file_uploads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own uploads"
  ON public.file_uploads FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Public can view uploads in public buckets (for post attachments, avatars, banners)
CREATE POLICY "Anyone can view public bucket uploads"
  ON public.file_uploads FOR SELECT
  TO anon
  USING (bucket IN ('post-attachments', 'avatars', 'banners'));
