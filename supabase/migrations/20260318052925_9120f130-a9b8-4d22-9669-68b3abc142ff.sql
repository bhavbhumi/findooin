-- Admin can read all post interactions
CREATE POLICY "Admins can view all post interactions"
  ON public.post_interactions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));