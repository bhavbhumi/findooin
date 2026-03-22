/**
 * useAdminUsers — User management hooks for admin panel.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ADMIN_CACHE } from "./useAdminShared";

export function useAdminUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.adminUsers(),
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, organization, user_type, verification_status, is_staff, onboarding_completed, created_at, location")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      const userIds = (profiles || []).map((p: any) => p.id);
      if (userIds.length === 0) return [];

      const [rolesRes, activityRes, seedIdsRes] = await Promise.all([
        supabase
          .from("user_roles")
          .select("user_id, role, sub_type")
          .in("user_id", userIds),
        supabase.rpc("get_users_activity_status", { p_user_ids: userIds }),
        supabase.rpc("get_seed_user_ids"),
      ]);

      const roleMap: Record<string, any[]> = {};
      (rolesRes.data || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r);
      });

      const activityMap: Record<string, { status: string; last_active_at: string; days_inactive: number }> = {};
      ((activityRes.data as any[]) || []).forEach((a: any) => {
        activityMap[a.user_id] = { status: a.status, last_active_at: a.last_active_at, days_inactive: Number(a.days_inactive) };
      });

      const seedUserIds = new Set<string>((seedIdsRes.data as string[]) || []);

      return (profiles || []).map((p: any) => ({
        ...p,
        roles: roleMap[p.id] || [],
        activity: activityMap[p.id] || { status: "dormant", last_active_at: p.created_at, days_inactive: 999 },
        is_seed: seedUserIds.has(p.id),
      }));
    },
    ...ADMIN_CACHE,
  });
}
