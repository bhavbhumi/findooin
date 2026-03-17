
-- Update TrustCircle IQ™ scoring function for 5-circle model
-- Circles: 1=Inner Circle, 2=Primary Network, 3=Secondary Network, 4=Tertiary Network, 5=Ecosystem

CREATE OR REPLACE FUNCTION public.compute_trustcircle_iq(p_viewer_id UUID, p_limit INT DEFAULT 80)
RETURNS TABLE(
  target_id UUID,
  affinity_score NUMERIC,
  circle_tier SMALLINT,
  role_weight NUMERIC,
  intent_multiplier NUMERIC,
  trust_proximity NUMERIC,
  activity_resonance NUMERIC,
  freshness_decay NUMERIC,
  referral_boost NUMERIC,
  referral_source TEXT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_roles TEXT[];
  v_viewer_specs TEXT[];
  v_viewer_certs TEXT[];
  v_viewer_location TEXT;
BEGIN
  -- Get viewer's roles
  SELECT array_agg(ur.role::TEXT) INTO v_roles
  FROM public.user_roles ur WHERE ur.user_id = p_viewer_id;
  v_roles := COALESCE(v_roles, ARRAY['investor']);

  -- Get viewer profile data for resonance
  SELECT p.specializations, p.certifications, p.location
  INTO v_viewer_specs, v_viewer_certs, v_viewer_location
  FROM public.profiles p WHERE p.id = p_viewer_id;

  RETURN QUERY
  WITH
  -- 1st degree connections
  first_degree AS (
    SELECT CASE WHEN c.from_user_id = p_viewer_id THEN c.to_user_id ELSE c.from_user_id END AS user_id
    FROM public.connections c
    WHERE (c.from_user_id = p_viewer_id OR c.to_user_id = p_viewer_id)
      AND c.connection_type = 'connect' AND c.status = 'accepted'
  ),
  -- 2nd degree connections
  second_degree AS (
    SELECT DISTINCT CASE WHEN c.from_user_id = fd.user_id THEN c.to_user_id ELSE c.from_user_id END AS user_id,
           fd.user_id AS via_user_id
    FROM first_degree fd
    JOIN public.connections c ON (c.from_user_id = fd.user_id OR c.to_user_id = fd.user_id)
      AND c.connection_type = 'connect' AND c.status = 'accepted'
    WHERE CASE WHEN c.from_user_id = fd.user_id THEN c.to_user_id ELSE c.from_user_id END != p_viewer_id
      AND CASE WHEN c.from_user_id = fd.user_id THEN c.to_user_id ELSE c.from_user_id END NOT IN (SELECT user_id FROM first_degree)
  ),
  -- 3rd degree connections
  third_degree AS (
    SELECT DISTINCT CASE WHEN c.from_user_id = sd.user_id THEN c.to_user_id ELSE c.from_user_id END AS user_id
    FROM second_degree sd
    JOIN public.connections c ON (c.from_user_id = sd.user_id OR c.to_user_id = sd.user_id)
      AND c.connection_type = 'connect' AND c.status = 'accepted'
    WHERE CASE WHEN c.from_user_id = sd.user_id THEN c.to_user_id ELSE c.from_user_id END != p_viewer_id
      AND CASE WHEN c.from_user_id = sd.user_id THEN c.to_user_id ELSE c.from_user_id END NOT IN (SELECT user_id FROM first_degree)
      AND CASE WHEN c.from_user_id = sd.user_id THEN c.to_user_id ELSE c.from_user_id END NOT IN (SELECT user_id FROM second_degree)
  ),
  -- Mutual connection counts
  mutual_counts AS (
    SELECT sd.user_id, COUNT(DISTINCT sd.via_user_id)::NUMERIC AS mutual_count
    FROM second_degree sd GROUP BY sd.user_id
  ),
  -- Referral paths
  referral_paths AS (
    SELECT rc.referred_user_id AS target,
           rc.referrer_id,
           'referral' AS ref_type,
           COALESCE(rp.full_name, 'Someone') AS referrer_name
    FROM public.referral_conversions rc
    LEFT JOIN public.profiles rp ON rp.id = rc.referrer_id
    WHERE rc.referrer_id = p_viewer_id OR rc.referred_user_id IN (SELECT user_id FROM first_degree)
    UNION ALL
    SELECT i.introduced_user_id AS target,
           i.introducer_id AS referrer_id,
           i.introduction_type AS ref_type,
           COALESCE(ip.full_name, 'Someone') AS referrer_name
    FROM public.introductions i
    LEFT JOIN public.profiles ip ON ip.id = i.introducer_id
    WHERE i.target_user_id = p_viewer_id AND i.status = 'pending'
    UNION ALL
    SELECT ce.card_owner_id AS target,
           ce.viewer_id AS referrer_id,
           'card_exchange' AS ref_type,
           '' AS referrer_name
    FROM public.card_exchanges ce
    WHERE ce.viewer_id = p_viewer_id AND ce.action IN ('save', 'connect')
  ),
  -- Intent signals (last 7 days)
  viewer_intent AS (
    SELECT signal_type, COUNT(*) AS sig_count
    FROM public.intent_signals
    WHERE user_id = p_viewer_id AND created_at > now() - INTERVAL '7 days'
    GROUP BY signal_type
  ),
  -- Shared events
  viewer_events AS (
    SELECT event_id FROM public.event_registrations WHERE user_id = p_viewer_id
  ),
  -- Candidate pool with scoring
  candidates AS (
    SELECT
      p.id AS t_id,
      p.full_name,
      p.verification_status,
      p.specializations AS t_specs,
      p.certifications AS t_certs,
      p.location AS t_location,
      COALESCE(ux.last_active_date, p.created_at::date) AS last_active,
      (SELECT array_agg(ur2.role::TEXT) FROM public.user_roles ur2 WHERE ur2.user_id = p.id) AS t_roles,
      -- Connection degree (5-tier)
      CASE
        WHEN p.id IN (SELECT user_id FROM first_degree) THEN 1.0
        WHEN p.id IN (SELECT user_id FROM second_degree) THEN 0.6
        WHEN p.id IN (SELECT user_id FROM third_degree) THEN 0.3
        ELSE 0.1
      END AS conn_degree,
      -- Is 1st/2nd/3rd degree
      CASE WHEN p.id IN (SELECT user_id FROM first_degree) THEN true ELSE false END AS is_1st,
      CASE WHEN p.id IN (SELECT user_id FROM second_degree) THEN true ELSE false END AS is_2nd,
      CASE WHEN p.id IN (SELECT user_id FROM third_degree) THEN true ELSE false END AS is_3rd,
      -- Mutual connections
      COALESCE(mc.mutual_count, 0) AS mutuals,
      -- Shared events
      (SELECT COUNT(*) FROM public.event_registrations er
       WHERE er.user_id = p.id AND er.event_id IN (SELECT event_id FROM viewer_events))::NUMERIC AS shared_events,
      -- Content engagement
      (SELECT COUNT(*) FROM public.post_interactions pi
       JOIN public.posts po ON po.id = pi.post_id
       WHERE pi.user_id = p_viewer_id AND po.author_id = p.id)::NUMERIC AS engagement_count,
      -- Referral info
      rp.referrer_name AS ref_name,
      rp.ref_type,
      CASE
        WHEN rp.referrer_id IN (SELECT user_id FROM first_degree) THEN 1.0
        WHEN rp.referrer_id IN (SELECT user_id FROM second_degree) THEN 0.6
        WHEN rp.referrer_id IN (SELECT user_id FROM third_degree) THEN 0.3
        ELSE 0.15
      END AS ref_circle_pos,
      -- Has referral path
      CASE WHEN rp.referrer_name IS NOT NULL THEN true ELSE false END AS has_referral
    FROM public.profiles p
    LEFT JOIN public.user_xp ux ON ux.user_id = p.id
    LEFT JOIN mutual_counts mc ON mc.user_id = p.id
    LEFT JOIN LATERAL (
      SELECT referrer_id, referrer_name, ref_type
      FROM referral_paths WHERE target = p.id LIMIT 1
    ) rp ON true
    WHERE p.id != p_viewer_id
      AND p.onboarding_completed = true
  )
  SELECT
    c.t_id AS target_id,
    -- Final affinity score
    ROUND((
      -- Role Weight (max across role combos)
      (SELECT MAX(
        CASE
          WHEN vr = 'investor' AND tr = 'intermediary' THEN 0.9
          WHEN vr = 'investor' AND tr = 'issuer' THEN 0.7
          WHEN vr = 'investor' AND tr = 'investor' THEN 0.3
          WHEN vr = 'intermediary' AND tr = 'investor' THEN 0.85
          WHEN vr = 'intermediary' AND tr = 'issuer' THEN 0.75
          WHEN vr = 'intermediary' AND tr = 'intermediary' THEN 0.5
          WHEN vr = 'issuer' AND tr = 'intermediary' THEN 0.9
          WHEN vr = 'issuer' AND tr = 'investor' THEN 0.7
          WHEN vr = 'issuer' AND tr = 'issuer' THEN 0.4
          ELSE 0.3
        END
      ) FROM unnest(v_roles) vr, unnest(COALESCE(c.t_roles, ARRAY['investor'])) tr)
      *
      -- Intent Multiplier
      CASE
        WHEN EXISTS (SELECT 1 FROM viewer_intent WHERE signal_type = 'listing_browse') AND 'issuer' = ANY(COALESCE(c.t_roles, ARRAY['investor'])) THEN 1.5
        WHEN EXISTS (SELECT 1 FROM viewer_intent WHERE signal_type = 'cert_search') AND c.verification_status = 'verified' THEN 1.6
        WHEN EXISTS (SELECT 1 FROM viewer_intent WHERE signal_type = 'event_register') AND c.shared_events > 0 THEN 1.3
        WHEN EXISTS (SELECT 1 FROM viewer_intent WHERE signal_type = 'job_post') THEN 1.4
        WHEN EXISTS (SELECT 1 FROM viewer_intent WHERE signal_type = 'listing_browse') THEN 1.2
        ELSE 1.0
      END
      *
      -- Trust Proximity
      (
        c.conn_degree * 0.35
        + CASE WHEN c.verification_status = 'verified' THEN 0.25 ELSE 0.075 END
        + CASE WHEN v_viewer_location IS NOT NULL AND c.t_location = v_viewer_location THEN 0.15 ELSE 0.04 END
        + LEAST(c.mutuals / 10.0, 1.0) * 0.20
      )
      *
      -- Activity Resonance
      (0.4
        + LEAST(c.shared_events / 3.0, 1.0) * 0.30
        + LEAST(c.engagement_count / 5.0, 1.0) * 0.25
        + CASE WHEN c.t_specs IS NOT NULL AND v_viewer_specs IS NOT NULL
               AND c.t_specs && v_viewer_specs THEN 0.15 ELSE 0.0 END
      )
      *
      -- Freshness Decay
      EXP(-0.05 * GREATEST(EXTRACT(EPOCH FROM (now() - c.last_active::timestamptz)) / 86400.0, 0))
    )
    + CASE
        WHEN c.ref_name IS NOT NULL THEN
          c.ref_circle_pos * CASE c.ref_type
            WHEN 'explicit' THEN 1.0
            WHEN 'card_exchange' THEN 0.8
            WHEN 'lead_share' THEN 0.7
            WHEN 'referral' THEN 0.4
            ELSE 0.3
          END * 0.15
        ELSE 0.0
      END
    , 4)::NUMERIC AS affinity_score,

    -- 5-tier circle assignment
    CASE
      -- Inner Circle: 1st degree + high role affinity OR explicit referral from 1st circle
      WHEN c.is_1st AND (SELECT MAX(
        CASE
          WHEN vr = 'investor' AND tr = 'intermediary' THEN 0.9
          WHEN vr = 'intermediary' AND tr = 'investor' THEN 0.85
          WHEN vr = 'issuer' AND tr = 'intermediary' THEN 0.9
          WHEN vr = 'investor' AND tr = 'issuer' THEN 0.7
          WHEN vr = 'intermediary' AND tr = 'issuer' THEN 0.75
          WHEN vr = 'issuer' AND tr = 'investor' THEN 0.7
          ELSE 0.3
        END
      ) FROM unnest(v_roles) vr, unnest(COALESCE(c.t_roles, ARRAY['investor'])) tr) >= 0.7
        THEN 1::SMALLINT
      WHEN c.has_referral AND c.ref_circle_pos >= 1.0 THEN 1::SMALLINT

      -- Primary Network: 1st degree (lower affinity) OR 2nd degree with high role match + mutuals
      WHEN c.is_1st THEN 2::SMALLINT
      WHEN c.is_2nd AND (SELECT MAX(
        CASE
          WHEN vr = 'investor' AND tr = 'intermediary' THEN 0.9
          WHEN vr = 'intermediary' AND tr = 'investor' THEN 0.85
          WHEN vr = 'issuer' AND tr = 'intermediary' THEN 0.9
          ELSE 0.3
        END
      ) FROM unnest(v_roles) vr, unnest(COALESCE(c.t_roles, ARRAY['investor'])) tr) >= 0.7
        AND c.mutuals >= 2 THEN 2::SMALLINT
      WHEN c.has_referral AND c.ref_circle_pos >= 0.6 THEN 2::SMALLINT

      -- Secondary Network: 2nd degree (warm prospects, investors-of-investors) OR event co-attendees
      WHEN c.is_2nd THEN 3::SMALLINT
      WHEN c.shared_events >= 1 THEN 3::SMALLINT
      WHEN c.has_referral AND c.ref_circle_pos >= 0.3 THEN 3::SMALLINT

      -- Tertiary Network: 3rd degree OR same geography/certification + active
      WHEN c.is_3rd THEN 4::SMALLINT
      WHEN c.engagement_count >= 1 THEN 4::SMALLINT
      WHEN v_viewer_location IS NOT NULL AND c.t_location = v_viewer_location
        AND c.verification_status = 'verified' THEN 4::SMALLINT
      WHEN c.t_specs IS NOT NULL AND v_viewer_specs IS NOT NULL
        AND c.t_specs && v_viewer_specs THEN 4::SMALLINT

      -- Ecosystem: everyone else who is verified or active
      ELSE 5::SMALLINT
    END AS circle_tier,

    -- Component scores
    (SELECT MAX(
      CASE
        WHEN vr = 'investor' AND tr = 'intermediary' THEN 0.9
        WHEN vr = 'investor' AND tr = 'issuer' THEN 0.7
        WHEN vr = 'investor' AND tr = 'investor' THEN 0.3
        WHEN vr = 'intermediary' AND tr = 'investor' THEN 0.85
        WHEN vr = 'intermediary' AND tr = 'issuer' THEN 0.75
        WHEN vr = 'intermediary' AND tr = 'intermediary' THEN 0.5
        WHEN vr = 'issuer' AND tr = 'intermediary' THEN 0.9
        WHEN vr = 'issuer' AND tr = 'investor' THEN 0.7
        WHEN vr = 'issuer' AND tr = 'issuer' THEN 0.4
        ELSE 0.3
      END
    ) FROM unnest(v_roles) vr, unnest(COALESCE(c.t_roles, ARRAY['investor'])) tr)::NUMERIC AS role_weight,

    CASE
      WHEN EXISTS (SELECT 1 FROM viewer_intent WHERE signal_type = 'listing_browse') AND 'issuer' = ANY(COALESCE(c.t_roles, ARRAY['investor'])) THEN 1.5
      WHEN EXISTS (SELECT 1 FROM viewer_intent WHERE signal_type = 'cert_search') AND c.verification_status = 'verified' THEN 1.6
      WHEN EXISTS (SELECT 1 FROM viewer_intent WHERE signal_type = 'event_register') AND c.shared_events > 0 THEN 1.3
      ELSE 1.0
    END::NUMERIC AS intent_multiplier,

    (c.conn_degree * 0.35 + CASE WHEN c.verification_status = 'verified' THEN 0.25 ELSE 0.075 END + LEAST(c.mutuals / 10.0, 1.0) * 0.20)::NUMERIC AS trust_proximity,

    (0.4 + LEAST(c.shared_events / 3.0, 1.0) * 0.30 + LEAST(c.engagement_count / 5.0, 1.0) * 0.25)::NUMERIC AS activity_resonance,

    EXP(-0.05 * GREATEST(EXTRACT(EPOCH FROM (now() - c.last_active::timestamptz)) / 86400.0, 0))::NUMERIC AS freshness_decay,

    CASE WHEN c.ref_name IS NOT NULL THEN (c.ref_circle_pos * 0.15)::NUMERIC ELSE 0::NUMERIC END AS referral_boost,

    CASE
      WHEN c.ref_name IS NOT NULL AND c.ref_type = 'explicit' THEN 'Referred by ' || c.ref_name
      WHEN c.ref_name IS NOT NULL AND c.ref_type = 'card_exchange' THEN 'Card exchanged'
      WHEN c.ref_name IS NOT NULL AND c.ref_type = 'referral' THEN 'Via referral'
      WHEN c.ref_name IS NOT NULL AND c.ref_type = 'lead_share' THEN 'Lead shared by ' || c.ref_name
      WHEN c.shared_events >= 1 THEN 'Event co-attendee'
      WHEN c.is_2nd THEN 'Via mutual connections'
      WHEN c.is_3rd THEN '3rd degree connection'
      ELSE NULL
    END AS referral_source

  FROM candidates c
  ORDER BY
    CASE
      WHEN c.is_1st AND (SELECT MAX(
        CASE WHEN vr = 'investor' AND tr = 'intermediary' THEN 0.9
          WHEN vr = 'intermediary' AND tr = 'investor' THEN 0.85
          WHEN vr = 'issuer' AND tr = 'intermediary' THEN 0.9
          ELSE 0.3 END
      ) FROM unnest(v_roles) vr, unnest(COALESCE(c.t_roles, ARRAY['investor'])) tr) >= 0.7 THEN 1
      WHEN c.has_referral AND c.ref_circle_pos >= 1.0 THEN 1
      WHEN c.is_1st THEN 2
      WHEN c.is_2nd AND c.mutuals >= 2 THEN 2
      WHEN c.is_2nd THEN 3
      WHEN c.is_3rd THEN 4
      ELSE 5
    END,
    2 DESC
  LIMIT p_limit;
END;
$$;
