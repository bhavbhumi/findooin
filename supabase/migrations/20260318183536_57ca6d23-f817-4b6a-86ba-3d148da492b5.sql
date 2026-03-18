
-- ============================================
-- PHASE 1: Subscription & Monetization Schema
-- ============================================

-- 1. Subscription plan status enum
CREATE TYPE public.plan_status AS ENUM ('active', 'archived', 'draft');

-- 2. Subscription status enum
CREATE TYPE public.subscription_status AS ENUM (
  'trialing', 'active', 'past_due', 'cancelled', 'expired', 'paused'
);

-- 3. Billing interval enum
CREATE TYPE public.billing_interval AS ENUM ('monthly', 'annual');

-- 4. Payment status enum
CREATE TYPE public.payment_status AS ENUM (
  'created', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded'
);

-- ============================================
-- SUBSCRIPTION PLANS — master plan definitions
-- ============================================
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  target_role TEXT NOT NULL CHECK (target_role IN ('investor', 'intermediary', 'issuer')),
  billing_interval public.billing_interval NOT NULL DEFAULT 'monthly',
  price_amount INTEGER NOT NULL DEFAULT 0,
  price_currency TEXT NOT NULL DEFAULT 'INR',
  annual_discount_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  trial_days INTEGER NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  razorpay_plan_id TEXT,
  status public.plan_status NOT NULL DEFAULT 'draft',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- USER SUBSCRIPTIONS — one active per user
-- ============================================
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status public.subscription_status NOT NULL DEFAULT 'trialing',
  billing_interval public.billing_interval NOT NULL DEFAULT 'monthly',
  trial_starts_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  razorpay_subscription_id TEXT,
  razorpay_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one active/trialing subscription per user
CREATE UNIQUE INDEX idx_user_active_subscription 
  ON public.user_subscriptions (user_id) 
  WHERE status IN ('active', 'trialing', 'past_due', 'paused');

-- ============================================
-- PAYMENT HISTORY — every transaction
-- ============================================
CREATE TABLE public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status public.payment_status NOT NULL DEFAULT 'created',
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  razorpay_invoice_id TEXT,
  refund_amount INTEGER,
  refund_reason TEXT,
  payment_method TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payment_history_user ON public.payment_history (user_id, created_at DESC);

-- ============================================
-- SUBSCRIPTION EVENTS — audit trail
-- ============================================
CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  event_type TEXT NOT NULL,
  from_plan_id UUID REFERENCES public.subscription_plans(id),
  to_plan_id UUID REFERENCES public.subscription_plans(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_events_user ON public.subscription_events (user_id, created_at DESC);

-- ============================================
-- HELPER FUNCTION: get user's current subscription tier
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_plan_tier(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (
      SELECT sp.tier
      FROM public.user_subscriptions us
      JOIN public.subscription_plans sp ON sp.id = us.plan_id
      WHERE us.user_id = p_user_id
        AND us.status IN ('active', 'trialing')
      LIMIT 1
    ),
    'free'
  );
$$;

-- ============================================
-- HELPER FUNCTION: check if user has at least a given tier
-- ============================================
CREATE OR REPLACE FUNCTION public.has_plan_tier(p_user_id UUID, p_tier TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE p_tier
    WHEN 'free' THEN true
    WHEN 'pro' THEN public.get_user_plan_tier(p_user_id) IN ('pro', 'enterprise')
    WHEN 'enterprise' THEN public.get_user_plan_tier(p_user_id) = 'enterprise'
    ELSE false
  END;
$$;

-- ============================================
-- AUTO-UPDATE updated_at TRIGGERS
-- ============================================
CREATE TRIGGER trg_subscription_plans_updated
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_user_subscriptions_updated
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ROW-LEVEL SECURITY
-- ============================================

-- subscription_plans: publicly readable (for pricing page), admin-writable
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON public.subscription_plans FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins can manage plans"
  ON public.subscription_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- user_subscriptions: users see own, admins see all
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can manage subscriptions"
  ON public.user_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- payment_history: users see own, admins see all
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON public.payment_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON public.payment_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can manage payments"
  ON public.payment_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- subscription_events: users see own, admins see all
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription events"
  ON public.subscription_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all subscription events"
  ON public.subscription_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can manage subscription events"
  ON public.subscription_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
