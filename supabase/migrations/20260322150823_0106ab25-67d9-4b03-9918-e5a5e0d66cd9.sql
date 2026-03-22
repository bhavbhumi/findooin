-- Update manage_own_role to allow enabler
CREATE OR REPLACE FUNCTION public.manage_own_role(_action text, _role app_role)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_non_admin_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF _role NOT IN ('issuer', 'intermediary', 'investor', 'enabler') THEN
    RAISE EXCEPTION 'Only issuer, intermediary, investor, and enabler roles can be self-managed';
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
      AND role IN ('issuer', 'intermediary', 'investor', 'enabler');

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
$function$;
