
-- ═══════════════════════════════════════════════════════
-- 1. RPC: get_feed_posts — returns enriched feed in ONE query
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_feed_posts(
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_data)
    FROM (
      SELECT json_build_object(
        'id', p.id,
        'content', p.content,
        'post_type', p.post_type,
        'post_kind', p.post_kind,
        'query_category', p.query_category,
        'hashtags', p.hashtags,
        'attachment_url', p.attachment_url,
        'attachment_name', p.attachment_name,
        'attachment_type', p.attachment_type,
        'created_at', p.created_at,
        'author', json_build_object(
          'id', pr.id,
          'full_name', COALESCE(pr.full_name, 'Unknown'),
          'display_name', pr.display_name,
          'avatar_url', pr.avatar_url,
          'verification_status', COALESCE(pr.verification_status, 'unverified')
        ),
        'roles', COALESCE(
          (SELECT json_agg(json_build_object('role', ur.role, 'sub_type', ur.sub_type))
           FROM public.user_roles ur WHERE ur.user_id = p.author_id),
          '[]'::json
        ),
        'like_count', (SELECT COUNT(*) FROM public.post_interactions pi WHERE pi.post_id = p.id AND pi.interaction_type = 'like'),
        'comment_count', (SELECT COUNT(*) FROM public.comments c WHERE c.post_id = p.id),
        'bookmark_count', (SELECT COUNT(*) FROM public.post_interactions pi WHERE pi.post_id = p.id AND pi.interaction_type = 'bookmark')
      ) AS row_data
      FROM public.posts p
      LEFT JOIN public.profiles pr ON pr.id = p.author_id
      WHERE p.scheduled_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) sub
  );
END;
$$;

-- ═══════════════════════════════════════════════════════
-- 2. RPC: get_conversations — returns conversation list in ONE query
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_conversations(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(conv ORDER BY last_message_at DESC)
    FROM (
      SELECT
        other_id AS user_id,
        pr.full_name,
        pr.display_name,
        pr.avatar_url,
        last_msg AS last_message,
        last_at AS last_message_at,
        unread AS unread_count
      FROM (
        SELECT
          CASE WHEN m.sender_id = p_user_id THEN m.receiver_id ELSE m.sender_id END AS other_id,
          (array_agg(m.content ORDER BY m.created_at DESC))[1] AS last_msg,
          MAX(m.created_at) AS last_at,
          COUNT(*) FILTER (WHERE m.receiver_id = p_user_id AND m.read = false) AS unread
        FROM public.messages m
        WHERE m.sender_id = p_user_id OR m.receiver_id = p_user_id
        GROUP BY other_id
      ) agg
      LEFT JOIN public.profiles pr ON pr.id = agg.other_id
    ) conv
  );
END;
$$;

-- ═══════════════════════════════════════════════════════
-- 3. Rate limiting function (reusable)
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_table TEXT,
  p_window_minutes INT,
  p_max_count INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  recent_count INT;
BEGIN
  EXECUTE format(
    'SELECT COUNT(*) FROM public.%I WHERE %s = $1 AND created_at > NOW() - ($2 || '' minutes'')::interval',
    p_table,
    CASE
      WHEN p_table = 'posts' THEN 'author_id'
      WHEN p_table = 'messages' THEN 'sender_id'
      WHEN p_table = 'connections' THEN 'from_user_id'
      ELSE 'user_id'
    END
  ) INTO recent_count USING p_user_id, p_window_minutes;

  RETURN recent_count < p_max_count;
END;
$$;

-- ═══════════════════════════════════════════════════════
-- 4. Rate limit triggers
-- ═══════════════════════════════════════════════════════

-- Posts: max 10 per hour
CREATE OR REPLACE FUNCTION public.enforce_post_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.check_rate_limit(NEW.author_id, 'post', 'posts', 60, 10) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 10 posts per hour';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_post_rate_limit ON public.posts;
CREATE TRIGGER trg_post_rate_limit
  BEFORE INSERT ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_post_rate_limit();

-- Messages: max 60 per 5 minutes
CREATE OR REPLACE FUNCTION public.enforce_message_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.check_rate_limit(NEW.sender_id, 'message', 'messages', 5, 60) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 60 messages per 5 minutes';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_message_rate_limit ON public.messages;
CREATE TRIGGER trg_message_rate_limit
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_message_rate_limit();

-- Connections: max 30 per hour
CREATE OR REPLACE FUNCTION public.enforce_connection_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.check_rate_limit(NEW.from_user_id, 'connection', 'connections', 60, 30) THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 30 connection requests per hour';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_connection_rate_limit ON public.connections;
CREATE TRIGGER trg_connection_rate_limit
  BEFORE INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_connection_rate_limit();
