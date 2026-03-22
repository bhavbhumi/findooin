import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface UserXP {
  total_xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  post_streak: number;
  streak_multiplier: number;
}

export interface BadgeDefinition {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon_name: string;
  category: string;
  tier: string;
  xp_reward: number;
  criteria_value: number;
  sort_order: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  earned_at: string;
  is_pinned: boolean;
  badge: BadgeDefinition;
}

export interface LeaderboardEntry {
  user_id: string;
  total_xp: number;
  level: number;
  current_streak: number;
  profile: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    verification_status: string;
  };
}

export function useUserXP(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userXP(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_xp")
        .select("total_xp, level, current_streak, longest_streak, post_streak, streak_multiplier")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as UserXP) || { total_xp: 0, level: 1, current_streak: 0, longest_streak: 0, post_streak: 0, streak_multiplier: 1.0 };
    },
  });
}

export function useUserBadges(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userBadges(userId),
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("id, badge_id, earned_at, is_pinned, badge_definitions(id, slug, name, description, icon_name, category, tier, xp_reward, criteria_value, sort_order)")
        .eq("user_id", userId!)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((d: any) => ({
        id: d.id,
        badge_id: d.badge_id,
        earned_at: d.earned_at,
        is_pinned: d.is_pinned,
        badge: d.badge_definitions,
      })) as UserBadge[];
    },
  });
}

export function useBadgeDefinitions() {
  return useQuery({
    queryKey: QUERY_KEYS.badgeDefinitions(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badge_definitions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as BadgeDefinition[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useLeaderboard(limit = 20) {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboard(limit),
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_leaderboard", { p_limit: limit, p_offset: 0 });
      if (error) throw error;
      return (data as unknown as LeaderboardEntry[]) || [];
    },
  });
}

export function useWeeklyChallenges(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.weeklyChallenges(userId),
    enabled: !!userId,
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data: challenges, error: cErr } = await supabase
        .from("weekly_challenges")
        .select("*")
        .eq("is_active", true)
        .lte("starts_at", now)
        .gte("ends_at", now);
      if (cErr) throw cErr;

      const { data: progress, error: pErr } = await supabase
        .from("user_challenge_progress")
        .select("*")
        .eq("user_id", userId!);
      if (pErr) throw pErr;

      return (challenges || []).map((c: any) => {
        const p = (progress || []).find((p: any) => p.challenge_id === c.id);
        return {
          ...c,
          current_count: p?.current_count || 0,
          completed_at: p?.completed_at || null,
        };
      });
    },
  });
}

/** Update login streak on mount (call once in AppLayout) */
export function useLoginStreak() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        Promise.resolve(supabase.rpc("update_login_streak", { p_user_id: session.user.id })).catch(() => {});
      }
    });
  }, []);
}
