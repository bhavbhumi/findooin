
-- Endorsements table: users can endorse other users' specializations
CREATE TABLE public.endorsements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endorser_id uuid NOT NULL,
  endorsed_user_id uuid NOT NULL,
  skill text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(endorser_id, endorsed_user_id, skill)
);

ALTER TABLE public.endorsements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view endorsements" ON public.endorsements
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can endorse" ON public.endorsements
  FOR INSERT WITH CHECK (auth.uid() = endorser_id AND endorser_id != endorsed_user_id);

CREATE POLICY "Users can remove own endorsements" ON public.endorsements
  FOR DELETE USING (auth.uid() = endorser_id);

-- Featured posts table: users can pin posts to their profile
CREATE TABLE public.featured_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.featured_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view featured posts" ON public.featured_posts
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own featured posts" ON public.featured_posts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
