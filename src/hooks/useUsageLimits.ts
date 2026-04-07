/**
 * useUsageLimits — Tracks daily/monthly usage against plan limits.
 * Returns current usage counts for gating features with soft upgrade nudges.
 * 
 * Free tier limits (per month unless noted):
 * - Profile views: 30/mo
 * - Connection requests: 10/mo
 * - Discovery refreshes: 3/day
 * - Posts: 10/mo
 * - Messages: 50/mo
 * - Vault storage: 100MB
 * 
 * Pro tier:
 * - Profile views: 200/mo
 * - Connection requests: 100/mo
 * - Discovery refreshes: unlimited
 * - Posts: 100/mo
 * - Messages: 500/mo
 * - Vault storage: 5GB
 * 
 * Enterprise:
 * - Everything unlimited
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription, type PlanTier } from "./useSubscription";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface UsageLimits {
  profileViews: { used: number; limit: number };
  connectionRequests: { used: number; limit: number };
  postsCreated: { used: number; limit: number };
  messagesSent: { used: number; limit: number };
}

const TIER_LIMITS: Record<PlanTier, Record<string, number>> = {
  free: {
    profile_views: 30,
    connection_requests: 10,
    posts: 10,
    messages: 50,
  },
  pro: {
    profile_views: 200,
    connection_requests: 100,
    posts: 100,
    messages: 500,
  },
  enterprise: {
    profile_views: 0, // 0 = unlimited
    connection_requests: 0,
    posts: 0,
    messages: 0,
  },
};

export function useUsageLimits(userId: string | null) {
  const { tier } = useSubscription();
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;

  const { data: usage, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.subscription(userId ?? undefined), "usage", tier],
    enabled: !!userId,
    queryFn: async () => {
      if (!userId) return null;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const since = thirtyDaysAgo.toISOString();

      const [profileViewsRes, connReqRes, postsRes, msgsRes] = await Promise.all([
        supabase
          .from("profile_views")
          .select("id", { count: "exact", head: true })
          .eq("viewer_id", userId)
          .gte("viewed_at", since),
        supabase
          .from("connections")
          .select("id", { count: "exact", head: true })
          .eq("from_user_id", userId)
          .eq("connection_type", "connect")
          .gte("created_at", since),
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", userId)
          .gte("created_at", since),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("sender_id", userId)
          .gte("created_at", since),
      ]);

      return {
        profileViews: profileViewsRes.count ?? 0,
        connectionRequests: connReqRes.count ?? 0,
        postsCreated: postsRes.count ?? 0,
        messagesSent: msgsRes.count ?? 0,
      };
    },
    staleTime: 2 * 60_000,
  });

  return {
    isLoading,
    tier,
    usage: {
      profileViews: { used: usage?.profileViews ?? 0, limit: limits.profile_views },
      connectionRequests: { used: usage?.connectionRequests ?? 0, limit: limits.connection_requests },
      postsCreated: { used: usage?.postsCreated ?? 0, limit: limits.posts },
      messagesSent: { used: usage?.messagesSent ?? 0, limit: limits.messages },
    } satisfies UsageLimits,
    isAtLimit: (key: keyof UsageLimits) => {
      const l = limits[key === "profileViews" ? "profile_views" : key === "connectionRequests" ? "connection_requests" : key === "postsCreated" ? "posts" : "messages"];
      if (l === 0) return false; // unlimited
      const u = key === "profileViews" ? (usage?.profileViews ?? 0)
        : key === "connectionRequests" ? (usage?.connectionRequests ?? 0)
        : key === "postsCreated" ? (usage?.postsCreated ?? 0)
        : (usage?.messagesSent ?? 0);
      return u >= l;
    },
  };
}
