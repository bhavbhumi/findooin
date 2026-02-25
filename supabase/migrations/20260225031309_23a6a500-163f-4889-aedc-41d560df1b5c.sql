
-- The delete policy already exists, so the earlier statements in the batch may not have applied.
-- Use IF NOT EXISTS pattern via DO blocks:

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own connections' AND tablename = 'connections') THEN
    CREATE POLICY "Users can insert own connections" ON public.connections FOR INSERT TO authenticated WITH CHECK (auth.uid() = from_user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own connections' AND tablename = 'connections') THEN
    CREATE POLICY "Users can read own connections" ON public.connections FOR SELECT TO authenticated USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own interactions' AND tablename = 'post_interactions') THEN
    CREATE POLICY "Users can insert own interactions" ON public.post_interactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
