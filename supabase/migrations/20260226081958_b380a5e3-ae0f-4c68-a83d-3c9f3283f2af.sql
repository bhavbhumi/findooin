
-- Table to track active sessions per user (max 3 concurrent)
CREATE TABLE public.active_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookups by user_id
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions (user_id);

-- RLS: users can only manage their own sessions
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.active_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.active_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.active_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.active_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to enforce max 3 sessions: returns the session tokens to revoke (oldest ones beyond limit)
CREATE OR REPLACE FUNCTION public.enforce_session_limit(p_user_id UUID, p_max_sessions INTEGER DEFAULT 3)
RETURNS TABLE(session_token TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT as2.session_token
  FROM public.active_sessions as2
  WHERE as2.user_id = p_user_id
  ORDER BY as2.created_at DESC
  OFFSET p_max_sessions;
END;
$$;

-- Function to clean up stale sessions (older than 7 days without activity)
CREATE OR REPLACE FUNCTION public.cleanup_stale_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.active_sessions
  WHERE last_active_at < now() - INTERVAL '7 days';
END;
$$;
