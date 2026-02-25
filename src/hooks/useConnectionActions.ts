import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    const { data } = await supabase
      .from("connections")
      .select("*")
      .or(`and(from_user_id.eq.${currentUserId},to_user_id.eq.${targetUserId}),and(from_user_id.eq.${targetUserId},to_user_id.eq.${currentUserId})`);

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
  };

  const follow = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    setLoading(true);
    await supabase.from("connections").insert({
      from_user_id: currentUserId,
      to_user_id: targetUserId,
      connection_type: "follow",
      status: "accepted",
    });
    setConnectionStatus((s) => ({ ...s, following: true }));
    setLoading(false);
  }, [currentUserId, targetUserId]);

  const connect = useCallback(async () => {
    if (!currentUserId || !targetUserId) return;
    setLoading(true);
    await supabase.from("connections").insert({
      from_user_id: currentUserId,
      to_user_id: targetUserId,
      connection_type: "connect",
      status: "pending",
    });
    setConnectionStatus((s) => ({ ...s, connected: "pending" }));
    setLoading(false);
  }, [currentUserId, targetUserId]);

  return { connectionStatus, follow, connect, loading };
}
