
-- Platform reviews table
CREATE TABLE public.platform_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewer_name TEXT NOT NULL DEFAULT '',
  reviewer_role TEXT NOT NULL DEFAULT '',
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  CONSTRAINT one_review_per_user UNIQUE (user_id)
);

-- RLS
ALTER TABLE public.platform_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "Anyone can read approved reviews"
  ON public.platform_reviews FOR SELECT
  USING (status = 'approved');

-- Authenticated users can read their own review (any status)
CREATE POLICY "Users can read own review"
  ON public.platform_reviews FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Authenticated users can insert their own review
CREATE POLICY "Users can insert own review"
  ON public.platform_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Authenticated users can update their own pending review
CREATE POLICY "Users can update own pending review"
  ON public.platform_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

-- Admins can read all reviews
CREATE POLICY "Admins can read all reviews"
  ON public.platform_reviews FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update any review (for moderation)
CREATE POLICY "Admins can update any review"
  ON public.platform_reviews FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
