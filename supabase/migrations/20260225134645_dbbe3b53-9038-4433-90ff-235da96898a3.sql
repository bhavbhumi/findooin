
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- 'like', 'comment', 'repost', 'follow', 'connection_request', 'connection_accepted'
  reference_id TEXT, -- post_id, connection_id, etc.
  reference_type TEXT, -- 'post', 'connection', 'comment'
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast user queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, read) WHERE read = false;

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only read their own notifications
CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update (mark read) their own notifications
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role / triggers can insert (authenticated users can insert for others via trigger)
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create a notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_reference_id TEXT,
  p_reference_type TEXT,
  p_message TEXT
) RETURNS void AS $$
BEGIN
  -- Don't notify yourself
  IF p_user_id = p_actor_id THEN
    RETURN;
  END IF;
  
  INSERT INTO public.notifications (user_id, actor_id, type, reference_id, reference_type, message)
  VALUES (p_user_id, p_actor_id, p_type, p_reference_id, p_reference_type, p_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: on post_interactions insert (like, repost, bookmark)
CREATE OR REPLACE FUNCTION public.notify_on_post_interaction() RETURNS trigger AS $$
DECLARE
  v_author_id UUID;
  v_actor_name TEXT;
  v_type_label TEXT;
BEGIN
  -- Get post author
  SELECT author_id INTO v_author_id FROM public.posts WHERE id = NEW.post_id;
  -- Get actor name
  SELECT COALESCE(display_name, full_name) INTO v_actor_name FROM public.profiles WHERE id = NEW.user_id;
  
  IF NEW.interaction_type = 'like' THEN
    v_type_label := 'liked your post';
  ELSIF NEW.interaction_type = 'repost' THEN
    v_type_label := 'reposted your post';
  ELSIF NEW.interaction_type = 'bookmark' THEN
    -- Don't notify on bookmarks
    RETURN NEW;
  ELSE
    RETURN NEW;
  END IF;
  
  PERFORM public.create_notification(
    v_author_id, NEW.user_id, NEW.interaction_type,
    NEW.post_id, 'post',
    v_actor_name || ' ' || v_type_label
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_post_interaction
  AFTER INSERT ON public.post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_post_interaction();

-- Trigger: on comments insert
CREATE OR REPLACE FUNCTION public.notify_on_comment() RETURNS trigger AS $$
DECLARE
  v_author_id UUID;
  v_actor_name TEXT;
BEGIN
  SELECT author_id INTO v_author_id FROM public.posts WHERE id = NEW.post_id;
  SELECT COALESCE(display_name, full_name) INTO v_actor_name FROM public.profiles WHERE id = NEW.author_id;
  
  PERFORM public.create_notification(
    v_author_id, NEW.author_id, 'comment',
    NEW.post_id, 'post',
    v_actor_name || ' commented on your post'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_comment();

-- Trigger: on connections insert (follow / connection_request)
CREATE OR REPLACE FUNCTION public.notify_on_connection() RETURNS trigger AS $$
DECLARE
  v_actor_name TEXT;
  v_type TEXT;
  v_msg TEXT;
BEGIN
  SELECT COALESCE(display_name, full_name) INTO v_actor_name FROM public.profiles WHERE id = NEW.from_user_id;
  
  IF NEW.connection_type = 'follow' THEN
    v_type := 'follow';
    v_msg := v_actor_name || ' started following you';
  ELSIF NEW.connection_type = 'connect' AND NEW.status = 'pending' THEN
    v_type := 'connection_request';
    v_msg := v_actor_name || ' sent you a connection request';
  ELSE
    RETURN NEW;
  END IF;
  
  PERFORM public.create_notification(
    NEW.to_user_id, NEW.from_user_id, v_type,
    NEW.id::TEXT, 'connection',
    v_msg
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_connection
  AFTER INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_connection();

-- Trigger: on connection accepted
CREATE OR REPLACE FUNCTION public.notify_on_connection_accepted() RETURNS trigger AS $$
DECLARE
  v_acceptor_name TEXT;
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'accepted' AND NEW.connection_type = 'connect' THEN
    SELECT COALESCE(display_name, full_name) INTO v_acceptor_name FROM public.profiles WHERE id = NEW.to_user_id;
    
    PERFORM public.create_notification(
      NEW.from_user_id, NEW.to_user_id, 'connection_accepted',
      NEW.id::TEXT, 'connection',
      v_acceptor_name || ' accepted your connection request'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_connection_accepted
  AFTER UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_connection_accepted();
