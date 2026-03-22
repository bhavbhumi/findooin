
-- Add share_expires_at column to vault_files for TTL enforcement
ALTER TABLE public.vault_files 
ADD COLUMN IF NOT EXISTS share_expires_at timestamptz;

-- Create vault share access log table
CREATE TABLE IF NOT EXISTS public.vault_share_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_file_id uuid NOT NULL REFERENCES public.vault_files(id) ON DELETE CASCADE,
  share_token text NOT NULL,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  viewer_ip_hint text,
  user_agent_hint text
);

-- Enable RLS on access log
ALTER TABLE public.vault_share_access_log ENABLE ROW LEVEL SECURITY;

-- Only file owners can view their access logs
CREATE POLICY "File owners can view access logs"
ON public.vault_share_access_log
FOR SELECT
TO authenticated
USING (
  vault_file_id IN (
    SELECT id FROM public.vault_files WHERE user_id = auth.uid()
  )
);

-- Allow anonymous inserts for access logging (public share page)
CREATE POLICY "Anyone can log share access"
ON public.vault_share_access_log
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_vault_share_access_log_file_id 
ON public.vault_share_access_log(vault_file_id);

CREATE INDEX IF NOT EXISTS idx_vault_share_access_log_token 
ON public.vault_share_access_log(share_token);
