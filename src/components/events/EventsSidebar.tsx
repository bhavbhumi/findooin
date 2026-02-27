import { useMemo } from "react";
import { useEvents, useMyRegistrations, EVENT_CATEGORY_LABELS } from "@/hooks/useEvents";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  BarChart3, CalendarDays, Flame, Users, Ticket, MapPin,
  Monitor, TrendingUp, Target
} from "lucide-react";
import { format, isSameDay } from "date-fns";

interface EventsSidebarProps {
  onCategoryClick?: (category: string) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date | undefined) => void;
  eventDates?: Date[];
}

export function EventsSidebar({ onCategoryClick, selectedDate, onDateSelect, eventDates = [] }: EventsSidebarProps) {
  const { userId } = useRole();
  const { data: events } = useEvents({ upcoming: true });
  const { data: regData } = useMyRegistrations();

  // Stats
  const stats = useMemo(() => {
    if (!events?.length) return null;
    const total = events.length;
    const virtual = events.filter((e) => e.event_mode === "virtual").length;
    const free = events.filter((e) => e.is_free).length;
    const thisWeek = events.filter((e) => {
      const d = new Date(e.start_time);
      return d.getTime() - Date.now() < 7 * 86400000;
    }).length;
    return { total, virtual, free, thisWeek };
  }, [events]);

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    if (!events?.length) return [];
    const counts: Record<string, number> = {};
    events.forEach((e) => { counts[e.category] = (counts[e.category] || 0) + 1; });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([cat, count]) => ({
        category: cat,
        label: EVENT_CATEGORY_LABELS[cat] || cat,
        count,
        percent: Math.round((count / events.length) * 100),
      }));
  }, [events]);

  // Upcoming (next 3)
  const upcoming = useMemo(() => {
    return events?.slice(0, 3) || [];
  }, [events]);

  // My registrations count
  const myRegCount = regData?.registrations?.length || 0;

  return (
    <div className="space-y-4">
      {/* Calendar Widget */}
      <div className="rounded-xl border border-border bg-card p-3">
        <h3 className="text-sm font-semibold text-card-foreground mb-2 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          Event Calendar
        </h3>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          className={cn("p-0 pointer-events-auto")}
          modifiers={{ hasEvent: eventDates }}
          modifiersClassNames={{ hasEvent: "bg-primary/10 font-bold text-primary" }}
        />
      </div>

      {/* Event Stats */}
      {stats && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Event Pulse
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <StatBox icon={<CalendarDays className="h-3.5 w-3.5" />} label="Upcoming" value={stats.total} />
            <StatBox icon={<TrendingUp className="h-3.5 w-3.5" />} label="This Week" value={stats.thisWeek} highlight />
            <StatBox icon={<Monitor className="h-3.5 w-3.5" />} label="Virtual" value={stats.virtual} />
            <StatBox icon={<Ticket className="h-3.5 w-3.5" />} label="Free" value={stats.free} />
          </div>
        </div>
      )}

      {/* My Registrations */}
      {userId && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            My Events
          </h3>
          <div className="grid grid-cols-1 gap-2">
            <StatBox icon={<Ticket className="h-3.5 w-3.5" />} label="Registered" value={myRegCount} />
          </div>
        </div>
      )}

      {/* Popular Categories */}
      {categoryBreakdown.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Popular Categories
          </h3>
          <div className="space-y-2">
            {categoryBreakdown.map((cat) => (
              <button
                key={cat.category}
                onClick={() => onCategoryClick?.(cat.category)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-card-foreground group-hover:text-primary transition-colors truncate">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">{cat.count}</span>
                </div>
                <Progress value={cat.percent} className="h-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Coming Up
          </h3>
          <div className="space-y-2.5">
            {upcoming.map((ev) => (
              <div key={ev.id} className="flex items-start gap-2.5">
                <div className="shrink-0 w-10 text-center rounded bg-primary/5 py-1">
                  <p className="text-[9px] uppercase font-semibold text-primary">{format(new Date(ev.start_time), "MMM")}</p>
                  <p className="text-sm font-bold text-foreground leading-none">{format(new Date(ev.start_time), "d")}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground truncate">{ev.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {format(new Date(ev.start_time), "h:mm a")} · {EVENT_CATEGORY_LABELS[ev.category]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, highlight = false }: { icon: React.ReactNode; label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : "text-card-foreground"}`}>{value}</p>
    </div>
  );
}
