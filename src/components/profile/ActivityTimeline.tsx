import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Edit3, MessageSquare, Heart, Users, Calendar, TrendingUp,
  Bookmark, UserPlus, FileCheck,
} from "lucide-react";
import { format, subDays, startOfDay, differenceInDays, parseISO } from "date-fns";
import { FindooLoader } from "@/components/FindooLoader";

interface ActivityTimelineProps {
  profileId: string;
  isOwnProfile: boolean;
}

interface ActivityEvent {
  type: "post" | "comment" | "like" | "connection" | "event_reg";
  date: string;
  label: string;
}

export const ActivityTimeline = ({ profileId, isOwnProfile }: ActivityTimelineProps) => {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, [profileId]);

  const loadActivity = async () => {
    setLoading(true);
    const since = subDays(new Date(), 90).toISOString();

    const [postsRes, commentsRes, likesRes, connsRes, eventsRes] = await Promise.all([
      supabase.from("posts").select("id, created_at, post_type").eq("author_id", profileId).gte("created_at", since).order("created_at", { ascending: false }).limit(50),
      supabase.from("comments").select("id, created_at").eq("author_id", profileId).gte("created_at", since).order("created_at", { ascending: false }).limit(50),
      supabase.from("post_interactions").select("id, created_at, interaction_type").eq("user_id", profileId).eq("interaction_type", "like").gte("created_at", since).limit(50),
      supabase.from("connections").select("id, created_at, connection_type").eq("from_user_id", profileId).gte("created_at", since).limit(30),
      supabase.from("event_registrations").select("id, registered_at").eq("user_id", profileId).gte("registered_at", since).limit(20),
    ]);

    const all: ActivityEvent[] = [
      ...(postsRes.data || []).map((p: any) => ({ type: "post" as const, date: p.created_at, label: `Published a ${p.post_type.replace(/_/g, " ")} post` })),
      ...(commentsRes.data || []).map((c: any) => ({ type: "comment" as const, date: c.created_at, label: "Commented on a post" })),
      ...(likesRes.data || []).map((l: any) => ({ type: "like" as const, date: l.created_at, label: "Liked a post" })),
      ...(connsRes.data || []).map((c: any) => ({ type: "connection" as const, date: c.created_at, label: c.connection_type === "follow" ? "Followed someone" : "Connected with someone" })),
      ...(eventsRes.data || []).map((e: any) => ({ type: "event_reg" as const, date: e.registered_at, label: "Registered for an event" })),
    ];

    all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setEvents(all);
    setLoading(false);
  };

  // Heatmap: last 90 days
  const heatmapData = useMemo(() => {
    const today = startOfDay(new Date());
    const days: Record<string, number> = {};
    for (let i = 0; i < 91; i++) {
      const d = format(subDays(today, i), "yyyy-MM-dd");
      days[d] = 0;
    }
    events.forEach((e) => {
      const d = format(parseISO(e.date), "yyyy-MM-dd");
      if (days[d] !== undefined) days[d]++;
    });
    return days;
  }, [events]);

  const maxActivity = Math.max(...Object.values(heatmapData), 1);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted";
    const intensity = count / maxActivity;
    if (intensity > 0.75) return "bg-primary";
    if (intensity > 0.5) return "bg-primary/70";
    if (intensity > 0.25) return "bg-primary/40";
    return "bg-primary/20";
  };

  const iconMap = {
    post: Edit3,
    comment: MessageSquare,
    like: Heart,
    connection: UserPlus,
    event_reg: Calendar,
  };

  if (loading) return <FindooLoader size="sm" text="Loading activity..." />;

  const weeks: string[][] = [];
  const today = startOfDay(new Date());
  const sortedDays = Object.keys(heatmapData).sort();
  // Group into weeks (7 cols)
  for (let i = 0; i < sortedDays.length; i += 7) {
    weeks.push(sortedDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-4">
      {/* Contribution Heatmap */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold font-heading text-card-foreground">Activity · Last 90 Days</h3>
          </div>
          <span className="text-xs text-muted-foreground">{events.length} actions</span>
        </div>
        <div className="p-5">
          <div className="flex gap-[3px] overflow-x-auto pb-2 touch-pan-x">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day) => (
                  <div
                    key={day}
                    className={`h-3 w-3 sm:h-3 sm:w-3 min-w-[12px] min-h-[12px] rounded-[2px] ${getColor(heatmapData[day])} transition-colors`}
                    title={`${format(parseISO(day), "MMM d")}: ${heatmapData[day]} action${heatmapData[day] !== 1 ? "s" : ""}`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-[2px]">
              <div className="h-2.5 w-2.5 rounded-[2px] bg-muted" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-primary/20" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-primary/40" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-primary/70" />
              <div className="h-2.5 w-2.5 rounded-[2px] bg-primary" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold font-heading text-card-foreground">Recent Activity</h3>
        </div>
        <div className="divide-y divide-border">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </div>
          ) : (
            events.slice(0, 15).map((event, i) => {
              const Icon = iconMap[event.type];
              return (
                <div key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground">{event.label}</p>
                    <p className="text-[10px] text-muted-foreground">{format(parseISO(event.date), "MMM d, yyyy · h:mm a")}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
