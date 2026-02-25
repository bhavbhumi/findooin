
-- Fix notify_on_comment to cast UUID to TEXT
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
  v_actor_name TEXT;
BEGIN
  SELECT author_id INTO v_author_id FROM public.posts WHERE id = NEW.post_id;
  IF v_author_id IS NOT NULL AND v_author_id != NEW.author_id THEN
    SELECT COALESCE(display_name, full_name) INTO v_actor_name FROM public.profiles WHERE id = NEW.author_id;
    PERFORM public.create_notification(
      v_author_id, NEW.author_id, 'comment',
      NEW.post_id::text, 'post',
      v_actor_name || ' commented on your post'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix similar issues in other trigger functions
CREATE OR REPLACE FUNCTION notify_on_post_interaction()
RETURNS TRIGGER AS $$
DECLARE
  v_author_id UUID;
  v_actor_name TEXT;
BEGIN
  SELECT author_id INTO v_author_id FROM public.posts WHERE id = NEW.post_id;
  IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
    SELECT COALESCE(display_name, full_name) INTO v_actor_name FROM public.profiles WHERE id = NEW.user_id;
    PERFORM public.create_notification(
      v_author_id, NEW.user_id, NEW.interaction_type,
      NEW.post_id::text, 'post',
      v_actor_name || ' ' || NEW.interaction_type || 'd your post'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
