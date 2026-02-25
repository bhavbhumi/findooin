import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart, MessageCircle, UserPlus, UserCheck, Users,
  Bell, BellOff, CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) markAsRead(notif.id);
    if (notif.reference_type === "post" && notif.reference_id) {
      navigate("/feed");
    } else if (notif.reference_type === "connection") {
      navigate("/network");
    } else if (notif.actor_id) {
      navigate(`/profile/${notif.actor_id}`);
    }
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AppNavbar />
      <div className="container max-w-2xl mx-auto pt-4 px-4">
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

        {/* Notifications list */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
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
          <div className="space-y-1.5">
            {notifications.map((notif) => {
              const Icon = typeIconMap[notif.type] || Bell;
              const colorClass = typeColorMap[notif.type] || "text-muted-foreground";
              const actorName = notif.actor_profile?.display_name || notif.actor_profile?.full_name || "";

              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left rounded-xl border p-4 flex items-start gap-3 transition-colors hover:bg-muted/50 ${
                    notif.read
                      ? "border-border bg-card"
                      : "border-accent/20 bg-accent/5"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <NetworkAvatar
                      src={notif.actor_profile?.avatar_url}
                      initials={actorName ? getInitials(actorName) : "?"}
                      size="sm"
                    />
                    <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-card border-2 border-card flex items-center justify-center`}>
                      <Icon className={`h-3 w-3 ${colorClass}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${notif.read ? "text-foreground" : "text-foreground font-medium"}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notif.read && (
                    <div className="h-2.5 w-2.5 rounded-full bg-accent shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
