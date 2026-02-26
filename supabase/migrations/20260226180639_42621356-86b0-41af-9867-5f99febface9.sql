
-- Fix search_path on all new functions for security
ALTER FUNCTION public.get_feed_posts(INT, INT) SET search_path = public;
ALTER FUNCTION public.get_conversations(UUID) SET search_path = public;
ALTER FUNCTION public.check_rate_limit(UUID, TEXT, TEXT, INT, INT) SET search_path = public;
ALTER FUNCTION public.enforce_post_rate_limit() SET search_path = public;
ALTER FUNCTION public.enforce_message_rate_limit() SET search_path = public;
ALTER FUNCTION public.enforce_connection_rate_limit() SET search_path = public;
