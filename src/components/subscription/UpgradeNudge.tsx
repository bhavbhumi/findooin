/**
 * UpgradeNudge — Soft-limit upgrade prompt shown when user approaches or hits a plan limit.
 * Designed to demonstrate value rather than hard-block.
 */
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UpgradeNudgeProps {
  /** What feature this limit applies to */
  feature: string;
  /** Current usage count */
  used: number;
  /** Plan limit (0 = unlimited) */
  limit: number;
  /** What they get with Pro */
  proValue: string;
  /** Compact inline vs card display */
  variant?: "inline" | "card" | "banner";
  className?: string;
}

export function UpgradeNudge({ feature, used, limit, proValue, variant = "card", className }: UpgradeNudgeProps) {
  if (limit === 0) return null; // Unlimited — no nudge needed
  
  const percentage = Math.min((used / limit) * 100, 100);
  const isAtLimit = used >= limit;
  const isNearLimit = percentage >= 75;
  
  // Don't show nudge if well within limits
  if (!isNearLimit && !isAtLimit) return null;

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-xs", className)}>
        <span className={cn(
          "font-medium",
          isAtLimit ? "text-destructive" : "text-amber-600 dark:text-amber-400"
        )}>
          {used}/{limit} {feature}
        </span>
        <Link to="/pricing" className="text-primary hover:underline underline-offset-2 flex items-center gap-0.5">
          Upgrade <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border",
        isAtLimit
          ? "bg-destructive/5 border-destructive/20"
          : "bg-amber-500/5 border-amber-500/20",
        className
      )}>
        {isAtLimit ? (
          <Lock className="h-4 w-4 text-destructive shrink-0" />
        ) : (
          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-card-foreground">
            {isAtLimit
              ? `You've reached your ${feature} limit`
              : `${limit - used} ${feature} remaining this month`
            }
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pro members get {proValue}
          </p>
        </div>
        <Button size="sm" className="shrink-0 gap-1" asChild>
          <Link to="/pricing">
            <Sparkles className="h-3 w-3" /> Upgrade
          </Link>
        </Button>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={cn(
      "rounded-xl border bg-card p-4 space-y-3",
      isAtLimit ? "border-destructive/20" : "border-amber-500/20",
      className
    )}>
      <div className="flex items-center gap-2">
        <Sparkles className={cn("h-4 w-4", isAtLimit ? "text-destructive" : "text-amber-500")} />
        <span className="text-sm font-semibold text-card-foreground">{feature}</span>
        <span className={cn(
          "text-xs font-mono ml-auto",
          isAtLimit ? "text-destructive" : "text-muted-foreground"
        )}>
          {used}/{limit}
        </span>
      </div>
      <Progress value={percentage} className="h-1.5" />
      <p className="text-xs text-muted-foreground">
        {isAtLimit
          ? `Limit reached. Upgrade to Pro for ${proValue}.`
          : `${limit - used} remaining. Pro members get ${proValue}.`
        }
      </p>
      <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs" asChild>
        <Link to="/pricing">
          <Sparkles className="h-3 w-3" /> See Pro Benefits
        </Link>
      </Button>
    </div>
  );
}

/** Quick check if user should see upgrade prompts */
export function shouldShowNudge(used: number, limit: number): boolean {
  if (limit === 0) return false; // unlimited
  return used >= Math.floor(limit * 0.75);
}
