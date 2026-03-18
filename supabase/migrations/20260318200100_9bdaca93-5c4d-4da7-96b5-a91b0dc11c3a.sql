
-- 1. User contacts table — stores imported phone contacts
CREATE TABLE public.user_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name TEXT,
  phone_number TEXT NOT NULL,
  email TEXT,
  matched_user_id UUID,
  invite_status TEXT NOT NULL DEFAULT 'not_invited',
  invited_at TIMESTAMPTZ,
  invited_via TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, phone_number)
);

-- 2. Add invite_channel to invitations table
ALTER TABLE public.invitations
ADD COLUMN IF NOT EXISTS invite_channel TEXT NOT NULL DEFAULT 'email';

-- 3. Enable RLS on user_contacts
ALTER TABLE public.user_contacts ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies — users can only manage their own contacts
CREATE POLICY "Users can view own contacts"
  ON public.user_contacts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own contacts"
  ON public.user_contacts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own contacts"
  ON public.user_contacts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own contacts"
  ON public.user_contacts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 5. Index for fast lookups
CREATE INDEX idx_user_contacts_user_id ON public.user_contacts (user_id);
CREATE INDEX idx_user_contacts_phone ON public.user_contacts (phone_number);
CREATE INDEX idx_user_contacts_matched ON public.user_contacts (matched_user_id) WHERE matched_user_id IS NOT NULL;

-- 6. Updated_at trigger
CREATE TRIGGER update_user_contacts_updated_at
  BEFORE UPDATE ON public.user_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
