/**
 * useSubscriptionPlans — Fetches all active subscription plans.
 * Used by pricing page and admin plan management.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SubscriptionPlan, BillingInterval } from "./useSubscription";

export function useSubscriptionPlans(filters?: {
  targetRole?: string;
  billingInterval?: BillingInterval;
}) {
  return useQuery({
    queryKey: ["subscription-plans", filters?.targetRole, filters?.billingInterval],
    queryFn: async () => {
      let query = supabase
        .from("subscription_plans")
        .select("*")
        .eq("status", "active")
        .order("sort_order");

      if (filters?.targetRole) {
        query = query.eq("target_role", filters.targetRole);
      }
      if (filters?.billingInterval) {
        query = query.eq("billing_interval", filters.billingInterval);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch plans:", error);
        return [];
      }

      return (data ?? []) as SubscriptionPlan[];
    },
    staleTime: 10 * 60 * 1000,
  });
}

/** Group plans by tier for pricing page display */
export function groupPlansByTier(plans: SubscriptionPlan[]) {
  return {
    free: plans.filter(p => p.tier === "free"),
    pro: plans.filter(p => p.tier === "pro"),
    enterprise: plans.filter(p => p.tier === "enterprise"),
  };
}

/** Format price in INR (amount is in paise) */
export function formatPrice(amountPaise: number, interval?: BillingInterval): string {
  const rupees = amountPaise / 100;
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);

  if (interval === "annual") {
    return `${formatted}/yr`;
  }
  return amountPaise === 0 ? "Free" : `${formatted}/mo`;
}

/** Get monthly equivalent for annual plans */
export function getMonthlyEquivalent(annualPaise: number): string {
  return formatPrice(Math.round(annualPaise / 12), "monthly");
}
