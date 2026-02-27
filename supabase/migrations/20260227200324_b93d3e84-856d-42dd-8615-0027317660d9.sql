
-- Vault files table
CREATE TABLE public.vault_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  public_url text,
  category text NOT NULL DEFAULT 'other',
  tags text[] DEFAULT '{}'::text[],
  description text DEFAULT '',
  share_token text UNIQUE,
  is_shared boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'upload',
  source_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vault_files ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Users can manage own vault files"
  ON public.vault_files FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Anyone can view shared files via share_token (handled in app via public query)
CREATE POLICY "Anyone can view shared vault files"
  ON public.vault_files FOR SELECT
  USING (is_shared = true AND share_token IS NOT NULL);

-- Updated_at trigger
CREATE TRIGGER vault_files_updated_at
  BEFORE UPDATE ON public.vault_files
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Create vault storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault', 'vault', false);

-- Storage RLS: owners can upload to their folder
CREATE POLICY "Users can upload vault files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own vault files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own vault files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vault' AND (storage.foldername(name))[1] = auth.uid()::text);
