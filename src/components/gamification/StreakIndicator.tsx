import { Flame } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
  streak: number;
  multiplier?: number;
  className?: string;
}

export function StreakIndicator({ streak, multiplier = 1.0, className }: StreakIndicatorProps) {
  if (streak < 1) return null;

  const isHot = streak >= 7;
  const isOnFire = streak >= 30;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-bold rounded-full px-1.5 py-0.5 transition-colors",
            isOnFire
              ? "bg-destructive/15 text-destructive"
              : isHot
              ? "bg-gold/15 text-gold"
              : "bg-muted text-muted-foreground",
            className
          )}
        >
          <Flame className={cn("h-3 w-3", isOnFire && "animate-pulse")} />
          {streak}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <p className="font-semibold">{streak}-day login streak 🔥</p>
        {multiplier > 1 && <p className="text-muted-foreground">{multiplier}x XP multiplier active!</p>}
      </TooltipContent>
    </Tooltip>
  );
}
