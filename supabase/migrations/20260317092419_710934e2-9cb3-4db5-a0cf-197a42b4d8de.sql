
-- TrustCircle IQ™ Schema

-- 1. Intent signals table - tracks behavioral signals for intent multiplier
CREATE TABLE public.intent_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_type TEXT NOT NULL,
  signal_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.intent_signals ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_intent_signals_user_id ON public.intent_signals(user_id);
CREATE INDEX idx_intent_signals_created_at ON public.intent_signals(created_at);

-- Users can insert their own signals, admins can read all
CREATE POLICY "Users can insert own signals" ON public.intent_signals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own signals" ON public.intent_signals
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Auto-cleanup old signals (>30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_intent_signals()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  DELETE FROM public.intent_signals WHERE created_at < now() - INTERVAL '30 days';
END;
$$;

-- 2. Introductions table - explicit referrals and introductions
CREATE TABLE public.introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introducer_id UUID NOT NULL,
  introduced_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  introduction_type TEXT NOT NULL DEFAULT 'explicit',
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  acted_at TIMESTAMPTZ
);

ALTER TABLE public.introductions ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_introductions_target ON public.introductions(target_user_id);
CREATE INDEX idx_introductions_introduced ON public.introductions(introduced_user_id);
CREATE INDEX idx_introductions_introducer ON public.introductions(introducer_id);

CREATE POLICY "Users can see introductions involving them" ON public.introductions
  FOR SELECT TO authenticated
  USING (auth.uid() = introducer_id OR auth.uid() = introduced_user_id OR auth.uid() = target_user_id);

CREATE POLICY "Authenticated users can create introductions" ON public.introductions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = introducer_id);

CREATE POLICY "Target can update introduction status" ON public.introductions
  FOR UPDATE TO authenticated
  USING (auth.uid() = target_user_id);

-- 3. Affinity scores cache table
CREATE TABLE public.affinity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_id UUID NOT NULL,
  target_id UUID NOT NULL,
  affinity_score NUMERIC(5,4) NOT NULL DEFAULT 0,
  circle_tier SMALLINT NOT NULL DEFAULT 3,
  role_weight NUMERIC(4,3) DEFAULT 0,
  intent_multiplier NUMERIC(4,3) DEFAULT 1,
  trust_proximity NUMERIC(4,3) DEFAULT 0,
  activity_resonance NUMERIC(4,3) DEFAULT 0,
  freshness_decay NUMERIC(4,3) DEFAULT 1,
  referral_boost NUMERIC(4,3) DEFAULT 0,
  referral_source TEXT,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(viewer_id, target_id)
);

ALTER TABLE public.affinity_scores ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_affinity_viewer ON public.affinity_scores(viewer_id, circle_tier, affinity_score DESC);
CREATE INDEX idx_affinity_computed ON public.affinity_scores(computed_at);

CREATE POLICY "Users can read own affinity scores" ON public.affinity_scores
  FOR SELECT TO authenticated
  USING (auth.uid() = viewer_id);

