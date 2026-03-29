-- Step 1: Drop old constraint and add enabler to target_role check
ALTER TABLE public.subscription_plans DROP CONSTRAINT subscription_plans_target_role_check;
ALTER TABLE public.subscription_plans ADD CONSTRAINT subscription_plans_target_role_check
  CHECK (target_role = ANY (ARRAY['investor'::text, 'intermediary'::text, 'issuer'::text, 'enabler'::text]));

-- Step 2: Insert Enabler subscription plans
INSERT INTO public.subscription_plans (name, slug, description, tier, target_role, billing_interval, price_amount, price_currency, trial_days, features, limits, sort_order, status)
VALUES
  ('Enabler Free', 'enabler-free', 'Get started as an Enabler on FindOO', 'free', 'enabler', 'monthly', 0, 'INR', 0,
   '["Browse directory", "5 connections/month", "Basic profile", "1 service listing"]'::jsonb,
   '{"connections_per_month": 5, "listings": 1, "vault_gb": 1}'::jsonb, 13, 'active'),

  ('Enabler Pro', 'enabler-pro-monthly', 'Full-stack access for FinTech, RegTech & WealthTech enablers', 'pro', 'enabler', 'monthly', 99900, 'INR', 14,
   '["Unlimited connections", "API access & integrations", "Lead capture dashboard", "Featured in directory", "Content analytics", "10 service listings", "Vault (10 GB)", "Priority support"]'::jsonb,
   '{"connections_per_month": -1, "listings": 10, "vault_gb": 10, "api_access": true, "lead_capture": true, "analytics": true}'::jsonb, 14, 'active'),

  ('Enabler Pro Annual', 'enabler-pro-annual', 'Full-stack access for FinTech, RegTech & WealthTech enablers', 'pro', 'enabler', 'annual', 999000, 'INR', 14,
   '["Unlimited connections", "API access & integrations", "Lead capture dashboard", "Featured in directory", "Content analytics", "10 service listings", "Vault (10 GB)", "Priority support"]'::jsonb,
   '{"connections_per_month": -1, "listings": 10, "vault_gb": 10, "api_access": true, "lead_capture": true, "analytics": true}'::jsonb, 15, 'active'),

  ('Enabler Enterprise', 'enabler-enterprise-monthly', 'Enterprise-grade access for platform enablers at scale', 'enterprise', 'enabler', 'monthly', 299900, 'INR', 14,
   '["Everything in Pro", "Unlimited listings", "Advanced API access & webhooks", "White-label integrations", "Advanced analytics dashboard", "Campaign manager", "50 GB vault storage", "Dedicated support"]'::jsonb,
   '{"connections_per_month": -1, "listings": -1, "vault_gb": 50, "api_access": true, "webhooks": true, "lead_capture": true, "analytics": true, "campaigns": true, "white_label": true}'::jsonb, 16, 'active'),

  ('Enabler Enterprise Annual', 'enabler-enterprise-annual', 'Enterprise-grade access for platform enablers at scale', 'enterprise', 'enabler', 'annual', 2999000, 'INR', 14,
   '["Everything in Pro", "Unlimited listings", "Advanced API access & webhooks", "White-label integrations", "Advanced analytics dashboard", "Campaign manager", "50 GB vault storage", "Dedicated support"]'::jsonb,
   '{"connections_per_month": -1, "listings": -1, "vault_gb": 50, "api_access": true, "webhooks": true, "lead_capture": true, "analytics": true, "campaigns": true, "white_label": true}'::jsonb, 17, 'active');
