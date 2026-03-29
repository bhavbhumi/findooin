
-- ============================================================
-- FEEDBACK ENGINE — Sprint 1: Full Schema
-- ============================================================

-- 1. Enums
CREATE TYPE public.feature_status AS ENUM (
  'under_review', 'planned', 'in_progress', 'beta', 'released', 'rejected'
);

CREATE TYPE public.feature_category AS ENUM (
  'ui_ux', 'investment', 'insurance', 'compliance', 'community', 'data', 'jobs'
);

-- 2. Feature Requests
CREATE TABLE public.feature_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  workaround TEXT NOT NULL DEFAULT '',
  impact_tags TEXT[] NOT NULL DEFAULT '{}',
  is_regulatory BOOLEAN NOT NULL DEFAULT false,
  beneficiary_roles TEXT[] NOT NULL DEFAULT '{}',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status public.feature_status NOT NULL DEFAULT 'under_review',
  category public.feature_category NOT NULL DEFAULT 'ui_ux',
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Denormalized vote counts per role for fast priority score
  inv_votes INTEGER NOT NULL DEFAULT 0,
  int_votes INTEGER NOT NULL DEFAULT 0,
  iss_votes INTEGER NOT NULL DEFAULT 0,
  enb_votes INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  priority_score NUMERIC(10,2) GENERATED ALWAYS AS (
    (inv_votes * 1.0) + (int_votes * 2.0) + (iss_votes * 3.0) + (enb_votes * 2.5)
  ) STORED,
  -- Roadmap fields
  expected_quarter TEXT,
  roadmap_rationale TEXT,
  -- Admin fields
  pinned BOOLEAN NOT NULL DEFAULT false,
  pin_label TEXT,
  rejection_reason TEXT,
  merged_into_id UUID REFERENCES public.feature_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Feature Votes (one per user per feature)
CREATE TABLE public.feature_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_at_vote TEXT NOT NULL DEFAULT 'investor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (feature_id, user_id)
);

-- 4. Feature Comments (one level threading)
CREATE TABLE public.feature_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  parent_id UUID REFERENCES public.feature_comments(id) ON DELETE CASCADE,
  upvote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Comment Upvotes
CREATE TABLE public.comment_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES public.feature_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

-- 6. Feature Status History (audit trail)
CREATE TABLE public.feature_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id UUID NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  old_status public.feature_status,
  new_status public.feature_status NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Changelog Entries (admin-authored)
CREATE TABLE public.changelog_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  release_date DATE NOT NULL DEFAULT CURRENT_DATE,
  features_added JSONB NOT NULL DEFAULT '[]',
  improvements JSONB NOT NULL DEFAULT '[]',
  bug_fixes JSONB NOT NULL DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Changelog Reactions
CREATE TABLE public.changelog_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changelog_id UUID NOT NULL REFERENCES public.changelog_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'clap',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (changelog_id, user_id, reaction_type)
);

-- 9. Feature Merge Log
CREATE TABLE public.feature_merge_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_feature_id UUID NOT NULL,
  target_feature_id UUID NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  merged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_votes_transferred INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_feature_requests_status ON public.feature_requests(status);
CREATE INDEX idx_feature_requests_category ON public.feature_requests(category);
CREATE INDEX idx_feature_requests_priority ON public.feature_requests(priority_score DESC);
CREATE INDEX idx_feature_requests_author ON public.feature_requests(author_id);
CREATE INDEX idx_feature_requests_merged ON public.feature_requests(merged_into_id) WHERE merged_into_id IS NOT NULL;
CREATE INDEX idx_feature_votes_feature ON public.feature_votes(feature_id);
CREATE INDEX idx_feature_votes_user ON public.feature_votes(user_id);
CREATE INDEX idx_feature_comments_feature ON public.feature_comments(feature_id);
CREATE INDEX idx_feature_comments_parent ON public.feature_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comment_upvotes_comment ON public.comment_upvotes(comment_id);
CREATE INDEX idx_feature_status_history_feature ON public.feature_status_history(feature_id);
CREATE INDEX idx_changelog_entries_date ON public.changelog_entries(release_date DESC);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
CREATE TRIGGER set_feature_requests_updated_at
  BEFORE UPDATE ON public.feature_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_changelog_entries_updated_at
  BEFORE UPDATE ON public.changelog_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- TRIGGER: Sync vote counts on feature_votes insert/delete
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_feature_vote_counts()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_feature_id UUID;
  v_role TEXT;
  v_delta INTEGER;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_feature_id := NEW.feature_id;
    v_role := NEW.role_at_vote;
    v_delta := 1;
  ELSIF TG_OP = 'DELETE' THEN
    v_feature_id := OLD.feature_id;
    v_role := OLD.role_at_vote;
    v_delta := -1;
  ELSE
    RETURN NULL;
  END IF;

  UPDATE public.feature_requests SET
    inv_votes = inv_votes + CASE WHEN v_role = 'investor' THEN v_delta ELSE 0 END,
    int_votes = int_votes + CASE WHEN v_role = 'intermediary' THEN v_delta ELSE 0 END,
    iss_votes = iss_votes + CASE WHEN v_role = 'issuer' THEN v_delta ELSE 0 END,
    enb_votes = enb_votes + CASE WHEN v_role = 'enabler' THEN v_delta ELSE 0 END
  WHERE id = v_feature_id;

  IF TG_OP = 'INSERT' THEN RETURN NEW; ELSE RETURN OLD; END IF;
