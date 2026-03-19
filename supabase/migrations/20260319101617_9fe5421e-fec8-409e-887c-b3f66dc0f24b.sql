-- RPC for live platform metrics used by dynamic Cost & Scaling report
CREATE OR REPLACE FUNCTION public.get_platform_metrics()
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN json_build_object(
    'total_users', (SELECT count(*) FROM profiles),
    'verified_users', (SELECT count(*) FROM profiles WHERE verification_status = 'verified'),
    'total_posts', (SELECT count(*) FROM posts),
    'total_messages', (SELECT count(*) FROM messages),
    'total_connections', (SELECT count(*) FROM connections WHERE status = 'accepted'),
    'total_events', (SELECT count(*) FROM events),
    'total_jobs', (SELECT count(*) FROM jobs),
    'total_listings', (SELECT count(*) FROM listings),
    'total_vault_files', (SELECT count(*) FROM file_uploads),
    'active_subscriptions', (SELECT count(*) FROM user_subscriptions WHERE status IN ('active', 'trialing')),
    'investors', (SELECT count(DISTINCT user_id) FROM user_roles WHERE role = 'investor'),
    'intermediaries', (SELECT count(DISTINCT user_id) FROM user_roles WHERE role = 'intermediary'),
    'issuers', (SELECT count(DISTINCT user_id) FROM user_roles WHERE role = 'issuer'),
    'users_last_7d', (SELECT count(*) FROM profiles WHERE created_at > now() - interval '7 days'),
    'users_last_30d', (SELECT count(*) FROM profiles WHERE created_at > now() - interval '30 days'),
    'storage_bytes', (SELECT COALESCE(sum(file_size), 0) FROM file_uploads),
    'avg_posts_per_user', ROUND((SELECT count(*)::numeric FROM posts) / GREATEST((SELECT count(*) FROM profiles), 1), 2),
    'avg_connections_per_user', ROUND((SELECT count(*)::numeric FROM connections WHERE status = 'accepted') / GREATEST((SELECT count(*) FROM profiles), 1), 2),
    'fetched_at', now()
  );
END;
$$;

-- Update subscription plan prices for moderate-aggressive adoption @ 25K target
-- Investor Pro: ₹499→₹399/mo
UPDATE public.subscription_plans SET price_amount = 39900, features = '["Unlimited connections", "TrustCircle IQ discovery", "Advanced directory filters", "Portfolio watchlists", "Vault (5 GB)", "Priority support"]'::jsonb, limits = '{"connections_per_month": -1, "trustcircle_iq": true, "vault_storage_mb": 5120}'::jsonb WHERE slug = 'investor-pro-monthly';

-- Investor Pro Annual: ₹399 × 10 = ₹3,990/yr
UPDATE public.subscription_plans SET price_amount = 399000, features = '["Unlimited connections", "TrustCircle IQ discovery", "Advanced directory filters", "Portfolio watchlists", "Vault (5 GB)", "Priority support"]'::jsonb, limits = '{"connections_per_month": -1, "trustcircle_iq": true, "vault_storage_mb": 5120}'::jsonb WHERE slug = 'investor-pro-annual';

-- Intermediary Pro: ₹699→₹799/mo (higher value: lead capture, analytics, premium features)
UPDATE public.subscription_plans SET price_amount = 79900, features = '["Unlimited connections", "Lead capture dashboard", "Content analytics", "Featured in directory", "10 service listings", "Vault (10 GB)", "Priority support"]'::jsonb, limits = '{"connections_per_month": -1, "lead_capture": true, "listings": 10, "vault_storage_mb": 10240, "content_analytics": true}'::jsonb WHERE slug = 'intermediary-pro-monthly';

-- Intermediary Pro Annual: ₹799 × 10 = ₹7,990/yr
UPDATE public.subscription_plans SET price_amount = 799000, features = '["Unlimited connections", "Lead capture dashboard", "Content analytics", "Featured in directory", "10 service listings", "Vault (10 GB)", "Priority support"]'::jsonb, limits = '{"connections_per_month": -1, "lead_capture": true, "listings": 10, "vault_storage_mb": 10240, "content_analytics": true}'::jsonb WHERE slug = 'intermediary-pro-annual';

-- Issuer Pro: ₹999→₹1,499/mo (events, jobs, IR portal, high B2B value)
UPDATE public.subscription_plans SET price_amount = 149900, features = '["Unlimited connections", "10 product listings", "Event creation & management", "5 job posts/month", "IR portal access", "Vault (20 GB)", "Priority support"]'::jsonb, limits = '{"connections_per_month": -1, "events": true, "jobs_per_month": 5, "listings": 10, "vault_storage_mb": 20480, "ir_portal": true}'::jsonb WHERE slug = 'issuer-pro-monthly';

-- Issuer Pro Annual: ₹1,499 × 10 = ₹14,990/yr
UPDATE public.subscription_plans SET price_amount = 1499000, features = '["Unlimited connections", "10 product listings", "Event creation & management", "5 job posts/month", "IR portal access", "Vault (20 GB)", "Priority support"]'::jsonb, limits = '{"connections_per_month": -1, "events": true, "jobs_per_month": 5, "listings": 10, "vault_storage_mb": 20480, "ir_portal": true}'::jsonb WHERE slug = 'issuer-pro-annual';

-- Enterprise: Investor ₹999/mo
UPDATE public.subscription_plans SET price_amount = 99900, features = '["Everything in Pro", "Portfolio watchlists & alerts", "Connection export (CSV/vCard)", "50 GB vault storage", "Dedicated relationship manager", "API access (coming soon)"]'::jsonb, limits = '{"connections_per_month": -1, "trustcircle_iq": true, "vault_storage_mb": 51200, "portfolio_watchlists": true, "connection_export": true}'::jsonb WHERE slug = 'investor-enterprise-monthly';

UPDATE public.subscription_plans SET price_amount = 999000 WHERE slug = 'investor-enterprise-annual';

-- Enterprise: Intermediary ₹1,999/mo
UPDATE public.subscription_plans SET price_amount = 199900, features = '["Everything in Pro", "Campaign manager", "Featured service listings", "Advanced analytics dashboard", "50 GB vault storage", "White-label digital card"]'::jsonb, limits = '{"connections_per_month": -1, "lead_capture": true, "listings": -1, "vault_storage_mb": 51200, "campaign_manager": true, "featured_listings": true}'::jsonb WHERE slug = 'intermediary-enterprise-monthly';

UPDATE public.subscription_plans SET price_amount = 1999000 WHERE slug = 'intermediary-enterprise-annual';

-- Enterprise: Issuer ₹4,999/mo
UPDATE public.subscription_plans SET price_amount = 499900, features = '["Everything in Pro", "Unlimited listings & jobs", "Investor targeting campaigns", "Analyst coverage aggregation", "Corporate event management", "100 GB vault storage", "Dedicated support"]'::jsonb, limits = '{"connections_per_month": -1, "events": true, "jobs_per_month": -1, "listings": -1, "vault_storage_mb": 102400, "investor_targeting": true, "analyst_coverage": true}'::jsonb WHERE slug = 'issuer-enterprise-monthly';

UPDATE public.subscription_plans SET price_amount = 4999000 WHERE slug = 'issuer-enterprise-annual';