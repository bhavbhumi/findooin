/**
 * usePeopleYouMayKnow — Suggests people based on mutual connections,
 * shared roles, and location proximity. Excludes existing connections.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";


export interface SuggestedUser {
  id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  verification_status: string;
  user_type: string;
  organization: string | null;
  mutual_count: number;
  reason: string;
}

export function usePeopleYouMayKnow(userId: string | null, limit = 8) {
  return useQuery({
    queryKey: ["people-you-may-know", userId],
    enabled: !!userId,
    queryFn: async (): Promise<SuggestedUser[]> => {
      if (!userId) return [];

      // 1. Get my direct connections
      const { data: myConns } = await supabase
        .from("connections")
        .select("from_user_id, to_user_id")
        .eq("connection_type", "connect")
        .eq("status", "accepted")
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

      const connectedIds = new Set<string>();
      connectedIds.add(userId);
      (myConns || []).forEach((c) => {
        connectedIds.add(c.from_user_id === userId ? c.to_user_id : c.from_user_id);
      });

      if (connectedIds.size <= 1) {
        // No connections — suggest verified, recently active users
        const { data: fallback } = await supabase
          .from("profiles")
          .select("id, full_name, display_name, avatar_url, headline, verification_status, user_type, organization")
          .neq("id", userId)
          .eq("onboarding_completed", true)
          .order("created_at", { ascending: false })
          .limit(limit);

        return (fallback || []).map((p) => ({
          ...p,
          mutual_count: 0,
          reason: p.verification_status === "verified" ? "Verified professional" : "New on findoo",
        }));
      }

      const connArray = Array.from(connectedIds).filter((id) => id !== userId);

      // 2. Get connections of my connections (2nd degree)
      const { data: secondDegree } = await supabase
        .from("connections")
        .select("from_user_id, to_user_id")
        .eq("connection_type", "connect")
        .eq("status", "accepted")
        .or(connArray.map((id) => `from_user_id.eq.${id},to_user_id.eq.${id}`).join(","));

      // Count mutual connections for each 2nd-degree user
      const mutualCounts = new Map<string, Set<string>>();
      (secondDegree || []).forEach((c) => {
        const otherIds = [c.from_user_id, c.to_user_id];
        otherIds.forEach((otherId) => {
          if (connectedIds.has(otherId)) return; // Skip already connected
          const viaId = otherIds.find((id) => id !== otherId && connArray.includes(id));
          if (viaId) {
            if (!mutualCounts.has(otherId)) mutualCounts.set(otherId, new Set());
            mutualCounts.get(otherId)!.add(viaId);
          }
        });
      });

      // Sort by mutual count
      const ranked = Array.from(mutualCounts.entries())
        .map(([id, mutuals]) => ({ id, mutual_count: mutuals.size }))
        .sort((a, b) => b.mutual_count - a.mutual_count)
        .slice(0, limit);

      if (ranked.length === 0) return [];

      // 3. Fetch profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, headline, verification_status, user_type, organization")
        .in("id", ranked.map((r) => r.id));

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      return ranked
        .map((r) => {
          const p = profileMap.get(r.id);
          if (!p) return null;
          return {
            ...p,
            mutual_count: r.mutual_count,
            reason: `${r.mutual_count} mutual connection${r.mutual_count > 1 ? "s" : ""}`,
          };
        })
        .filter(Boolean) as SuggestedUser[];
    },
    staleTime: 5 * 60_000,
  });
}
