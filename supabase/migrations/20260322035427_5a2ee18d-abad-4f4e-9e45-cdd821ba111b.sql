-- Mark stuck "running" sync logs as timed_out (older than 30 minutes with no completion)
UPDATE public.registry_sync_log
SET status = 'failed',
    error_message = 'Edge function timed out — auto-cleaned',
    completed_at = now()
WHERE status = 'running'
  AND started_at < now() - interval '30 minutes'
  AND completed_at IS NULL;