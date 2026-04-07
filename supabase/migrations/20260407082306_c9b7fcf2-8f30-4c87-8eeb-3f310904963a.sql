INSERT INTO public.feature_flags (flag_key, label, description, is_enabled, rollout_percentage, target_segment, created_by)
VALUES
  ('jobs_board', 'Jobs Board', 'Job listings and applications module', true, 100, 'all', 'b7c85df6-1fdf-45b1-87bb-dc9c517f27cb'),
  ('events_module', 'Events Module', 'Events creation, registration, and management', true, 100, 'all', 'b7c85df6-1fdf-45b1-87bb-dc9c517f27cb'),
  ('directory_listings', 'Showcase / Directory Listings', 'Product and service marketplace listings', true, 100, 'all', 'b7c85df6-1fdf-45b1-87bb-dc9c517f27cb'),
  ('opinions_module', 'Opinions & Polls', 'Community opinion polls and voting', true, 100, 'all', 'b7c85df6-1fdf-45b1-87bb-dc9c517f27cb')
ON CONFLICT (flag_key) DO NOTHING;