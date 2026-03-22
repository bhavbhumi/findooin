/**
 * useUserActivityStatus — Check a user's activity status (not admin-specific).
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useUserActivityStatus(userId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.userActivityStatus(userId),
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase.rpc("compute_user_activity_status", { p_user_id: userId });
      if (error) throw error;
      return data as { status: string; last_active_at: string; days_inactive: number };
    },
    enabled: !!userId,
    staleTime: 120_000,
    gcTime: 300_000,
  });
}
