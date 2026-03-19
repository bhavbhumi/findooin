-- Drop the old unique constraint that only allows one active subscription per user
DROP INDEX IF EXISTS idx_user_active_subscription;

-- Create a new unique constraint that allows one active subscription per user per target_role
-- We need a partial unique index that joins with subscription_plans, but since partial indexes
-- can't reference other tables, we'll add a target_role column to user_subscriptions instead.

-- Add target_role column to user_subscriptions
ALTER TABLE public.user_subscriptions ADD COLUMN IF NOT EXISTS target_role text;

-- Backfill existing rows
UPDATE public.user_subscriptions us
SET target_role = sp.target_role
FROM public.subscription_plans sp
WHERE us.plan_id = sp.id AND us.target_role IS NULL;

-- Create the new unique index: one active sub per user per role
CREATE UNIQUE INDEX idx_user_active_subscription
ON public.user_subscriptions (user_id, target_role)
WHERE status IN ('active', 'trialing', 'past_due', 'paused');

-- Now insert Bhavesh's intermediary enterprise subscription
INSERT INTO public.user_subscriptions (user_id, plan_id, status, billing_interval, current_period_start, current_period_end, target_role)
VALUES (
  'c2c780fe-0a51-4102-a757-3847f9c5ad26',
  '7182e93d-0fac-4fbd-9a98-3c8bd622ae0e',
  'active',
  'monthly',
  now(),
  now() + interval '1 year',
  'intermediary'
);

-- Also insert for admin@findoo.in (b7c85d...) - investor enterprise already exists, let's update target_role
UPDATE public.user_subscriptions SET target_role = 'investor' WHERE user_id = 'b7c85dbb-2045-4990-b444-7842e29e097e' AND target_role IS NULL;