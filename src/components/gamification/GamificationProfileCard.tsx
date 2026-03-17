import { useUserXP, useUserBadges } from "@/hooks/useGamification";
import { XPProgressBar } from "./XPProgressBar";
import { BadgeShowcase } from "./BadgeShowcase";
import { StreakIndicator } from "./StreakIndicator";
import { LevelBadge } from "./LevelBadge";
import { Trophy, Target } from "lucide-react";

interface GamificationProfileCardProps {
  userId: string;
  compact?: boolean;
}

export function GamificationProfileCard({ userId, compact = false }: GamificationProfileCardProps) {
  const { data: xp } = useUserXP(userId);
  const { data: badges } = useUserBadges(userId);

  if (!xp) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <LevelBadge level={xp.level} size="xs" />
        {xp.current_streak > 0 && (
          <StreakIndicator streak={xp.current_streak} multiplier={xp.streak_multiplier} />
        )}
        {badges && badges.length > 0 && (
          <BadgeShowcase badges={badges} maxDisplay={3} compact />
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold" />
          <h3 className="text-sm font-semibold text-card-foreground">Achievements</h3>
        </div>
        <div className="flex items-center gap-2">
          <LevelBadge level={xp.level} size="md" showLabel />
          {xp.current_streak > 0 && (
            <StreakIndicator streak={xp.current_streak} multiplier={xp.streak_multiplier} />
          )}
        </div>
      </div>

      <XPProgressBar totalXP={xp.total_xp} level={xp.level} />

      {badges && badges.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Target className="h-3 w-3" /> Badges Earned ({badges.length})
          </p>
          <BadgeShowcase badges={badges} maxDisplay={8} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-lg font-bold text-card-foreground">{xp.total_xp.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground">Total XP</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-lg font-bold text-card-foreground">{xp.current_streak}</p>
          <p className="text-[10px] text-muted-foreground">Day Streak</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-lg font-bold text-card-foreground">{badges?.length || 0}</p>
          <p className="text-[10px] text-muted-foreground">Badges</p>
        </div>
      </div>
    </div>
  );
}
