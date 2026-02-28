/**
 * useConnectionActions — Follow/Connect/Disconnect hook with error feedback.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ConnectionStatus {
  following: boolean;
  connected: "none" | "pending" | "accepted";
}

export function useConnectionActions(currentUserId: string | null, targetUserId: string | null) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    following: false,
    connected: "none",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return;
    loadStatus();
  }, [currentUserId, targetUserId]);

  const loadStatus = async () => {
    if (!currentUserId || !targetUserId) return;
    try {
      const { data, error } = await supabase
        .from("connections")
        .select("*")
        .or(`and(from_user_id.eq.${currentUserId},to_user_id.eq.${targetUserId}),and(from_user_id.eq.${targetUserId},to_user_id.eq.${currentUserId})`);

      if (error) throw error;

      let following = false;
      let connected: "none" | "pending" | "accepted" = "none";

      data?.forEach((c) => {
        if (c.connection_type === "follow" && c.from_user_id === currentUserId) {
          following = true;
        }
        if (c.connection_type === "connect") {
          connected = c.status as "pending" | "accepted";
        }
      });

      setConnectionStatus({ following, connected });
    } catch (err: any) {
      console.error("Failed to load connection status:", err);
    }
  };

  const follow = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("connections").insert({
        from_user_id: currentUserId,
        to_user_id: targetUserId,
        connection_type: "follow",
        status: "accepted",
      });
      if (error) throw error;
      setConnectionStatus((s) => ({ ...s, following: true }));
      toast.success("Following!");
    } catch (err: any) {
      toast.error("Failed to follow", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }, [currentUserId, targetUserId]);

  const unfollow = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("from_user_id", currentUserId)
        .eq("to_user_id", targetUserId)
        .eq("connection_type", "follow");
      if (error) throw error;
      setConnectionStatus((s) => ({ ...s, following: false }));
      toast.success("Unfollowed");
    } catch (err: any) {
      toast.error("Failed to unfollow", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }, [currentUserId, targetUserId]);

  const connect = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("connections").insert({
        from_user_id: currentUserId,
        to_user_id: targetUserId,
        connection_type: "connect",
        status: "pending",
      });
      if (error) throw error;
      setConnectionStatus((s) => ({ ...s, connected: "pending" }));
      toast.success("Connection request sent");
    } catch (err: any) {
      if (err?.message?.includes("duplicate")) {
        toast.error("Connection request already exists");
      } else {
        toast.error("Failed to send request", { description: err?.message });
      }
    } finally {
      setLoading(false);
    }
  }, [currentUserId, targetUserId]);

  const disconnect = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("connections")
        .delete()
        .eq("connection_type", "connect")
        .or(`and(from_user_id.eq.${currentUserId},to_user_id.eq.${targetUserId}),and(from_user_id.eq.${targetUserId},to_user_id.eq.${currentUserId})`);
      if (error) throw error;
      setConnectionStatus((s) => ({ ...s, connected: "none" }));
      toast.success("Disconnected");
    } catch (err: any) {
      toast.error("Failed to disconnect", { description: err?.message });
    } finally {
      setLoading(false);
    }
  }, [currentUserId, targetUserId]);

  return { connectionStatus, follow, unfollow, connect, disconnect, loading };
}
