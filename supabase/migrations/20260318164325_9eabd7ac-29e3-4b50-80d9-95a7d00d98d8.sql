
-- ============================================================
-- Gamification: XP triggers for Opinions participation
-- ============================================================

-- 1. Trigger: Award XP when a user casts a vote on an opinion
CREATE OR REPLACE FUNCTION public.on_opinion_vote_created()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  -- Voting is a professional action: 8 XP for the voter
  PERFORM public.award_xp(NEW.user_id, 8, 'opinion_voted', 'opinion', NEW.opinion_id::text);
  PERFORM public.track_challenge_progress(NEW.user_id, 'opinion_voted');
  
  -- Increment participation_count on the opinion
  UPDATE public.opinions
  SET participation_count = participation_count + 1,
      updated_at = now()
  WHERE id = NEW.opinion_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_opinion_vote_xp ON public.opinion_votes;
CREATE TRIGGER trg_opinion_vote_xp
  AFTER INSERT ON public.opinion_votes
  FOR EACH ROW EXECUTE FUNCTION public.on_opinion_vote_created();

-- 2. Trigger: Award XP when a user comments on an opinion
CREATE OR REPLACE FUNCTION public.on_opinion_comment_created()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  -- Comment on opinion: 5 XP
  PERFORM public.award_xp(NEW.author_id, 5, 'opinion_commented', 'opinion_comment', NEW.id::text);
  PERFORM public.track_challenge_progress(NEW.author_id, 'comment_created');
  
  -- Increment comment_count on the opinion
  UPDATE public.opinions
  SET comment_count = comment_count + 1,
      updated_at = now()
  WHERE id = NEW.opinion_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_opinion_comment_xp ON public.opinion_comments;
CREATE TRIGGER trg_opinion_comment_xp
  AFTER INSERT ON public.opinion_comments
  FOR EACH ROW EXECUTE FUNCTION public.on_opinion_comment_created();

-- 3. Trigger: Award XP for opinion interactions (like/share)
CREATE OR REPLACE FUNCTION public.on_opinion_interaction_created()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.interaction_type = 'like' THEN
    -- Like an opinion: 1 XP to the liker
    PERFORM public.award_xp(NEW.user_id, 1, 'opinion_liked', 'opinion', NEW.opinion_id::text);
    
    -- Update like_count on the opinion
    UPDATE public.opinions
    SET like_count = like_count + 1,
        updated_at = now()
    WHERE id = NEW.opinion_id;
    
  ELSIF NEW.interaction_type = 'share' THEN
    -- Share an opinion: 3 XP to the sharer
    PERFORM public.award_xp(NEW.user_id, 3, 'opinion_shared', 'opinion', NEW.opinion_id::text);
    
    -- Update share_count on the opinion
    UPDATE public.opinions
    SET share_count = share_count + 1,
        updated_at = now()
    WHERE id = NEW.opinion_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_opinion_interaction_xp ON public.opinion_interactions;
CREATE TRIGGER trg_opinion_interaction_xp
  AFTER INSERT ON public.opinion_interactions
  FOR EACH ROW EXECUTE FUNCTION public.on_opinion_interaction_created();

-- 4. Insert badge definitions for Opinions participation
INSERT INTO public.badge_definitions (slug, name, description, icon_name, category, tier, criteria_type, criteria_field, criteria_value, xp_reward, sort_order)
VALUES
  ('first-vote', 'First Voice', 'Cast your first professional opinion vote', 'Vote', 'opinions', 'bronze', 'threshold', 'opinion_voted', 1, 10, 60),
  ('opinion-regular', 'Sentiment Regular', 'Vote on 10 professional opinions', 'BarChart3', 'opinions', 'silver', 'threshold', 'opinion_voted', 10, 30, 61),
  ('opinion-analyst', 'Sentiment Analyst', 'Vote on 25 professional opinions', 'TrendingUp', 'opinions', 'gold', 'threshold', 'opinion_voted', 25, 75, 62),
  ('opinion-oracle', 'Market Oracle', 'Vote on 50 professional opinions', 'Brain', 'opinions', 'platinum', 'threshold', 'opinion_voted', 50, 150, 63),
  ('opinion-commentator', 'Opinion Commentator', 'Leave 10 comments on opinion discussions', 'MessageSquare', 'opinions', 'silver', 'threshold', 'opinion_commented', 10, 30, 64)
ON CONFLICT (slug) DO NOTHING;
