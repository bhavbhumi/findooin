
-- Replace overly permissive INSERT policy with one that limits abuse
DROP POLICY "Anyone can log card exchange" ON public.card_exchanges;

-- Allow authenticated users to insert with their own viewer_id, or anon with null viewer_id
CREATE POLICY "Log card exchange with constraints"
  ON public.card_exchanges FOR INSERT
  WITH CHECK (
    (viewer_id IS NULL) OR (viewer_id = auth.uid())
  );
