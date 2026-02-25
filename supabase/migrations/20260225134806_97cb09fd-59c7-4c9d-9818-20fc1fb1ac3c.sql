
-- Fix search_path for all notification functions
ALTER FUNCTION public.create_notification(UUID, UUID, TEXT, TEXT, TEXT, TEXT) SET search_path = public;
ALTER FUNCTION public.notify_on_post_interaction() SET search_path = public;
ALTER FUNCTION public.notify_on_comment() SET search_path = public;
ALTER FUNCTION public.notify_on_connection() SET search_path = public;
ALTER FUNCTION public.notify_on_connection_accepted() SET search_path = public;
