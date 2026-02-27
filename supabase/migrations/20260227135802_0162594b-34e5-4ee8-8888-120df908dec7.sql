
-- 1. Trigger: Notify user when verification request status changes (approved/rejected)
CREATE OR REPLACE FUNCTION public.notify_on_verification_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_admin_name TEXT;
  v_msg TEXT;
  v_type TEXT;
BEGIN
  -- Only fire when status actually changes
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Only notify on approved or rejected
  IF NEW.status NOT IN ('approved', 'rejected') THEN
    RETURN NEW;
  END IF;

  IF NEW.reviewed_by IS NOT NULL THEN
    SELECT COALESCE(display_name, full_name) INTO v_admin_name FROM public.profiles WHERE id = NEW.reviewed_by;
  END IF;

  IF NEW.status = 'approved' THEN
    v_type := 'verification_approved';
    v_msg := 'Your verification request has been approved! You now have a verified badge.';
  ELSE
    v_type := 'verification_rejected';
    v_msg := 'Your verification request was not approved.';
    IF NEW.admin_notes IS NOT NULL AND NEW.admin_notes != '' THEN
      v_msg := v_msg || ' Reason: ' || NEW.admin_notes;
    END IF;
  END IF;

  PERFORM public.create_notification(
    NEW.user_id,
    COALESCE(NEW.reviewed_by, NEW.user_id),
    v_type,
    NEW.id::TEXT,
    'verification',
    v_msg
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_verification_status
  AFTER UPDATE ON public.verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_verification_status_change();

-- 2. Trigger: Notify user when a new role is added
CREATE OR REPLACE FUNCTION public.notify_on_role_added()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role_label TEXT;
BEGIN
  v_role_label := INITCAP(REPLACE(NEW.role::TEXT, '_', ' '));
  
  IF NEW.sub_type IS NOT NULL THEN
    v_role_label := v_role_label || ' (' || INITCAP(REPLACE(NEW.sub_type, '_', ' ')) || ')';
  END IF;

  PERFORM public.create_notification(
    NEW.user_id,
    NEW.user_id,
    'role_added',
    NEW.id::TEXT,
    'role',
    'You now have the ' || v_role_label || ' role on FindOO.'
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_role_added
  AFTER INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_role_added();
