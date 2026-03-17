import { getLevelConfig } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LevelBadgeProps {
  level: number;
  size?: "xs" | "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "h-4 w-4 text-[8px]",
  sm: "h-5 w-5 text-[10px]",
  md: "h-7 w-7 text-xs",
};

export function LevelBadge({ level, size = "sm", showLabel = false, className }: LevelBadgeProps) {
  const config = getLevelConfig(level);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center gap-1 shrink-0", className)}>
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full font-bold border-2 shadow-sm",
              sizeClasses[size]
            )}
            style={{
              background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
              borderColor: `${config.color}80`,
              color: "white",
              textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            }}
          >
            {level}
          </span>
          {showLabel && (
            <span className="text-[10px] font-medium text-muted-foreground">
              {config.name}
            </span>
          )}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        <span className="font-semibold">{config.icon} Level {level}</span> — {config.name}
      </TooltipContent>
    </Tooltip>
  );
}
