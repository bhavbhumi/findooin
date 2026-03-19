/**
 * useSubscription — Fetches user's current subscription & plan tier.
 * 
 * Provides:
 * - currentPlan: the active subscription plan details
 * - tier: 'free' | 'pro' | 'enterprise'
 * - status: subscription status (trialing, active, etc.)
 * - isTrialing: whether user is in trial period
 * - trialDaysLeft: remaining trial days
 * - hasTier(t): check if user has at least tier t
 * - hasFeature(key): check plan limits/features
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";

export type PlanTier = "free" | "pro" | "enterprise";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired" | "paused";
export type BillingInterval = "monthly" | "annual";

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  tier: PlanTier;
  target_role: string;
  billing_interval: BillingInterval;
  price_amount: number;
  price_currency: string;
  trial_days: number;
  features: string[];
  limits: Record<string, number | boolean>;
  sort_order: number;
}

export interface UserSubscription {
  id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_interval: BillingInterval;
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  cancel_at_period_end: boolean;
  plan: SubscriptionPlan;
}

const TIER_RANK: Record<PlanTier, number> = { free: 0, pro: 1, enterprise: 2 };

export function useSubscription() {
  const { userId, activeRole } = useRole();

  const { data: subscription, isLoading, refetch } = useQuery({
    queryKey: ["user-subscription", userId, activeRole],
    queryFn: async () => {
      if (!userId) return null;

      // Build query — filter by role's matching plan when activeRole is set
      let query = supabase
        .from("user_subscriptions")
        .select(`
          id, plan_id, status, billing_interval,
          trial_starts_at, trial_ends_at,
          current_period_start, current_period_end,
          cancelled_at, cancel_at_period_end,
          subscription_plans!inner (
            id, name, slug, description, tier, target_role,
            billing_interval, price_amount, price_currency,
            trial_days, features, limits, sort_order
          )
        `)
        .eq("user_id", userId)
        .in("status", ["active", "trialing", "past_due", "paused"]);

      if (activeRole) {
        query = query.eq("subscription_plans.target_role", activeRole);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) {
        console.error("Failed to fetch subscription:", error);
        return null;
      }

      if (!data) return null;

      const plan = data.subscription_plans as unknown as SubscriptionPlan;
      return {
        ...data,
        plan,
      } as UserSubscription;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const tier: PlanTier = (subscription?.plan?.tier as PlanTier) ?? "free";
  const status: SubscriptionStatus | null = subscription?.status ?? null;
  const isTrialing = status === "trialing";

  const trialDaysLeft = isTrialing && subscription?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / 86_400_000))
    : 0;

  const hasTier = (requiredTier: PlanTier): boolean => {
    return TIER_RANK[tier] >= TIER_RANK[requiredTier];
  };

  const hasFeature = (key: string): boolean => {
    if (!subscription?.plan?.limits) return false;
    const val = subscription.plan.limits[key];
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val !== 0;
    return false;
  };

  const getLimit = (key: string): number => {
    if (!subscription?.plan?.limits) return 0;
    const val = subscription.plan.limits[key];
    return typeof val === "number" ? val : 0;
  };

  return {
    subscription,
    tier,
    status,
    isTrialing,
    trialDaysLeft,
    isLoading,
    hasTier,
    hasFeature,
    getLimit,
    refetch,
    activeRole,
  };
}
