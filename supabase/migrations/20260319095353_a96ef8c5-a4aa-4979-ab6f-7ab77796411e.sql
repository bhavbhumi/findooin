
-- Tighten rate limits: Posts 3/hr, Messages 20/5min, Connections 10/hr
CREATE OR REPLACE FUNCTION public.enforce_post_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.check_rate_limit(NEW.author_id, 'post', 'posts', 60, 3) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 3 posts per hour';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_message_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.check_rate_limit(NEW.sender_id, 'message', 'messages', 5, 20) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 20 messages per 5 minutes';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.enforce_connection_rate_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.check_rate_limit(NEW.from_user_id, 'connection', 'connections', 60, 10) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 10 connection requests per hour';
  END IF;
  RETURN NEW;
END;
$$;
