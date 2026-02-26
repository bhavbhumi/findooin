import { useState, useMemo } from "react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { FindooLoader } from "@/components/FindooLoader";
import { useNavigate } from "react-router-dom";
import {
  Heart, MessageCircle, UserPlus, UserCheck, Users,
  Bell, BellOff, CheckCheck, Trash2,
} from "lucide-react";
import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { cn } from "@/lib/utils";

const typeIconMap: Record<string, React.ElementType> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  connection_request: Users,
  connection_accepted: UserCheck,
};

const typeColorMap: Record<string, string> = {
  like: "text-destructive",
  comment: "text-primary",
  follow: "text-accent",
  connection_request: "text-primary",
  connection_accepted: "text-accent",
};

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "like", label: "Likes", icon: Heart },
  { value: "comment", label: "Comments", icon: MessageCircle },
  { value: "social", label: "Connections", icon: Users },
] as const;

type FilterTab = typeof FILTER_TABS[number]["value"];

/* ── Group notifications ── */
interface GroupedNotification {
  key: string;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
  actors: { id: string; name: string; avatar_url: string | null }[];
  message: string;
  read: boolean;
  created_at: string;
  ids: string[];
}

function groupNotifications(notifications: Notification[]): GroupedNotification[] {
  const groups = new Map<string, GroupedNotification>();

  notifications.forEach((n) => {
    // Group likes/comments on same post within same day
    const dateKey = new Date(n.created_at).toISOString().slice(0, 10);
    const groupKey = (n.type === "like" || n.type === "comment") && n.reference_id
      ? `${n.type}-${n.reference_id}-${dateKey}`
      : n.id; // don't group other types

    if (groups.has(groupKey)) {
      const g = groups.get(groupKey)!;
      if (n.actor_profile && !g.actors.find((a) => a.id === n.actor_id)) {
        g.actors.push({
          id: n.actor_id!,
          name: n.actor_profile.display_name || n.actor_profile.full_name,
          avatar_url: n.actor_profile.avatar_url,
        });
      }
      if (!n.read) g.read = false;
      g.ids.push(n.id);
      // Keep earliest created_at
      if (n.created_at > g.created_at) g.created_at = n.created_at;
    } else {
      const actorName = n.actor_profile?.display_name || n.actor_profile?.full_name || "";
      groups.set(groupKey, {
        key: groupKey,
        type: n.type,
        reference_id: n.reference_id,
        reference_type: n.reference_type,
        actors: n.actor_profile ? [{ id: n.actor_id!, name: actorName, avatar_url: n.actor_profile.avatar_url }] : [],
        message: n.message,
        read: n.read,
        created_at: n.created_at,
        ids: [n.id],
      });
    }
  });

  return Array.from(groups.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function buildGroupMessage(g: GroupedNotification): string {
  if (g.actors.length <= 1) return g.message;
  const firstName = g.actors[0].name;
  const othersCount = g.actors.length - 1;
  const action = g.type === "like" ? "liked" : g.type === "comment" ? "commented on" : "";
  if (!action) return g.message;
  return `${firstName} and ${othersCount} other${othersCount > 1 ? "s" : ""} ${action} your post`;
}

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "social") return notifications.filter((n) => ["follow", "connection_request", "connection_accepted"].includes(n.type));
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const grouped = useMemo(() => groupNotifications(filtered), [filtered]);

  // Group by date
  const dateGrouped = useMemo(() => {
    const sections: { date: string; items: GroupedNotification[] }[] = [];
    let currentDate = "";
    grouped.forEach((g) => {
      const dateLabel = getDateLabel(g.created_at);
      if (dateLabel !== currentDate) {
        sections.push({ date: dateLabel, items: [] });
        currentDate = dateLabel;
      }
      sections[sections.length - 1].items.push(g);
    });
    return sections;
  }, [grouped]);

  const handleClick = (g: GroupedNotification) => {
    g.ids.forEach((id) => {
      const notif = notifications.find((n) => n.id === id);
      if (notif && !notif.read) markAsRead(id);
    });
    if (g.reference_type === "post" && g.reference_id) {
      navigate("/feed");
    } else if (g.reference_type === "connection") {
      navigate("/network");
    } else if (g.actors[0]?.id) {
      navigate(`/profile/${g.actors[0].id}`);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AppLayout maxWidth="max-w-2xl" className="pt-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar">
        {FILTER_TABS.map((tab) => {
          const count = tab.value === "all"
            ? notifications.length
            : tab.value === "social"
            ? notifications.filter((n) => ["follow", "connection_request", "connection_accepted"].includes(n.type)).length
            : notifications.filter((n) => n.type === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                filter === tab.value
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {tab.label}
              {count > 0 && <span className="ml-1 text-[10px] opacity-60">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Notifications list */}
      {loading ? (
        <FindooLoader text="Loading notifications..." />
      ) : dateGrouped.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BellOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            When someone interacts with your posts or connects with you, you'll see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {dateGrouped.map((section) => (
            <div key={section.date}>
              <p className="text-[11px] font-medium text-muted-foreground mb-2 px-1">{section.date}</p>
              <div className="space-y-1.5">
                {section.items.map((g) => {
                  const Icon = typeIconMap[g.type] || Bell;
                  const colorClass = typeColorMap[g.type] || "text-muted-foreground";
                  const displayMessage = buildGroupMessage(g);
                  const primaryActor = g.actors[0];

                  return (
                    <button
                      key={g.key}
                      onClick={() => handleClick(g)}
                      className={cn(
                        "w-full text-left rounded-xl border p-4 flex items-start gap-3 transition-colors hover:bg-muted/50",
                        g.read ? "border-border bg-card" : "border-accent/20 bg-accent/5"
                      )}
                    >
                      {/* Avatar stack */}
                      <div className="relative shrink-0">
                        {g.actors.length > 1 ? (
                          <div className="flex -space-x-2">
                            {g.actors.slice(0, 3).map((actor, i) => (
                              <NetworkAvatar
                                key={actor.id}
                                src={actor.avatar_url}
                                initials={getInitials(actor.name)}
                                size="sm"
                                className={cn("!h-8 !w-8 text-[10px] border-2 border-card", i > 0 && "relative")}
                              />
                            ))}
                            {g.actors.length > 3 && (
                              <div className="h-8 w-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                +{g.actors.length - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <NetworkAvatar
                            src={primaryActor?.avatar_url}
                            initials={primaryActor ? getInitials(primaryActor.name) : "?"}
                            size="sm"
                          />
                        )}
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-card border-2 border-card flex items-center justify-center">
                          <Icon className={`h-3 w-3 ${colorClass}`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm leading-snug", g.read ? "text-foreground" : "text-foreground font-medium")}>
                          {displayMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(g.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {!g.read && (
                        <div className="h-2.5 w-2.5 rounded-full bg-accent shrink-0 mt-1.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Notifications;
