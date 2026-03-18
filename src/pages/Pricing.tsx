/**
 * Pricing — Public pricing page with role-aware tier cards,
 * monthly/annual toggle, and CTA buttons.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { useSubscriptionPlans, formatPrice, getMonthlyEquivalent } from "@/hooks/useSubscriptionPlans";
import { useRole } from "@/contexts/RoleContext";
import { useSubscription } from "@/hooks/useSubscription";
import type { SubscriptionPlan, BillingInterval } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Check, Sparkles, Building2, BarChart3, UserCheck, Landmark,
  Crown, Zap, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROLE_TABS = [
  { key: "investor", label: "Investor", icon: BarChart3, color: "hsl(var(--investor))" },
  { key: "intermediary", label: "Intermediary", icon: UserCheck, color: "hsl(var(--intermediary))" },
  { key: "issuer", label: "Issuer", icon: Landmark, color: "hsl(var(--issuer))" },
] as const;

const TIER_CONFIG = {
  free: { label: "Free", icon: Zap, accent: "border-border" },
  pro: { label: "Pro", icon: Sparkles, accent: "border-primary ring-2 ring-primary/20" },
  enterprise: { label: "Enterprise", icon: Crown, accent: "border-border" },
};

export default function Pricing() {
  usePageMeta({
    title: "Pricing — FindOO",
    description: "Choose the right plan for your BFSI networking needs. Free, Pro, and Enterprise tiers for Investors, Intermediaries, and Issuers.",
  });

  const navigate = useNavigate();
  const { activeRole, userId } = useRole();
  const { tier: currentTier } = useSubscription();

  const [selectedRole, setSelectedRole] = useState<string>(activeRole || "investor");
  const [isAnnual, setIsAnnual] = useState(false);

  const billingInterval: BillingInterval = isAnnual ? "annual" : "monthly";

  const { data: allPlans, isLoading } = useSubscriptionPlans();

  // Filter plans for selected role
  const rolePlans = (allPlans || []).filter((p) => p.target_role === selectedRole);

  // Group by tier, pick correct billing interval (free has no annual)
  const freePlan = rolePlans.find((p) => p.tier === "free");
  const proPlan = rolePlans.find((p) => p.tier === "pro" && p.billing_interval === billingInterval);
  const proMonthly = rolePlans.find((p) => p.tier === "pro" && p.billing_interval === "monthly");
  const enterprisePlan = rolePlans.find(
    (p) => p.tier === "enterprise" && p.billing_interval === billingInterval
  );
  const enterpriseMonthly = rolePlans.find(
    (p) => p.tier === "enterprise" && p.billing_interval === "monthly"
  );

  const tiers = [
    { plan: freePlan, config: TIER_CONFIG.free, monthly: null },
    { plan: proPlan, config: TIER_CONFIG.pro, monthly: proMonthly },
    { plan: enterprisePlan, config: TIER_CONFIG.enterprise, monthly: enterpriseMonthly },
  ].filter((t) => t.plan);

  const handleCTA = (plan: SubscriptionPlan) => {
    if (!userId) {
      navigate("/auth?redirect=/pricing");
      return;
    }
    if (plan.tier === "free") return;
    navigate(`/settings?tab=subscription&plan=${plan.id}`);
  };

  return (
    <PublicPageLayout>
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you're ready. Every plan includes a 14-day free trial.
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-muted rounded-lg p-1 gap-1">
            {ROLE_TABS.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => setSelectedRole(key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                  selectedRole === key
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" style={selectedRole === key ? { color } : undefined} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Label
            htmlFor="billing-toggle"
            className={cn("text-sm cursor-pointer", !isAnnual && "font-semibold text-foreground")}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label
            htmlFor="billing-toggle"
            className={cn("text-sm cursor-pointer", isAnnual && "font-semibold text-foreground")}
          >
            Annual
          </Label>
          {isAnnual && (
            <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-0">
              Save 15%
            </Badge>
          )}
        </div>

        {/* Pricing Cards */}
        {isLoading ? (
          <div className="text-center text-muted-foreground py-20">Loading plans...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {tiers.map(({ plan, config, monthly }) => {
              if (!plan) return null;
              const Icon = config.icon;
              const isCurrent = currentTier === plan.tier;
              const isPro = plan.tier === "pro";

              return (
                <Card
                  key={plan.id}
                  className={cn(
                    "relative flex flex-col border-2 transition-all",
                    config.accent,
                    isPro && "md:-mt-4 md:mb-4"
                  )}
                >
                  {isPro && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-3 text-xs">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{config.label}</CardTitle>
                    </div>
                    <CardDescription className="text-sm min-h-[2.5rem]">
                      {plan.tier === "free"
                        ? "Get started with the basics"
                        : plan.tier === "pro"
                        ? "Everything you need to grow"
                        : "For teams and power users"}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    {/* Price */}
                    <div className="mb-5">
                      {plan.price_amount === 0 ? (
                        <div className="text-3xl font-bold text-foreground">Free</div>
                      ) : (
                        <>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-foreground">
                              {isAnnual
                                ? getMonthlyEquivalent(plan.price_amount)
                                : formatPrice(plan.price_amount)}
                            </span>
                            {!isAnnual && (
                              <span className="text-muted-foreground text-sm">/mo</span>
                            )}
                          </div>
                          {isAnnual && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Billed {formatPrice(plan.price_amount, "annual")}
                            </p>
                          )}
                          {monthly && isAnnual && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                              Save {formatPrice(monthly.price_amount * 12 - plan.price_amount)} /yr
                            </p>
                          )}
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <Separator className="mb-4" />
                    <ul className="space-y-2.5">
                      {(plan.features as string[]).map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.trial_days > 0 && (
                      <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        {plan.trial_days}-day free trial included
                      </p>
                    )}
                  </CardContent>

                  <CardFooter>
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : plan.tier === "free" ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleCTA(plan)}
                      >
                        Get Started Free
                      </Button>
                    ) : (
                      <Button
                        className={cn("w-full group", isPro && "bg-primary")}
                        onClick={() => handleCTA(plan)}
                      >
                        {userId ? "Upgrade" : "Get Started"}
                        <ArrowRight className="h-4 w-4 ml-1.5 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* FAQ / Bottom CTA */}
        <div className="text-center mt-16 space-y-3">
          <p className="text-muted-foreground text-sm">
            All paid plans include a 14-day free trial. No credit card required to start.
          </p>
          <p className="text-muted-foreground text-sm">
            Need a custom plan?{" "}
            <button
              onClick={() => navigate("/contact")}
              className="text-primary font-medium hover:underline"
            >
              Contact us
            </button>
          </p>
        </div>
      </div>
    </PublicPageLayout>
  );
}
