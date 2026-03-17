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
  xs: "h-5 min-w-5 px-1 text-[10px]",
  sm: "h-6 min-w-6 px-1 text-[11px]",
  md: "h-7 min-w-7 px-1.5 text-xs",
  lg: "h-8 min-w-8 px-2 text-sm",
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
    const match = color.match(/^hsl\((.*)\)$/i);
    if (!match) return color;

    const inner = match[1].trim();

    if (inner.includes(",")) {
      const [h, s, l] = inner.split(",").map((part) => part.trim());
      return `hsla(${h}, ${s}, ${l}, ${alpha})`;
    }

    const base = inner.replace(/\s*\/\s*[\d.]+%?\s*$/, "");
    return `hsl(${base} / ${alpha})`;
  };

  const getLightness = (color: string) => {
    const commaSyntax = color.match(/^hsl\(\s*[\d.]+(?:deg)?\s*,\s*[\d.]+%\s*,\s*([\d.]+)%\s*\)$/i);
    if (commaSyntax) return Number(commaSyntax[1]);

    const spaceSyntax = color.match(/^hsl\(\s*[\d.]+(?:deg)?\s+[\d.]+%\s+([\d.]+)%/i);
    return spaceSyntax ? Number(spaceSyntax[1]) : 50;
  };

  const textColor = getLightness(config.color) >= 52 ? "hsl(222 47% 11%)" : "hsl(0 0% 100%)";
  const textShadow = textColor === "hsl(0 0% 100%)"
    ? "0 1px 2px hsl(0 0% 0% / 0.65)"
    : "0 1px 1px hsl(0 0% 100% / 0.35)";

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
              background: `linear-gradient(135deg, ${withAlpha(config.color, 1)}, ${withAlpha(config.color, 0.94)})`,
              borderColor: withAlpha(config.color, 0.98),
              color: textColor,
              textShadow,
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
