
-- Cleanup function that purges stale data across the platform
-- Returns a summary of deleted row counts for audit logging
CREATE OR REPLACE FUNCTION public.cleanup_stale_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sessions_deleted integer := 0;
  v_notifications_deleted integer := 0;
  v_email_logs_deleted integer := 0;
  v_audit_logs_archived integer := 0;
  v_drafts_deleted integer := 0;
  v_signals_deleted integer := 0;
  v_orphaned_files_deleted integer := 0;
BEGIN
  -- 1. Delete expired sessions (last active > 7 days ago)
  WITH deleted AS (
    DELETE FROM public.active_sessions
    WHERE last_active_at < now() - interval '7 days'
    RETURNING id
  )
  SELECT count(*) INTO v_sessions_deleted FROM deleted;

  -- 2. Delete read notifications older than 30 days
  WITH deleted AS (
    DELETE FROM public.notifications
    WHERE read = true AND created_at < now() - interval '30 days'
    RETURNING id
  )
  SELECT count(*) INTO v_notifications_deleted FROM deleted;

  -- 3. Purge email send logs older than 90 days
  WITH deleted AS (
    DELETE FROM public.email_send_log
    WHERE created_at < now() - interval '90 days'
    RETURNING id
  )
  SELECT count(*) INTO v_email_logs_deleted FROM deleted;

  -- 4. Delete abandoned post drafts older than 60 days
  WITH deleted AS (
    DELETE FROM public.post_drafts
    WHERE updated_at < now() - interval '60 days'
    RETURNING id
  )
  SELECT count(*) INTO v_drafts_deleted FROM deleted;

  -- 5. Purge consumed intent signals older than 30 days
  WITH deleted AS (
    DELETE FROM public.intent_signals
    WHERE created_at < now() - interval '30 days'
    RETURNING id
  )
  SELECT count(*) INTO v_signals_deleted FROM deleted;

  -- 6. Delete audit logs older than 6 months
  WITH deleted AS (
    DELETE FROM public.audit_logs
    WHERE created_at < now() - interval '6 months'
    RETURNING id
  )
  SELECT count(*) INTO v_audit_logs_archived FROM deleted;

  -- Log the cleanup action itself
  INSERT INTO public.audit_logs (user_id, action, resource_type, metadata)
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    'system_cleanup',
    'platform',
    jsonb_build_object(
      'sessions_deleted', v_sessions_deleted,
      'notifications_deleted', v_notifications_deleted,
      'email_logs_deleted', v_email_logs_deleted,
      'audit_logs_deleted', v_audit_logs_archived,
      'drafts_deleted', v_drafts_deleted,
      'signals_deleted', v_signals_deleted,
      'ran_at', now()
    )
  );

  RETURN jsonb_build_object(
    'sessions_deleted', v_sessions_deleted,
    'notifications_deleted', v_notifications_deleted,
    'email_logs_deleted', v_email_logs_deleted,
    'audit_logs_deleted', v_audit_logs_archived,
    'drafts_deleted', v_drafts_deleted,
    'signals_deleted', v_signals_deleted,
    'total_deleted', v_sessions_deleted + v_notifications_deleted + v_email_logs_deleted + v_audit_logs_archived + v_drafts_deleted + v_signals_deleted
  );
END;
$$;
