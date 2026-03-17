
-- ============================================================
-- GAMIFICATION SCHEMA
-- ============================================================

-- 1. Badge definitions (master catalog)
CREATE TABLE public.badge_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'Award',
  category text NOT NULL DEFAULT 'engagement',
  tier text NOT NULL DEFAULT 'bronze',
  xp_reward integer NOT NULL DEFAULT 0,
  criteria_type text NOT NULL DEFAULT 'threshold',
  criteria_field text,
  criteria_value integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. User XP & level tracking
CREATE TABLE public.user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  total_xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  post_streak integer NOT NULL DEFAULT 0,
  last_post_date date,
  streak_multiplier numeric(3,1) NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. XP transaction log
CREATE TABLE public.xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  xp_amount integer NOT NULL,
  action text NOT NULL,
  source_type text,
  source_id text,
  multiplier numeric(3,1) NOT NULL DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Earned badges
CREATE TABLE public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES public.badge_definitions(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  is_pinned boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- 5. Weekly challenges
CREATE TABLE public.weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  action_type text NOT NULL,
  target_count integer NOT NULL DEFAULT 1,
  xp_reward integer NOT NULL DEFAULT 50,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. User challenge progress
CREATE TABLE public.user_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_id uuid NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  current_count integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_user_xp_user_id ON public.user_xp(user_id);
CREATE INDEX idx_user_xp_total_xp ON public.user_xp(total_xp DESC);
CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON public.xp_transactions(created_at DESC);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_user_challenge_progress_user ON public.user_challenge_progress(user_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;

-- badge_definitions: anyone can read, admins can manage
CREATE POLICY "Anyone can read badge definitions" ON public.badge_definitions FOR SELECT USING (true);
CREATE POLICY "Admins can manage badge definitions" ON public.badge_definitions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_xp: public read, users manage own
CREATE POLICY "Anyone can view user xp" ON public.user_xp FOR SELECT USING (true);
CREATE POLICY "Users can insert own xp" ON public.user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own xp" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id);

-- xp_transactions: own read, own insert
CREATE POLICY "Users can view own xp transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own xp transactions" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- user_badges: public read, own insert
CREATE POLICY "Anyone can view user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own badges" ON public.user_badges FOR UPDATE USING (auth.uid() = user_id);

-- weekly_challenges: public read, admins manage
CREATE POLICY "Anyone can read challenges" ON public.weekly_challenges FOR SELECT USING (true);
CREATE POLICY "Admins can manage challenges" ON public.weekly_challenges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_challenge_progress: own
CREATE POLICY "Users can view own challenge progress" ON public.user_challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenge progress" ON public.user_challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenge progress" ON public.user_challenge_progress FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTION: Award XP with streak multiplier
-- ============================================================
CREATE OR REPLACE FUNCTION public.award_xp(
  p_user_id uuid,
  p_xp_amount integer,
  p_action text,
  p_source_type text DEFAULT NULL,
  p_source_id text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_multiplier numeric(3,1);
  v_final_xp integer;
  v_new_total integer;
  v_new_level integer;
BEGIN
  -- Get or create user_xp row
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- Get current multiplier
  SELECT streak_multiplier INTO v_multiplier FROM public.user_xp WHERE user_id = p_user_id;
  v_multiplier := COALESCE(v_multiplier, 1.0);
  
  v_final_xp := FLOOR(p_xp_amount * v_multiplier);

  -- Log transaction
  INSERT INTO public.xp_transactions (user_id, xp_amount, action, source_type, source_id, multiplier)
  VALUES (p_user_id, v_final_xp, p_action, p_source_type, p_source_id, v_multiplier);

  -- Update total XP and compute level
  UPDATE public.user_xp
  SET total_xp = total_xp + v_final_xp,
      level = CASE
        WHEN total_xp + v_final_xp >= 5000 THEN 5
        WHEN total_xp + v_final_xp >= 2000 THEN 4
        WHEN total_xp + v_final_xp >= 800 THEN 3
        WHEN total_xp + v_final_xp >= 200 THEN 2
        ELSE 1
      END,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING total_xp, level INTO v_new_total, v_new_level;

  RETURN v_final_xp;
END;
$$;

-- ============================================================
-- HELPER FUNCTION: Update login streak
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_login_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_last_date date;
  v_today date := CURRENT_DATE;
BEGIN
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT last_active_date INTO v_last_date FROM public.user_xp WHERE user_id = p_user_id;

  IF v_last_date IS NULL OR v_last_date < v_today - 1 THEN
    -- Streak broken or first login
    UPDATE public.user_xp
    SET current_streak = 1,
        last_active_date = v_today,
        streak_multiplier = 1.0,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSIF v_last_date = v_today - 1 THEN
    -- Consecutive day
    UPDATE public.user_xp
    SET current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_active_date = v_today,
        streak_multiplier = CASE
          WHEN current_streak + 1 >= 30 THEN 3.0
          WHEN current_streak + 1 >= 7 THEN 2.0
          ELSE 1.0
        END,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
  -- If same day, do nothing
END;
$$;

-- ============================================================
-- TRIGGERS: Auto-award XP on actions
-- ============================================================

-- Award XP on new post
CREATE OR REPLACE FUNCTION public.gamify_on_post()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_xp(NEW.author_id, 10, 'post_created', 'post', NEW.id::text);
  -- Update post streak
  UPDATE public.user_xp
  SET post_streak = CASE
        WHEN last_post_date = CURRENT_DATE - 1 THEN post_streak + 1
        WHEN last_post_date = CURRENT_DATE THEN post_streak
        ELSE 1
      END,
      last_post_date = CURRENT_DATE,
      updated_at = now()
  WHERE user_id = NEW.author_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gamify_post
  AFTER INSERT ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_post();

-- Award XP on comment
CREATE OR REPLACE FUNCTION public.gamify_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_xp(NEW.author_id, 5, 'comment_created', 'comment', NEW.id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gamify_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_comment();

-- Award XP on receiving a like
CREATE OR REPLACE FUNCTION public.gamify_on_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_author_id uuid;
BEGIN
  IF NEW.interaction_type = 'like' THEN
    SELECT author_id INTO v_author_id FROM public.posts WHERE id = NEW.post_id;
    IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
      PERFORM public.award_xp(v_author_id, 2, 'like_received', 'post', NEW.post_id::text);
    END IF;
    -- Liker also gets 1 XP
    PERFORM public.award_xp(NEW.user_id, 1, 'liked_post', 'post', NEW.post_id::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gamify_like
  AFTER INSERT ON public.post_interactions
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_like();

-- Award XP on connection accepted
CREATE OR REPLACE FUNCTION public.gamify_on_connection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.connection_type = 'connect' AND NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    PERFORM public.award_xp(NEW.from_user_id, 5, 'connection_made', 'connection', NEW.id::text);
    PERFORM public.award_xp(NEW.to_user_id, 5, 'connection_made', 'connection', NEW.id::text);
  ELSIF NEW.connection_type = 'follow' AND OLD IS NULL THEN
    PERFORM public.award_xp(NEW.from_user_id, 2, 'followed_user', 'connection', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gamify_connection_insert
  AFTER INSERT ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_connection();

CREATE TRIGGER trg_gamify_connection_update
  AFTER UPDATE ON public.connections
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_connection();

-- Award XP on event registration
CREATE OR REPLACE FUNCTION public.gamify_on_event_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_xp(NEW.user_id, 20, 'event_registered', 'event', NEW.event_id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gamify_event_registration
  AFTER INSERT ON public.event_registrations
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_event_registration();

-- Award XP on endorsement received
CREATE OR REPLACE FUNCTION public.gamify_on_endorsement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_xp(NEW.endorsed_user_id, 5, 'endorsement_received', 'endorsement', NEW.id::text);
  PERFORM public.award_xp(NEW.endorser_id, 3, 'endorsed_someone', 'endorsement', NEW.id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_gamify_endorsement
  AFTER INSERT ON public.endorsements
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_endorsement();

-- ============================================================
-- LEADERBOARD FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT json_agg(row_data)
    FROM (
      SELECT json_build_object(
        'user_id', ux.user_id,
        'total_xp', ux.total_xp,
        'level', ux.level,
        'current_streak', ux.current_streak,
        'profile', json_build_object(
          'full_name', COALESCE(p.full_name, 'Unknown'),
          'display_name', p.display_name,
          'avatar_url', p.avatar_url,
          'verification_status', p.verification_status
        )
      ) AS row_data
      FROM public.user_xp ux
      LEFT JOIN public.profiles p ON p.id = ux.user_id
      WHERE ux.total_xp > 0
      ORDER BY ux.total_xp DESC
      LIMIT p_limit OFFSET p_offset
    ) sub
  );
END;
$$;

-- ============================================================
-- SEED BADGE DEFINITIONS
-- ============================================================
INSERT INTO public.badge_definitions (slug, name, description, icon_name, category, tier, xp_reward, criteria_type, criteria_field, criteria_value, sort_order) VALUES
  ('first_post', 'First Post', 'Published your first post', 'Pencil', 'content', 'bronze', 10, 'threshold', 'posts', 1, 1),
  ('post_10', 'Prolific Writer', 'Published 10 posts', 'FileText', 'content', 'silver', 25, 'threshold', 'posts', 10, 2),
  ('post_50', 'Content Machine', 'Published 50 posts', 'Newspaper', 'content', 'gold', 50, 'threshold', 'posts', 50, 3),
  ('post_100', 'Thought Leader', 'Published 100 posts', 'Crown', 'content', 'platinum', 100, 'threshold', 'posts', 100, 4),
  ('first_connection', 'Networker', 'Made your first connection', 'UserPlus', 'network', 'bronze', 10, 'threshold', 'connections', 1, 5),
  ('connection_10', 'Social Butterfly', 'Made 10 connections', 'Users', 'network', 'silver', 25, 'threshold', 'connections', 10, 6),
  ('connection_50', 'Network Builder', 'Made 50 connections', 'Network', 'network', 'gold', 50, 'threshold', 'connections', 50, 7),
  ('connection_100', 'Super Connector', 'Made 100 connections', 'Globe', 'network', 'platinum', 100, 'threshold', 'connections', 100, 8),
  ('likes_100', 'Crowd Favorite', 'Received 100 likes', 'Heart', 'engagement', 'silver', 25, 'threshold', 'likes_received', 100, 9),
  ('comments_50', 'Commentator', 'Wrote 50 comments', 'MessageSquare', 'engagement', 'silver', 25, 'threshold', 'comments', 50, 10),
  ('streak_7', 'Week Warrior', 'Maintained a 7-day login streak', 'Flame', 'streak', 'bronze', 20, 'threshold', 'streak', 7, 11),
  ('streak_30', 'Monthly Champion', 'Maintained a 30-day login streak', 'Flame', 'streak', 'gold', 75, 'threshold', 'streak', 30, 12),
  ('verified', 'Verified Pro', 'Got your profile verified', 'ShieldCheck', 'trust', 'gold', 100, 'threshold', 'verified', 1, 13),
  ('endorsements_10', 'Well Endorsed', 'Received 10 endorsements', 'Award', 'trust', 'silver', 30, 'threshold', 'endorsements', 10, 14),
  ('event_attendee', 'Event Enthusiast', 'Attended 5 events', 'CalendarDays', 'events', 'bronze', 20, 'threshold', 'events_attended', 5, 15),
  ('event_host_5', 'Event Organizer', 'Hosted 5 events', 'Megaphone', 'events', 'gold', 75, 'threshold', 'events_hosted', 5, 16),
  ('profile_complete', 'Complete Profile', 'Achieved 100% profile completion', 'UserCheck', 'milestone', 'silver', 50, 'threshold', 'profile_complete', 1, 17),
  ('first_listing', 'Market Maker', 'Created your first listing', 'Store', 'content', 'bronze', 15, 'threshold', 'listings', 1, 18);

-- Enable realtime for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_xp;
