
-- Opinion format types
CREATE TYPE public.opinion_format AS ENUM ('binary', 'multiple_choice', 'scale', 'over_under');

-- Opinion status
CREATE TYPE public.opinion_status AS ENUM ('draft', 'active', 'closed', 'archived');

-- Opinion categories (BFSI India)
CREATE TYPE public.opinion_category AS ENUM (
  'rbi_monetary_policy',
  'markets_indices',
  'regulatory_sebi',
  'insurance_irdai',
  'mutual_funds_amfi',
  'banking_nbfc',
  'macro_india',
  'global_impact'
);

-- Main opinions table
CREATE TABLE public.opinions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category opinion_category NOT NULL DEFAULT 'markets_indices',
  format opinion_format NOT NULL DEFAULT 'binary',
  options JSONB NOT NULL DEFAULT '[{"label":"Yes","color":"#22c55e"},{"label":"No","color":"#ef4444"}]'::jsonb,
  status opinion_status NOT NULL DEFAULT 'draft',
  created_by UUID NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  disclaimer_text TEXT,
  participation_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Votes table
CREATE TABLE public.opinion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opinion_id UUID NOT NULL REFERENCES public.opinions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  selected_option TEXT NOT NULL,
  voter_role TEXT NOT NULL DEFAULT 'intermediary',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(opinion_id, user_id)
);

-- Opinion interactions (likes, shares, bookmarks)
CREATE TABLE public.opinion_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opinion_id UUID NOT NULL REFERENCES public.opinions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  interaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(opinion_id, user_id, interaction_type)
);

-- Opinion comments
CREATE TABLE public.opinion_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opinion_id UUID NOT NULL REFERENCES public.opinions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_opinions_status ON public.opinions(status);
CREATE INDEX idx_opinions_category ON public.opinions(category);
CREATE INDEX idx_opinions_ends_at ON public.opinions(ends_at);
CREATE INDEX idx_opinion_votes_opinion ON public.opinion_votes(opinion_id);
CREATE INDEX idx_opinion_votes_user ON public.opinion_votes(user_id);
CREATE INDEX idx_opinion_comments_opinion ON public.opinion_comments(opinion_id);
CREATE INDEX idx_opinion_interactions_opinion ON public.opinion_interactions(opinion_id);

-- Enable RLS
ALTER TABLE public.opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_comments ENABLE ROW LEVEL SECURITY;

-- Opinions: Anyone can read active/closed opinions (public page)
CREATE POLICY "Anyone can read published opinions"
  ON public.opinions FOR SELECT TO anon, authenticated
  USING (status IN ('active', 'closed'));

-- Opinions: Admins can read all (including drafts)
CREATE POLICY "Admins can manage all opinions"
  ON public.opinions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Opinions: Staff can create
CREATE POLICY "Staff can create opinions"
  ON public.opinions FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_staff = true)
    )
  );

-- Votes: Intermediaries and Issuers can vote
CREATE POLICY "Intermediaries and issuers can vote"
  ON public.opinion_votes FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND (
      has_role(auth.uid(), 'intermediary'::app_role)
      OR has_role(auth.uid(), 'issuer'::app_role)
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- Votes: Anyone authenticated can read votes (for results display)
CREATE POLICY "Anyone can read opinion votes"
  ON public.opinion_votes FOR SELECT TO anon, authenticated
  USING (true);

-- Votes: Users can delete own vote (change mind)
CREATE POLICY "Users can delete own votes"
  ON public.opinion_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Interactions: Any authenticated user can interact (like, share, bookmark)
CREATE POLICY "Authenticated users can interact"
  ON public.opinion_interactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can read interactions"
  ON public.opinion_interactions FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Users can remove own interactions"
  ON public.opinion_interactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Comments: Any authenticated user can comment
CREATE POLICY "Authenticated users can comment"
  ON public.opinion_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Anyone can read opinion comments"
  ON public.opinion_comments FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Users can delete own comments"
  ON public.opinion_comments FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

-- Trigger to update updated_at
CREATE TRIGGER update_opinions_updated_at
  BEFORE UPDATE ON public.opinions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Enable realtime for live vote updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.opinion_votes;
