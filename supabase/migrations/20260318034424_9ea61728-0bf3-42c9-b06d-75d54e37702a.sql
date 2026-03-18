
-- 1. Add is_staff flag to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_staff BOOLEAN NOT NULL DEFAULT false;

-- 2. Create staff_permissions table
CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, permission)
);

-- 3. Enable RLS
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;

-- 4. Security definer function to check permission (avoids RLS recursion)
-- Admins bypass all permission checks automatically
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Admins have all permissions implicitly
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
    OR
    -- Check explicit permission grant
    EXISTS (SELECT 1 FROM public.staff_permissions WHERE user_id = _user_id AND permission = _permission)
$$;

-- 5. Function to get all permissions for a user (returns array)
CREATE OR REPLACE FUNCTION public.get_staff_permissions(_user_id UUID)
RETURNS TEXT[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin')
    THEN ARRAY[
      'manage_users', 'manage_verification', 'manage_moderation', 'view_audit',
      'manage_invitations', 'manage_registry', 'manage_sales', 'manage_campaigns',
      'manage_blog', 'manage_support', 'manage_kb', 'view_monitoring',
      'view_scorecard', 'view_module_audit', 'view_seo', 'manage_email',
      'view_patent', 'view_cost_report', 'view_scaling_report',
      'manage_billing', 'manage_notifications', 'manage_features'
    ]
    ELSE COALESCE(
      (SELECT array_agg(permission) FROM public.staff_permissions WHERE user_id = _user_id),
      ARRAY[]::TEXT[]
    )
  END
$$;

-- 6. RLS policies for staff_permissions table
CREATE POLICY "Admins can manage staff permissions"
ON public.staff_permissions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can view own permissions"
ON public.staff_permissions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 7. Grant default moderator permissions via a helper function
CREATE OR REPLACE FUNCTION public.grant_moderator_defaults(_user_id UUID, _granted_by UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  perm TEXT;
  moderator_perms TEXT[] := ARRAY[
    'manage_verification', 'manage_moderation', 'manage_support', 'manage_kb', 'view_audit'
  ];
BEGIN
  FOREACH perm IN ARRAY moderator_perms LOOP
    INSERT INTO public.staff_permissions (user_id, permission, granted_by)
    VALUES (_user_id, perm, _granted_by)
    ON CONFLICT (user_id, permission) DO NOTHING;
  END LOOP;
END;
$$;

-- 8. Mark existing admin as staff
UPDATE public.profiles SET is_staff = true
WHERE id IN (SELECT user_id FROM public.user_roles WHERE role = 'admin');