END;
$$;

CREATE TRIGGER on_feature_vote_change
  AFTER INSERT OR DELETE ON public.feature_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_feature_vote_counts();

-- ============================================================
-- TRIGGER: Sync comment count
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_feature_comment_count()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feature_requests SET comment_count = comment_count + 1 WHERE id = NEW.feature_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feature_requests SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = OLD.feature_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_feature_comment_change
  AFTER INSERT OR DELETE ON public.feature_comments
  FOR EACH ROW EXECUTE FUNCTION public.sync_feature_comment_count();

-- ============================================================
-- TRIGGER: Sync comment upvote count
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_comment_upvote_count()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feature_comments SET upvote_count = upvote_count + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feature_comments SET upvote_count = GREATEST(upvote_count - 1, 0) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_comment_upvote_change
  AFTER INSERT OR DELETE ON public.comment_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_upvote_count();

-- ============================================================
-- TRIGGER: Log status changes + notify author
-- ============================================================
CREATE OR REPLACE FUNCTION public.on_feature_status_change()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.feature_status_history (feature_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, COALESCE(auth.uid(), NEW.author_id));

    -- Notify feature author
    PERFORM public.create_notification(
      NEW.author_id,
      COALESCE(auth.uid(), NEW.author_id),
      'feature_status_changed',
      NEW.id::TEXT,
      'feature_request',
      'Your feature request "' || LEFT(NEW.title, 50) || '" is now ' || REPLACE(NEW.status::TEXT, '_', ' ')
    );

    -- Also notify all voters
    INSERT INTO public.notifications (user_id, actor_id, type, reference_id, reference_type, message)
    SELECT
      fv.user_id,
      COALESCE(auth.uid(), NEW.author_id),
      'feature_status_changed',
      NEW.id::TEXT,
      'feature_request',
      'A feature you voted on "' || LEFT(NEW.title, 50) || '" is now ' || REPLACE(NEW.status::TEXT, '_', ' ')
    FROM public.feature_votes fv
    WHERE fv.feature_id = NEW.id
      AND fv.user_id != NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_feature_request_status_change
  AFTER UPDATE ON public.feature_requests
  FOR EACH ROW EXECUTE FUNCTION public.on_feature_status_change();

-- ============================================================
-- RLS POLICIES
-- ============================================================
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changelog_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_merge_log ENABLE ROW LEVEL SECURITY;

-- feature_requests: all authenticated can read; authors can insert; admins can update
CREATE POLICY "Authenticated users can read features"
  ON public.feature_requests FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create features"
  ON public.feature_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Admins can update features"
  ON public.feature_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- feature_votes: all authenticated can read; users can insert/delete own
CREATE POLICY "Authenticated users can read votes"
  ON public.feature_votes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own votes"
  ON public.feature_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes"
  ON public.feature_votes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- feature_comments: all authenticated can read; users can insert own
CREATE POLICY "Authenticated users can read comments"
  ON public.feature_comments FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON public.feature_comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.feature_comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- comment_upvotes: all authenticated can read; users can insert/delete own
CREATE POLICY "Authenticated users can read upvotes"
  ON public.comment_upvotes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own upvotes"
  ON public.comment_upvotes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own upvotes"
  ON public.comment_upvotes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- feature_status_history: all authenticated can read
CREATE POLICY "Authenticated users can read status history"
  ON public.feature_status_history FOR SELECT TO authenticated
  USING (true);

-- changelog_entries: all authenticated can read; admins can insert/update
CREATE POLICY "Authenticated users can read changelog"
  ON public.changelog_entries FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can manage changelog"
  ON public.changelog_entries FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update changelog"
  ON public.changelog_entries FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- changelog_reactions: all authenticated can read; users can insert/delete own
CREATE POLICY "Authenticated users can read reactions"
  ON public.changelog_reactions FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can insert own reactions"
  ON public.changelog_reactions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON public.changelog_reactions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- feature_merge_log: all authenticated can read; admins can insert
CREATE POLICY "Authenticated users can read merge log"
  ON public.feature_merge_log FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can create merge log"
  ON public.feature_merge_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
