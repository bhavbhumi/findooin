
-- ============================================
-- Gamification V2: Referrals, Flair, Social Proof
-- ============================================

-- 1. Referral XP Chain tracking
CREATE TABLE IF NOT EXISTS public.referral_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  click_count integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.referral_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  referral_link_id uuid REFERENCES public.referral_links(id) ON DELETE SET NULL,
  mentor_bonus_until timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  total_bonus_xp integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own referral links" ON public.referral_links
  FOR ALL TO authenticated USING (auth.uid() = referrer_id) WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Anyone can read referral links" ON public.referral_links
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can view own referrals" ON public.referral_conversions
  FOR SELECT TO authenticated USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "Service can insert referral conversions" ON public.referral_conversions
  FOR INSERT TO authenticated WITH CHECK (true);

-- 2. Profile flair unlocks
CREATE TABLE IF NOT EXISTS public.profile_flair (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  avatar_border text NOT NULL DEFAULT 'none',
  name_effect text NOT NULL DEFAULT 'none',
  profile_theme text NOT NULL DEFAULT 'default',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_flair ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view flair" ON public.profile_flair
  FOR SELECT TO public USING (true);

CREATE POLICY "Users can manage own flair" ON public.profile_flair
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Social proof activity feed (level-ups, badge earns, milestones)
CREATE TABLE IF NOT EXISTS public.social_proof_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL, -- 'level_up', 'badge_earned', 'streak_milestone', 'referral_milestone'
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_proof_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read social proof" ON public.social_proof_events
  FOR SELECT TO public USING (true);

CREATE POLICY "System can insert social proof" ON public.social_proof_events
  FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for social proof
ALTER PUBLICATION supabase_realtime ADD TABLE public.social_proof_events;

-- 4. Seed weekly challenges
INSERT INTO public.weekly_challenges (title, description, action_type, target_count, xp_reward, starts_at, ends_at, is_active) VALUES
  ('Network Builder', 'Connect with 5 new professionals this week', 'connection_made', 5, 100, date_trunc('week', now()), date_trunc('week', now()) + interval '7 days', true),
  ('Content Creator', 'Create 3 posts this week', 'post_created', 3, 75, date_trunc('week', now()), date_trunc('week', now()) + interval '7 days', true),
  ('Engaged Reader', 'Like 10 posts this week', 'liked_post', 10, 50, date_trunc('week', now()), date_trunc('week', now()) + interval '7 days', true),
  ('Community Voice', 'Leave 5 comments this week', 'comment_created', 5, 60, date_trunc('week', now()), date_trunc('week', now()) + interval '7 days', true);

-- 5. Update award_xp to emit social proof on level-ups and track mentor bonus
CREATE OR REPLACE FUNCTION public.award_xp(p_user_id uuid, p_xp_amount integer, p_action text, p_source_type text DEFAULT NULL, p_source_id text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_multiplier numeric(3,1);
  v_final_xp integer;
  v_new_total integer;
  v_new_level integer;
  v_old_level integer;
  v_mentor_xp integer;
BEGIN
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (p_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT streak_multiplier, level INTO v_multiplier, v_old_level FROM public.user_xp WHERE user_id = p_user_id;
  v_multiplier := COALESCE(v_multiplier, 1.0);
  v_old_level := COALESCE(v_old_level, 1);
  v_final_xp := FLOOR(p_xp_amount * v_multiplier);

  INSERT INTO public.xp_transactions (user_id, xp_amount, action, source_type, source_id, multiplier)
  VALUES (p_user_id, v_final_xp, p_action, p_source_type, p_source_id, v_multiplier);

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

  -- Emit social proof on level-up
  IF v_new_level > v_old_level THEN
    INSERT INTO public.social_proof_events (user_id, event_type, event_data)
    VALUES (p_user_id, 'level_up', jsonb_build_object('old_level', v_old_level, 'new_level', v_new_level));
    
    -- Auto-assign flair for level 3+ 
    INSERT INTO public.profile_flair (user_id, avatar_border, name_effect)
    VALUES (p_user_id,
      CASE WHEN v_new_level >= 5 THEN 'legendary' WHEN v_new_level >= 4 THEN 'diamond' WHEN v_new_level >= 3 THEN 'fire' ELSE 'none' END,
      CASE WHEN v_new_level >= 5 THEN 'golden_shimmer' WHEN v_new_level >= 4 THEN 'glow' ELSE 'none' END
    )
    ON CONFLICT (user_id) DO UPDATE SET
      avatar_border = EXCLUDED.avatar_border,
      name_effect = EXCLUDED.name_effect,
      updated_at = now();
  END IF;

  -- Mentor bonus: give 10% to referrer if within 30-day window
  v_mentor_xp := GREATEST(1, FLOOR(v_final_xp * 0.1));
  UPDATE public.referral_conversions rc
  SET total_bonus_xp = total_bonus_xp + v_mentor_xp
  WHERE rc.referred_user_id = p_user_id
    AND rc.mentor_bonus_until > now();
  
  -- Actually award the mentor their XP (avoid recursion by direct insert)
  INSERT INTO public.xp_transactions (user_id, xp_amount, action, source_type, source_id, multiplier)
  SELECT rc.referrer_id, v_mentor_xp, 'mentor_bonus', 'referral', p_user_id::text, 1.0
  FROM public.referral_conversions rc
  WHERE rc.referred_user_id = p_user_id AND rc.mentor_bonus_until > now();
  
  UPDATE public.user_xp ux
  SET total_xp = ux.total_xp + v_mentor_xp,
      level = CASE
        WHEN ux.total_xp + v_mentor_xp >= 5000 THEN 5
        WHEN ux.total_xp + v_mentor_xp >= 2000 THEN 4
        WHEN ux.total_xp + v_mentor_xp >= 800 THEN 3
        WHEN ux.total_xp + v_mentor_xp >= 200 THEN 2
        ELSE 1
      END,
      updated_at = now()
  FROM public.referral_conversions rc
  WHERE ux.user_id = rc.referrer_id
    AND rc.referred_user_id = p_user_id
    AND rc.mentor_bonus_until > now();

  RETURN v_final_xp;
END;
$$;

-- 6. Auto-assign flair for existing high-level users
INSERT INTO public.profile_flair (user_id, avatar_border, name_effect)
SELECT ux.user_id,
  CASE WHEN ux.level >= 5 THEN 'legendary' WHEN ux.level >= 4 THEN 'diamond' WHEN ux.level >= 3 THEN 'fire' ELSE 'none' END,
  CASE WHEN ux.level >= 5 THEN 'golden_shimmer' WHEN ux.level >= 4 THEN 'glow' ELSE 'none' END
FROM public.user_xp ux
WHERE ux.level >= 3
ON CONFLICT (user_id) DO UPDATE SET
  avatar_border = EXCLUDED.avatar_border,
  name_effect = EXCLUDED.name_effect,
  updated_at = now();

-- 7. Track challenge progress via updated gamify triggers
CREATE OR REPLACE FUNCTION public.track_challenge_progress(p_user_id uuid, p_action text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  -- Update progress for any active challenge matching this action
  INSERT INTO public.user_challenge_progress (user_id, challenge_id, current_count)
  SELECT p_user_id, wc.id, 1
  FROM public.weekly_challenges wc
  WHERE wc.is_active = true
    AND wc.action_type = p_action
    AND wc.starts_at <= now()
    AND wc.ends_at >= now()
  ON CONFLICT (user_id, challenge_id) DO UPDATE SET
    current_count = user_challenge_progress.current_count + 1,
    completed_at = CASE
      WHEN user_challenge_progress.current_count + 1 >= (SELECT target_count FROM weekly_challenges WHERE id = user_challenge_progress.challenge_id)
      THEN COALESCE(user_challenge_progress.completed_at, now())
      ELSE user_challenge_progress.completed_at
    END,
    updated_at = now();
END;
$$;

-- Wire challenge tracking into gamify triggers
CREATE OR REPLACE FUNCTION public.gamify_on_post()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_xp(NEW.author_id, 10, 'post_created', 'post', NEW.id::text);
  PERFORM public.track_challenge_progress(NEW.author_id, 'post_created');
  UPDATE public.user_xp
  SET post_streak = CASE
        WHEN last_post_date = CURRENT_DATE - 1 THEN post_streak + 1
        WHEN last_post_date = CURRENT_DATE THEN post_streak
        ELSE 1
      END,
      last_post_date = CURRENT_DATE, updated_at = now()
  WHERE user_id = NEW.author_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.gamify_on_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_xp(NEW.author_id, 5, 'comment_created', 'comment', NEW.id::text);
  PERFORM public.track_challenge_progress(NEW.author_id, 'comment_created');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.gamify_on_like()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_author_id uuid;
BEGIN
  IF NEW.interaction_type = 'like' THEN
    SELECT author_id INTO v_author_id FROM public.posts WHERE id = NEW.post_id;
    IF v_author_id IS NOT NULL AND v_author_id != NEW.user_id THEN
      PERFORM public.award_xp(v_author_id, 2, 'like_received', 'post', NEW.post_id::text);
    END IF;
    PERFORM public.award_xp(NEW.user_id, 1, 'liked_post', 'post', NEW.post_id::text);
    PERFORM public.track_challenge_progress(NEW.user_id, 'liked_post');
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.gamify_on_connection()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.connection_type = 'connect' AND NEW.status = 'accepted' AND (OLD IS NULL OR OLD.status != 'accepted') THEN
    PERFORM public.award_xp(NEW.from_user_id, 5, 'connection_made', 'connection', NEW.id::text);
    PERFORM public.award_xp(NEW.to_user_id, 5, 'connection_made', 'connection', NEW.id::text);
    PERFORM public.track_challenge_progress(NEW.from_user_id, 'connection_made');
    PERFORM public.track_challenge_progress(NEW.to_user_id, 'connection_made');
  ELSIF NEW.connection_type = 'follow' AND OLD IS NULL THEN
    PERFORM public.award_xp(NEW.from_user_id, 2, 'followed_user', 'connection', NEW.id::text);
  END IF;
  RETURN NEW;
END;
$$;

-- Add unique constraint for challenge progress
ALTER TABLE public.user_challenge_progress ADD CONSTRAINT uq_user_challenge UNIQUE (user_id, challenge_id);
