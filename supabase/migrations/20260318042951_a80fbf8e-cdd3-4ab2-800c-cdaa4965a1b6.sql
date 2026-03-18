
-- Function to compute user activity status based on combined signals
-- Returns: 'active' (≤7d), 'idle' (7-30d), 'inactive' (30-90d), 'dormant' (90d+)
CREATE OR REPLACE FUNCTION public.compute_user_activity_status(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_session timestamptz;
  v_last_post timestamptz;
  v_last_comment timestamptz;
  v_last_connection timestamptz;
  v_last_application timestamptz;
  v_last_activity timestamptz;
  v_days_inactive numeric;
  v_status text;
BEGIN
  -- Last session heartbeat
  SELECT MAX(last_active_at) INTO v_last_session
  FROM public.active_sessions WHERE user_id = p_user_id;

  -- Last post
  SELECT MAX(created_at) INTO v_last_post
  FROM public.posts WHERE author_id = p_user_id;

  -- Last comment
  SELECT MAX(created_at) INTO v_last_comment
  FROM public.comments WHERE author_id = p_user_id;

  -- Last connection action
  SELECT MAX(created_at) INTO v_last_connection
  FROM public.connections WHERE from_user_id = p_user_id OR to_user_id = p_user_id;

  -- Last job application
  SELECT MAX(created_at) INTO v_last_application
  FROM public.job_applications WHERE applicant_id = p_user_id;

  -- Most recent of all signals
  v_last_activity := GREATEST(
    v_last_session,
    v_last_post,
    v_last_comment,
    v_last_connection,
    v_last_application
  );

  -- If no activity at all, use profile creation date
  IF v_last_activity IS NULL THEN
    SELECT created_at INTO v_last_activity FROM public.profiles WHERE id = p_user_id;
  END IF;

  v_days_inactive := EXTRACT(EPOCH FROM (now() - COALESCE(v_last_activity, now()))) / 86400.0;

  v_status := CASE
    WHEN v_days_inactive <= 7 THEN 'active'
    WHEN v_days_inactive <= 30 THEN 'idle'
    WHEN v_days_inactive <= 90 THEN 'inactive'
    ELSE 'dormant'
  END;

  RETURN jsonb_build_object(
    'status', v_status,
    'last_active_at', v_last_activity,
    'days_inactive', ROUND(v_days_inactive)
  );
END;
$$;

-- Batch version for admin panel efficiency (avoids N+1)
CREATE OR REPLACE FUNCTION public.get_users_activity_status(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, status text, last_active_at timestamptz, days_inactive numeric)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH user_list AS (
    SELECT unnest(p_user_ids) AS uid
  ),
  last_sessions AS (
    SELECT a.user_id AS uid, MAX(a.last_active_at) AS ts
    FROM public.active_sessions a
    WHERE a.user_id = ANY(p_user_ids)
    GROUP BY a.user_id
  ),
  last_posts AS (
    SELECT p.author_id AS uid, MAX(p.created_at) AS ts
    FROM public.posts p
    WHERE p.author_id = ANY(p_user_ids)
    GROUP BY p.author_id
  ),
  last_comments AS (
    SELECT c.author_id AS uid, MAX(c.created_at) AS ts
    FROM public.comments c
    WHERE c.author_id = ANY(p_user_ids)
    GROUP BY c.author_id
  ),
  last_connections AS (
    SELECT x.uid, MAX(x.ts) AS ts FROM (
      SELECT c.from_user_id AS uid, MAX(c.created_at) AS ts
      FROM public.connections c WHERE c.from_user_id = ANY(p_user_ids) GROUP BY c.from_user_id
      UNION ALL
      SELECT c.to_user_id AS uid, MAX(c.created_at) AS ts
      FROM public.connections c WHERE c.to_user_id = ANY(p_user_ids) GROUP BY c.to_user_id
    ) x GROUP BY x.uid
  ),
  combined AS (
    SELECT
      ul.uid,
      GREATEST(
        ls.ts, lp.ts, lc.ts, lco.ts
      ) AS last_act
    FROM user_list ul
    LEFT JOIN last_sessions ls ON ls.uid = ul.uid
    LEFT JOIN last_posts lp ON lp.uid = ul.uid
    LEFT JOIN last_comments lc ON lc.uid = ul.uid
    LEFT JOIN last_connections lco ON lco.uid = ul.uid
  ),
  with_fallback AS (
    SELECT
      c.uid,
      COALESCE(c.last_act, pr.created_at) AS last_act
    FROM combined c
    LEFT JOIN public.profiles pr ON pr.id = c.uid
  )
  SELECT
    wf.uid AS user_id,
    CASE
      WHEN EXTRACT(EPOCH FROM (now() - wf.last_act)) / 86400.0 <= 7 THEN 'active'
      WHEN EXTRACT(EPOCH FROM (now() - wf.last_act)) / 86400.0 <= 30 THEN 'idle'
      WHEN EXTRACT(EPOCH FROM (now() - wf.last_act)) / 86400.0 <= 90 THEN 'inactive'
      ELSE 'dormant'
    END::text AS status,
    wf.last_act AS last_active_at,
    ROUND(EXTRACT(EPOCH FROM (now() - wf.last_act)) / 86400.0)::numeric AS days_inactive
  FROM with_fallback wf;
END;
$$;
