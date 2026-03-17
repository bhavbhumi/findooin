/**
 * WeeklyChallenges — Sidebar widget showing active weekly challenges with progress bars.
 */
import { useWeeklyChallenges } from "@/hooks/useGamification";
import { Target, Clock, CheckCircle2, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface WeeklyChallengesProps {
  userId: string;
  className?: string;
}

export function WeeklyChallenges({ userId, className }: WeeklyChallengesProps) {
  const { data: challenges, isLoading } = useWeeklyChallenges(userId);

  if (isLoading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3", className)}>
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-16 bg-muted animate-pulse rounded-lg" />
        <div className="h-16 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!challenges?.length) return null;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[hsl(var(--gold))]" />
          <h3 className="text-sm font-semibold text-card-foreground">Weekly Challenges</h3>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {challenges[0]?.ends_at && (
            <span>Ends {formatDistanceToNow(new Date(challenges[0].ends_at), { addSuffix: true })}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {challenges.map((challenge: any) => {
          const progress = Math.min(100, (challenge.current_count / challenge.target_count) * 100);
          const isComplete = !!challenge.completed_at;

          return (
            <div
              key={challenge.id}
              className={cn(
                "rounded-lg border p-3 transition-colors",
                isComplete
                  ? "border-[hsl(var(--status-success))]/30 bg-[hsl(var(--status-success))]/5"
                  : "border-border bg-muted/30"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-card-foreground flex items-center gap-1">
                    {isComplete && <CheckCircle2 className="h-3 w-3 text-[hsl(var(--status-success))]" />}
                    {challenge.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{challenge.description}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Zap className="h-3 w-3 text-[hsl(var(--gold))]" />
                  <span className="text-[10px] font-bold text-[hsl(var(--gold))]">+{challenge.xp_reward}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isComplete ? "bg-[hsl(var(--status-success))]" : "bg-primary"
                    )}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-medium text-muted-foreground shrink-0">
                  {challenge.current_count}/{challenge.target_count}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
