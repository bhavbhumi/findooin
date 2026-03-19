-- Allow users to self-manage only non-privileged roles via a controlled RPC
CREATE OR REPLACE FUNCTION public.manage_own_role(_action text, _role public.app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_non_admin_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _role NOT IN ('issuer', 'intermediary', 'investor') THEN
    RAISE EXCEPTION 'Only issuer, intermediary, and investor roles can be self-managed';
  END IF;

  IF _action = 'add' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (auth.uid(), _role)
    ON CONFLICT (user_id, role) DO NOTHING;
    RETURN true;
  ELSIF _action = 'remove' THEN
    SELECT COUNT(*) INTO v_non_admin_count
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('issuer', 'intermediary', 'investor');

    IF v_non_admin_count <= 1 THEN
      RAISE EXCEPTION 'At least one primary role must remain on your account';
    END IF;

    DELETE FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = _role;

    RETURN FOUND;
  ELSE
    RAISE EXCEPTION 'Invalid action. Use add or remove';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.manage_own_role(text, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.manage_own_role(text, public.app_role) TO authenticated;

-- Tighten notification inserts: only allow users to create notifications addressed to themselves
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);