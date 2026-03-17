import { getLevelConfig, getNextLevelConfig, getXPProgress } from "@/lib/gamification";
import { Progress } from "@/components/ui/progress";
import { Zap } from "lucide-react";

interface XPProgressBarProps {
  totalXP: number;
  level: number;
  compact?: boolean;
}

export function XPProgressBar({ totalXP, level, compact = false }: XPProgressBarProps) {
  const current = getLevelConfig(level);
  const next = getNextLevelConfig(level);
  const progress = getXPProgress(totalXP, level);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Zap className="h-3.5 w-3.5 text-gold" />
        <div className="flex-1">
          <Progress value={progress} className="h-1.5 bg-muted" />
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground">
          {totalXP.toLocaleString()} XP
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{current.icon}</span>
          <span className="text-sm font-semibold text-card-foreground">{current.name}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-gold" />
          <span className="font-bold text-card-foreground">{totalXP.toLocaleString()}</span>
          {next && <span>/ {next.minXP.toLocaleString()} XP</span>}
        </div>
      </div>
      <Progress value={progress} className="h-2.5 bg-muted" />
      {next && (
        <p className="text-[10px] text-muted-foreground text-right">
          {(next.minXP - totalXP).toLocaleString()} XP to {next.name}
        </p>
      )}
    </div>
  );
}
