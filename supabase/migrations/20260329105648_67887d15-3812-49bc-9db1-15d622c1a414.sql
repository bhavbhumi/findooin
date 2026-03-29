-- Tighten messages policies from {public} to {authenticated}
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can read own messages" ON public.messages;
DROP POLICY IF EXISTS "Receiver can update messages (mark read)" ON public.messages;

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can read own messages"
  ON public.messages FOR SELECT TO authenticated
  USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));

CREATE POLICY "Receiver can update messages (mark read)"
  ON public.messages FOR UPDATE TO authenticated
  USING (auth.uid() = receiver_id);

-- Tighten verification_requests policies from {public} to {authenticated}
DROP POLICY IF EXISTS "Users can submit verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Users can view own verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can view all verification requests" ON public.verification_requests;
DROP POLICY IF EXISTS "Admins can update verification requests" ON public.verification_requests;

CREATE POLICY "Users can submit verification requests"
  ON public.verification_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own verification requests"
  ON public.verification_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests"
  ON public.verification_requests FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update verification requests"
  ON public.verification_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));