-- Service role manages inserts/updates via edge function
CREATE POLICY "Service can manage affinity scores" ON public.affinity_scores
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Core TrustCircle IQ scoring function
CREATE OR REPLACE FUNCTION public.compute_trustcircle_iq(p_viewer_id UUID, p_limit INT DEFAULT 60)
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
      -- Target roles
      (SELECT array_agg(ur2.role::TEXT) FROM public.user_roles ur2 WHERE ur2.user_id = p.id) AS t_roles,
      -- Connection degree
      CASE
        WHEN p.id IN (SELECT user_id FROM first_degree) THEN 1.0
        WHEN p.id IN (SELECT user_id FROM second_degree) THEN 0.6
        ELSE 0.1
      END AS conn_degree,
      -- Mutual connections
      COALESCE(mc.mutual_count, 0) AS mutuals,
      -- Shared events
      (SELECT COUNT(*) FROM public.event_registrations er
       WHERE er.user_id = p.id AND er.event_id IN (SELECT event_id FROM viewer_events))::NUMERIC AS shared_events,
      -- Content engagement (has viewer interacted with target's posts?)
      (SELECT COUNT(*) FROM public.post_interactions pi
       JOIN public.posts po ON po.id = pi.post_id
       WHERE pi.user_id = p_viewer_id AND po.author_id = p.id)::NUMERIC AS engagement_count,
      -- Referral info
      rp.referrer_name AS ref_name,
      rp.ref_type,
      CASE
        WHEN rp.referrer_id IN (SELECT user_id FROM first_degree) THEN 1.0
        WHEN rp.referrer_id IN (SELECT user_id FROM second_degree) THEN 0.6
        ELSE 0.15
      END AS ref_circle_pos
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
      -- Role Weight
      (SELECT MAX(
        CASE
          -- Investor viewing
          WHEN vr = 'investor' AND tr = 'intermediary' THEN 0.9
          WHEN vr = 'investor' AND tr = 'issuer' THEN 0.7
          WHEN vr = 'investor' AND tr = 'investor' THEN 0.3
          -- Intermediary viewing
          WHEN vr = 'intermediary' AND tr = 'investor' THEN 0.85
          WHEN vr = 'intermediary' AND tr = 'issuer' THEN 0.75
          WHEN vr = 'intermediary' AND tr = 'intermediary' THEN 0.5
          -- Issuer viewing
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
        ELSE 1.0
      END
      *
      -- Trust Proximity (conn_degree×0.35 + verification×0.25 + regulatory×0.20 + mutuals×0.20)
      (
        c.conn_degree * 0.35
        + CASE
            WHEN c.verification_status = 'verified' THEN 0.25
            ELSE 0.075
          END
        + CASE
            WHEN v_viewer_location IS NOT NULL AND c.t_location = v_viewer_location THEN 0.15
            ELSE 0.04
          END
        + LEAST(c.mutuals / 10.0, 1.0) * 0.20
      )
      *
      -- Activity Resonance
      (0.4 + 
        LEAST(c.shared_events / 3.0, 1.0) * 0.30
        + LEAST(c.engagement_count / 5.0, 1.0) * 0.25
        + CASE WHEN c.t_specs IS NOT NULL AND v_viewer_specs IS NOT NULL 
               AND c.t_specs && v_viewer_specs THEN 0.15 ELSE 0.0 END
      )
      *
      -- Freshness Decay: e^(-0.05 * days)
      EXP(-0.05 * GREATEST(EXTRACT(EPOCH FROM (now() - c.last_active::timestamptz)) / 86400.0, 0))
    )
    -- Referral Boost (additive)
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

    -- Circle tier
    CASE
      WHEN (SELECT MAX(
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
      ) FROM unnest(v_roles) vr, unnest(COALESCE(c.t_roles, ARRAY['investor'])) tr) > 0.7
        AND c.conn_degree >= 0.6 THEN 1::SMALLINT
      WHEN c.conn_degree >= 0.6 OR c.mutuals > 2 THEN 2::SMALLINT
      ELSE 3::SMALLINT
    END AS circle_tier,

    -- Component scores for transparency
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
      ELSE NULL
    END AS referral_source

  FROM candidates c
  ORDER BY 
    CASE
      WHEN c.conn_degree >= 0.6 AND (SELECT MAX(
        CASE
          WHEN vr = 'investor' AND tr = 'intermediary' THEN 0.9
          WHEN vr = 'intermediary' AND tr = 'investor' THEN 0.85
          WHEN vr = 'issuer' AND tr = 'intermediary' THEN 0.9
          ELSE 0.3
        END
      ) FROM unnest(v_roles) vr, unnest(COALESCE(c.t_roles, ARRAY['investor'])) tr) > 0.7 THEN 1
      WHEN c.conn_degree >= 0.6 OR c.mutuals > 2 THEN 2
      ELSE 3
    END,
    2 DESC -- affinity_score
  LIMIT p_limit;
END;
$$;
