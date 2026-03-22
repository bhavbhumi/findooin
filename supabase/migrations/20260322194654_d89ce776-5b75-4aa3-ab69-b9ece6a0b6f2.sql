-- =============================================
-- FIX 1: Remove dangerous user_xp UPDATE policy (privilege escalation)
-- =============================================
DROP POLICY IF EXISTS "Users can update own xp" ON public.user_xp;
DROP POLICY IF EXISTS "Users can insert own xp" ON public.user_xp;

-- Only the award_xp() security definer function should modify user_xp
-- Allow service role insert via security definer functions only
CREATE POLICY "Only system can insert xp"
ON public.user_xp FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Only system can update xp"
ON public.user_xp FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

-- =============================================
-- FIX 2: Restrict opinion_votes SELECT to public votes + own votes
-- =============================================
DROP POLICY IF EXISTS "Anyone can read opinion votes" ON public.opinion_votes;

CREATE POLICY "Users see public votes or own votes"
ON public.opinion_votes FOR SELECT
TO authenticated
USING (is_public = true OR auth.uid() = user_id);

-- =============================================
-- FIX 3: Restrict social_proof_events to authenticated only
-- =============================================
DROP POLICY IF EXISTS "Anyone can read social proof" ON public.social_proof_events;

CREATE POLICY "Authenticated users can read social proof"
ON public.social_proof_events FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- FIX 4: Restrict profile_tab_privacy to owner + authenticated viewers
-- =============================================
DROP POLICY IF EXISTS "Anyone can read tab privacy" ON public.profile_tab_privacy;

CREATE POLICY "Authenticated users can read tab privacy"
ON public.profile_tab_privacy FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- FIX 5: Restrict referral_links SELECT to authenticated only
-- =============================================
DROP POLICY IF EXISTS "Anyone can read referral links" ON public.referral_links;

CREATE POLICY "Authenticated users can read referral links"
ON public.referral_links FOR SELECT
TO authenticated
USING (true);

-- =============================================
-- FIX 6: Restrict user_xp SELECT to authenticated only (leaderboard etc)
-- =============================================
DROP POLICY IF EXISTS "Anyone can view user xp" ON public.user_xp;

CREATE POLICY "Authenticated users can view xp"
ON public.user_xp FOR SELECT
TO authenticated
USING (true);