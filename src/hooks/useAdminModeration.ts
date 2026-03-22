/**
 * useAdminModeration — Report management & post deletion hooks for admin panel.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { subDays } from "date-fns";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ADMIN_CACHE, logAdminAction } from "./useAdminShared";

export interface AdminReport {
  id: string;
  reporter_id: string;
  post_id: string | null;
  reported_user_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter?: { full_name: string; avatar_url: string | null; roles?: string[] };
  reported_user?: { full_name: string; avatar_url: string | null; user_type?: string; verification_status?: string; organization?: string | null; roles?: string[] };
  post?: { content: string; created_at: string; post_type?: string; hashtags?: string[] } | null;
}

export function useAdminReports(includeArchived = false) {
  return useQuery({
    queryKey: QUERY_KEYS.adminReports(includeArchived),
    queryFn: async (): Promise<AdminReport[]> => {
      let query = supabase
        .from("reports")
        .select("id, reporter_id, post_id, reported_user_id, reason, description, status, created_at")
        .order("created_at", { ascending: false });

      if (!includeArchived) {
        const cutoff = subDays(new Date(), 90).toISOString();
        query = query.or(`status.eq.pending,created_at.gte.${cutoff}`);
      }

      query = query.limit(500);

      const { data, error } = await query;
      if (error) throw error;
      if (!data?.length) return [];

      const userIds = [...new Set([
        ...data.map((r: any) => r.reporter_id),
        ...data.filter((r: any) => r.reported_user_id).map((r: any) => r.reported_user_id),
      ])];

      const postIds = [...new Set(data.filter((r: any) => r.post_id).map((r: any) => r.post_id))];

      const [profilesRes, rolesRes, postsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url, user_type, verification_status, organization")
          .in("id", userIds),
        supabase
          .from("user_roles")
          .select("user_id, role")
          .in("user_id", userIds),
        postIds.length > 0
          ? supabase.from("posts").select("id, content, created_at, post_type, hashtags").in("id", postIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = Object.fromEntries((profilesRes.data || []).map((p: any) => [p.id, p]));
      const roleMap: Record<string, string[]> = {};
      (rolesRes.data || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r.role);
      });
      const postMap = Object.fromEntries(((postsRes as any).data || []).map((p: any) => [p.id, p]));

      return data.map((r: any) => ({
        ...r,
        reporter: profileMap[r.reporter_id] ? { ...profileMap[r.reporter_id], roles: roleMap[r.reporter_id] || [] } : null,
        reported_user: r.reported_user_id && profileMap[r.reported_user_id] ? { ...profileMap[r.reported_user_id], roles: roleMap[r.reported_user_id] || [] } : null,
        post: r.post_id ? postMap[r.post_id] || null : null,
      }));
    },
    ...ADMIN_CACHE,
  });
}

export function useUpdateReportStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const { error } = await supabase
        .from("reports")
        .update({ status })
        .eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success("Report updated");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      logAdminAction("report_status_change", "report", vars.reportId, { new_status: vars.status });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: (_, postId) => {
      toast.success("Post deleted");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
      logAdminAction("post_deletion", "post", postId);
    },
    onError: (err: any) => toast.error(err.message),
  });
}
