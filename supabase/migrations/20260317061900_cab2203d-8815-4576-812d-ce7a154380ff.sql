
-- Tab privacy settings per user
CREATE TABLE public.profile_tab_privacy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  activity_visibility text NOT NULL DEFAULT 'everyone',
  network_visibility text NOT NULL DEFAULT 'everyone',
  vault_visibility text NOT NULL DEFAULT 'only_me',
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profile_tab_privacy ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed to check visibility when viewing profiles)
CREATE POLICY "Anyone can read tab privacy" ON public.profile_tab_privacy
FOR SELECT USING (true);

-- Users can manage own settings
CREATE POLICY "Users can manage own tab privacy" ON public.profile_tab_privacy
FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
