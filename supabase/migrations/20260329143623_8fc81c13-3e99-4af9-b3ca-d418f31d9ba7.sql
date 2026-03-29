
-- Add is_seeded flag to feature_requests
ALTER TABLE public.feature_requests 
  ADD COLUMN IF NOT EXISTS is_seeded boolean NOT NULL DEFAULT false;

-- Satisfaction ratings table
CREATE TABLE public.feature_satisfaction_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id uuid REFERENCES public.feature_requests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'negative')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feature_id, user_id)
);

ALTER TABLE public.feature_satisfaction_ratings ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all ratings
CREATE POLICY "Anyone can view satisfaction ratings"
  ON public.feature_satisfaction_ratings FOR SELECT
  TO authenticated USING (true);

-- Users can insert their own rating
CREATE POLICY "Users can insert own rating"
  ON public.feature_satisfaction_ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own rating
CREATE POLICY "Users can update own rating"
  ON public.feature_satisfaction_ratings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own rating
CREATE POLICY "Users can delete own rating"
  ON public.feature_satisfaction_ratings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Add aggregation columns to feature_requests for fast reads
ALTER TABLE public.feature_requests
  ADD COLUMN IF NOT EXISTS avg_satisfaction numeric(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS satisfaction_count int NOT NULL DEFAULT 0;

-- Trigger to auto-update aggregation on feature_requests
CREATE OR REPLACE FUNCTION public.update_satisfaction_aggregates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.feature_requests
  SET avg_satisfaction = COALESCE((
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM public.feature_satisfaction_ratings
    WHERE feature_id = COALESCE(NEW.feature_id, OLD.feature_id)
  ), 0),
  satisfaction_count = COALESCE((
    SELECT COUNT(*)
    FROM public.feature_satisfaction_ratings
    WHERE feature_id = COALESCE(NEW.feature_id, OLD.feature_id)
  ), 0)
  WHERE id = COALESCE(NEW.feature_id, OLD.feature_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_satisfaction_aggregates
AFTER INSERT OR UPDATE OR DELETE ON public.feature_satisfaction_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_satisfaction_aggregates();
