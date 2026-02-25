
-- Messages table for DMs
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id, created_at DESC);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id, read, created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receiver can update messages (mark read)"
  ON public.messages FOR UPDATE
  USING (auth.uid() = receiver_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Reports table for content moderation
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_reports_status ON public.reports(status, created_at DESC);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- User settings/preferences table
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  notify_likes BOOLEAN NOT NULL DEFAULT true,
  notify_comments BOOLEAN NOT NULL DEFAULT true,
  notify_follows BOOLEAN NOT NULL DEFAULT true,
  notify_connections BOOLEAN NOT NULL DEFAULT true,
  notify_messages BOOLEAN NOT NULL DEFAULT true,
  profile_visibility TEXT NOT NULL DEFAULT 'public',
  show_email BOOLEAN NOT NULL DEFAULT false,
  show_phone BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger: notify on new message
CREATE OR REPLACE FUNCTION public.notify_on_message() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sender_name TEXT;
BEGIN
  SELECT COALESCE(display_name, full_name) INTO v_sender_name FROM public.profiles WHERE id = NEW.sender_id;
  
  PERFORM public.create_notification(
    NEW.receiver_id, NEW.sender_id, 'message',
    NEW.id::TEXT, 'message',
    v_sender_name || ' sent you a message'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_message();
