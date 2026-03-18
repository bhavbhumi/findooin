
-- Function to identify seed users by @findoo.test email domain
CREATE OR REPLACE FUNCTION public.get_seed_user_ids()
RETURNS uuid[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(array_agg(p.id), '{}'::uuid[])
  FROM public.profiles p
  INNER JOIN auth.users u ON u.id = p.id
  WHERE u.email LIKE '%@findoo.test';
$$;

-- Function to check if a specific user is a seed/test user
CREATE OR REPLACE FUNCTION public.is_seed_user(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = p_user_id AND email LIKE '%@findoo.test'
  );
$$;
