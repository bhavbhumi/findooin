
-- ============================================================
-- GAMIFICATION AUDIT FIX: XP rebalancing + missing triggers
-- ============================================================

-- 1. FIX: Event registration was 20 XP (too generous for clicking Register)
-- Reduce to 10 XP — still meaningful but not inflated
CREATE OR REPLACE FUNCTION public.gamify_on_event_registration()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.award_xp(NEW.user_id, 10, 'event_registered', 'event', NEW.event_id::text);
  PERFORM public.track_challenge_progress(NEW.user_id, 'event_registered');
  RETURN NEW;
END;
$$;

-- 2. ADD: Listing creation trigger (badge existed but no XP trigger!)
CREATE OR REPLACE FUNCTION public.gamify_on_listing()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  -- Creating a listing is high-effort professional content: 15 XP
  PERFORM public.award_xp(NEW.user_id, 15, 'listing_created', 'listing', NEW.id::text);
  PERFORM public.track_challenge_progress(NEW.user_id, 'listing_created');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gamify_listing ON public.listings;
CREATE TRIGGER trg_gamify_listing
  AFTER INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_listing();

-- 3. ADD: Job posted trigger
CREATE OR REPLACE FUNCTION public.gamify_on_job_posted()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  -- Posting a job is a significant professional contribution: 12 XP
  PERFORM public.award_xp(NEW.poster_id, 12, 'job_posted', 'job', NEW.id::text);
  PERFORM public.track_challenge_progress(NEW.poster_id, 'job_posted');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gamify_job_posted ON public.jobs;
CREATE TRIGGER trg_gamify_job_posted
  AFTER INSERT ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_job_posted();

-- 4. ADD: Job application trigger
CREATE OR REPLACE FUNCTION public.gamify_on_job_applied()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  -- Applying takes effort (resume, cover note): 5 XP
  PERFORM public.award_xp(NEW.applicant_id, 5, 'job_applied', 'job_application', NEW.id::text);
  PERFORM public.track_challenge_progress(NEW.applicant_id, 'job_applied');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gamify_job_applied ON public.job_applications;
CREATE TRIGGER trg_gamify_job_applied
  AFTER INSERT ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_job_applied();

-- 5. ADD: Recommendation written trigger
CREATE OR REPLACE FUNCTION public.gamify_on_recommendation()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  -- Writing a recommendation is high-effort and valuable: 10 XP for author
  PERFORM public.award_xp(NEW.author_id, 10, 'recommendation_written', 'recommendation', NEW.id::text);
  -- Receiving a recommendation is social proof: 5 XP for recipient  
  PERFORM public.award_xp(NEW.recipient_id, 5, 'recommendation_received', 'recommendation', NEW.id::text);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gamify_recommendation ON public.recommendations;
CREATE TRIGGER trg_gamify_recommendation
  AFTER INSERT ON public.recommendations
  FOR EACH ROW EXECUTE FUNCTION public.gamify_on_recommendation();

-- 6. FIX: "Fully Engaged" badge has misleading description
-- Change description and criteria to something achievable and honest
UPDATE public.badge_definitions 
SET description = 'Cast your professional vote on 5 different opinions',
    name = 'Opinion Regular'
WHERE slug = 'opinion-engaged';

-- 7. ADD: Missing badge progressions

-- First Comment badge (gap: nothing before 50)
INSERT INTO public.badge_definitions (slug, name, description, icon_name, category, tier, criteria_type, criteria_field, criteria_value, xp_reward, sort_order)
VALUES
  ('first-comment', 'Conversation Starter', 'Posted your first comment', 'MessageCircle', 'engagement', 'bronze', 'threshold', 'comments', 1, 10, 8),
  ('comments_10', 'Active Discussant', 'Posted 10 comments across discussions', 'MessageSquare', 'engagement', 'bronze', 'threshold', 'comments', 10, 15, 9)
ON CONFLICT (slug) DO NOTHING;

-- 14-day streak (gap between 7 and 30)
INSERT INTO public.badge_definitions (slug, name, description, icon_name, category, tier, criteria_type, criteria_field, criteria_value, xp_reward, sort_order)
VALUES
  ('streak_14', 'Fortnight Force', 'Maintained a 14-day login streak', 'Flame', 'streak', 'silver', 'threshold', 'streak', 14, 40, 12)
ON CONFLICT (slug) DO NOTHING;

-- Job badges
INSERT INTO public.badge_definitions (slug, name, description, icon_name, category, tier, criteria_type, criteria_field, criteria_value, xp_reward, sort_order)
VALUES
  ('first-job-posted', 'Talent Seeker', 'Posted your first job opportunity', 'Briefcase', 'content', 'bronze', 'threshold', 'job_posted', 1, 12, 19),
  ('jobs-posted-5', 'Hiring Champion', 'Posted 5 job opportunities on the platform', 'Users', 'content', 'silver', 'threshold', 'job_posted', 5, 30, 20),
  ('first-application', 'Opportunity Seeker', 'Applied to your first job on FindOO', 'Send', 'engagement', 'bronze', 'threshold', 'job_applied', 1, 10, 11),
  ('applications-5', 'Career Explorer', 'Applied to 5 jobs on FindOO', 'Target', 'engagement', 'silver', 'threshold', 'job_applied', 5, 25, 12)
ON CONFLICT (slug) DO NOTHING;

-- Listing progression (only had first_listing)
INSERT INTO public.badge_definitions (slug, name, description, icon_name, category, tier, criteria_type, criteria_field, criteria_value, xp_reward, sort_order)
VALUES
  ('listings-5', 'Showcase Pro', 'Created 5 listings on the marketplace', 'Store', 'content', 'silver', 'threshold', 'listing_created', 5, 30, 21),
  ('listings-10', 'Marketplace Authority', 'Created 10 listings — you are a go-to on FindOO', 'Crown', 'content', 'gold', 'threshold', 'listing_created', 10, 60, 22)
ON CONFLICT (slug) DO NOTHING;

-- Recommendation badges (completely missing)
INSERT INTO public.badge_definitions (slug, name, description, icon_name, category, tier, criteria_type, criteria_field, criteria_value, xp_reward, sort_order)
VALUES
  ('first-recommendation', 'Trust Builder', 'Wrote your first professional recommendation', 'PenLine', 'trust', 'bronze', 'threshold', 'recommendation_written', 1, 10, 19),
  ('recommendations-5', 'Reputation Maker', 'Wrote 5 professional recommendations for peers', 'Award', 'trust', 'silver', 'threshold', 'recommendation_written', 5, 30, 20),
  ('recommendations-received-5', 'Highly Recommended', 'Received 5 professional recommendations', 'Star', 'trust', 'gold', 'threshold', 'recommendation_received', 5, 50, 21)
ON CONFLICT (slug) DO NOTHING;

-- Endorsement progression (only had 10, add first and higher)
INSERT INTO public.badge_definitions (slug, name, description, icon_name, category, tier, criteria_type, criteria_field, criteria_value, xp_reward, sort_order)
VALUES
  ('first-endorsement', 'Skill Validated', 'Received your first skill endorsement', 'CheckCircle', 'trust', 'bronze', 'threshold', 'endorsements', 1, 10, 17),
  ('endorsements-25', 'Industry Authority', 'Received 25 skill endorsements from peers', 'Shield', 'trust', 'gold', 'threshold', 'endorsements', 25, 60, 22)
ON CONFLICT (slug) DO NOTHING;
