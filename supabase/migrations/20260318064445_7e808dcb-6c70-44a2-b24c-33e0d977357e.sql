
-- Consolidated admin stats RPC to reduce N+1 queries on dashboard
CREATE OR REPLACE FUNCTION get_admin_module_stats()
RETURNS json
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'posts_total', (SELECT count(*) FROM posts),
    'posts_reported', (SELECT count(DISTINCT post_id) FROM reports WHERE post_id IS NOT NULL AND status = 'pending'),
    'jobs_total', (SELECT count(*) FROM jobs),
    'jobs_active', (SELECT count(*) FROM jobs WHERE status = 'active'),
    'jobs_applications', (SELECT coalesce(sum(application_count), 0) FROM jobs),
    'events_total', (SELECT count(*) FROM events),
    'events_published', (SELECT count(*) FROM events WHERE status = 'published'),
    'events_registrations', (SELECT coalesce(sum(registration_count), 0) FROM events),
    'listings_total', (SELECT count(*) FROM listings),
    'listings_active', (SELECT count(*) FROM listings WHERE status = 'active'),
    'listings_enquiries', (SELECT coalesce(sum(enquiry_count), 0) FROM listings),
    'messages_total', (SELECT count(*) FROM messages),
    'reports_pending', (SELECT count(*) FROM reports WHERE status = 'pending'),
    'users_total', (SELECT count(*) FROM profiles),
    'users_verified', (SELECT count(*) FROM profiles WHERE verification_status = 'verified'),
    'connections_total', (SELECT count(*) FROM connections WHERE status = 'accepted')
  );
$$;
