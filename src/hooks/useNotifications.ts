import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
  message: string;
  read: boolean;
  created_at: string;
  actor_profile?: {
    display_name: string | null;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUserId(session.user.id);
        loadNotifications(session.user.id);
        loadUnreadCount(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  // Realtime subscription for new notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((c) => c + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadNotifications = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Failed to load notifications");
      setLoading(false);
      return;
    }
    if (data) {
      // Fetch actor profiles
      const actorIds = [...new Set(data.map((n: any) => n.actor_id).filter(Boolean))];
      let profilesMap: Record<string, any> = {};
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, display_name, full_name, avatar_url")
          .in("id", actorIds);
        profiles?.forEach((p: any) => { profilesMap[p.id] = p; });
      }

      setNotifications(
        data.map((n: any) => ({
          ...n,
          actor_profile: n.actor_id ? profilesMap[n.actor_id] || null : null,
        }))
      );
    }
    setLoading(false);
  };

  const loadUnreadCount = async (uid: string) => {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", uid)
      .eq("read", false);
    setUnreadCount(count || 0);
  };

  const markAsRead = useCallback(async (notifId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [userId]);

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead };
}
