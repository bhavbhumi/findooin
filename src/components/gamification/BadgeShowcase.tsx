import { type UserBadge } from "@/hooks/useGamification";
import { TIER_COLORS, BADGE_CATEGORY_LABELS } from "@/lib/gamification";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, Pencil, FileText, Newspaper, Crown, UserPlus, Users, Globe, Heart, MessageSquare, Flame, ShieldCheck, CalendarDays, Megaphone, UserCheck, Store, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Award, Pencil, FileText, Newspaper, Crown, UserPlus, Users, Globe,
  Heart, MessageSquare, Flame, ShieldCheck, CalendarDays, Megaphone,
  UserCheck, Store, Network,
};

interface BadgeShowcaseProps {
  badges: UserBadge[];
  maxDisplay?: number;
  compact?: boolean;
  className?: string;
}

export function BadgeShowcase({ badges, maxDisplay = 6, compact = false, className }: BadgeShowcaseProps) {
  if (!badges.length) return null;

  const pinned = badges.filter(b => b.is_pinned);
  const unpinned = badges.filter(b => !b.is_pinned);
  const display = [...pinned, ...unpinned].slice(0, maxDisplay);
  const remaining = badges.length - display.length;

  return (
    <div className={cn("flex items-center gap-1 flex-wrap", className)}>
      {display.map((ub) => {
        const Icon = ICON_MAP[ub.badge.icon_name] || Award;
        const tierColor = TIER_COLORS[ub.badge.tier] || TIER_COLORS.bronze;

        return (
          <Tooltip key={ub.id}>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full border-2 shadow-sm cursor-default transition-transform hover:scale-110",
                  compact ? "h-6 w-6" : "h-8 w-8"
                )}
                style={{
                  borderColor: tierColor,
                  background: `${tierColor}15`,
                }}
              >
                <Icon
                  className={compact ? "h-3 w-3" : "h-4 w-4"}
                  style={{ color: tierColor }}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[200px]">
              <p className="font-semibold text-xs">{ub.badge.name}</p>
              <p className="text-[10px] text-muted-foreground">{ub.badge.description}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Earned {formatDistanceToNow(new Date(ub.earned_at), { addSuffix: true })}
              </p>
            </TooltipContent>
          </Tooltip>
        );
      })}
      {remaining > 0 && (
        <span className="text-[10px] text-muted-foreground font-medium">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
