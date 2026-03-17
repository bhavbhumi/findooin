import { getLevelConfig } from "@/lib/gamification";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface LevelBadgeProps {
  level: number;
  size?: "xs" | "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "h-[18px] min-w-[18px] px-0.5 text-[9px]",
  sm: "h-[22px] min-w-[22px] px-0.5 text-[10px]",
  md: "h-7 min-w-7 px-1 text-xs",
  lg: "h-8 min-w-8 px-1.5 text-sm",
};

const labelSizeClasses = {
  xs: "text-[10px]",
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-sm",
};

export function LevelBadge({ level, size = "sm", showLabel = false, className }: LevelBadgeProps) {
  const config = getLevelConfig(level);

  const withAlpha = (color: string, alpha: number) => {
    if (color.startsWith("hsl(") && color.endsWith(")")) {
      return `hsl(${color.slice(4, -1)} / ${alpha})`;
    }
    return color;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex items-center gap-1 shrink-0", className)}>
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full font-bold border-2 leading-none ring-1 ring-background/80",
              sizeClasses[size]
            )}
            style={{
              background: `linear-gradient(135deg, ${withAlpha(config.color, 1)}, ${withAlpha(config.color, 0.96)})`,
              borderColor: withAlpha(config.color, 1),
              color: "hsl(var(--primary-foreground))",
              textShadow: "0 1px 2px hsl(0 0% 0% / 0.75)",
              boxShadow: `0 0 0 1px hsl(var(--background)), 0 3px 10px ${withAlpha(config.color, 0.65)}`,
            }}
          >
            <span className="mr-px">{config.icon.length <= 2 ? config.icon : ""}</span>
            {level}
          </span>
          {showLabel && (
            <span className={cn("font-semibold", labelSizeClasses[size])} style={{ color: config.color }}>
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
