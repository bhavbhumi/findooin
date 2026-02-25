
-- Fix search_path for security
ALTER FUNCTION notify_on_comment() SET search_path = public;
ALTER FUNCTION notify_on_post_interaction() SET search_path = public;
