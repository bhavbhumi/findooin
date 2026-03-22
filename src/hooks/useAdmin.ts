/**
 * useAdmin — Admin panel hooks (verification, moderation, user management).
 *
 * Provides 8 exports:
 * - `useIsAdmin()` — role check via `has_role` RPC (cached 60s)
 * - `useVerificationQueue()` — pending/reviewed verification requests (date-bounded)
 * - `useReviewVerification()` — approve/reject with profile status update
 * - `useAdminReports()` — content reports with user profiles (date-bounded)
 * - `useUpdateReportStatus()` — update report status
 * - `useAdminUsers()` — all users (max 200) with roles
 * - `useDeletePost()` — admin-delete any post
 *
 * All admin queries require the `admin` role via RLS policies.
 *
 * Caching strategy:
 * - staleTime: 60s — admin data is not real-time critical
 * - gcTime: 10min — free memory after leaving admin panel
 * - Row limits + date filters — prevent unbounded growth
 * - Minimal column selection — reduce payload size
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { subDays } from "date-fns";
import { QUERY_KEYS } from "@/lib/query-keys";

/** Shared cache config for admin queries */
const ADMIN_CACHE = { staleTime: 60_000, gcTime: 600_000 } as const;

/** Fire-and-forget audit log insert */
async function logAdminAction(action: string, resourceType: string, resourceId?: string, metadata?: Record<string, any>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  supabase.from("audit_logs").insert({
    user_id: session.user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId || null,
    metadata: metadata || {},
  }).then(() => {});
}

export function useIsAdmin() {
  return useQuery({
    queryKey: QUERY_KEYS.isAdmin(),
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return false;
      const { data } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      return !!data;
    },
    staleTime: 60_000,
    gcTime: 300_000,
  });
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  document_url: string;
  document_name: string;
  registration_number?: string;
  regulator?: string;
  notes?: string;
  status: string;
  admin_notes?: string;
  created_at: string;
  profile?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    organization: string | null;
    user_type: string;
    verification_status: string;
  };
  roles?: { role: string; sub_type: string | null }[];
}

/**
 * Fetches verification requests. 
 * - includeArchived=false (default): only last 90 days
 * - includeArchived=true: all records
 * Always fetches ALL pending regardless of date.
 */
export function useVerificationQueue(includeArchived = false) {
  return useQuery({
    queryKey: QUERY_KEYS.adminVerificationQueue(includeArchived),
    queryFn: async (): Promise<VerificationRequest[]> => {
      let query = supabase
        .from("verification_requests")
        .select("id, user_id, document_url, document_name, registration_number, regulator, notes, status, admin_notes, created_at")
        .order("created_at", { ascending: false });

      if (!includeArchived) {
        const cutoff = subDays(new Date(), 90).toISOString();
        // Fetch pending (any date) + recent resolved
        query = query.or(`status.eq.pending,created_at.gte.${cutoff}`);
      }

      query = query.limit(500);

      const { data, error } = await query;
      if (error) throw error;

      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      if (userIds.length === 0) return [];

      const [profilesRes, rolesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, display_name, avatar_url, organization, user_type, verification_status")
          .in("id", userIds),
        supabase
          .from("user_roles")
          .select("user_id, role, sub_type")
          .in("user_id", userIds),
      ]);

      const profileMap = Object.fromEntries((profilesRes.data || []).map((p: any) => [p.id, p]));
      const roleMap: Record<string, any[]> = {};
      (rolesRes.data || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push({ role: r.role, sub_type: r.sub_type });
      });

      return (data || []).map((r: any) => ({
        ...r,
        profile: profileMap[r.user_id] || null,
        roles: roleMap[r.user_id] || [],
      }));
    },
    ...ADMIN_CACHE,
  });
}

export function useReviewVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      requestId,
      status,
      adminNotes,
      userId,
    }: {
      requestId: string;
      status: "approved" | "rejected";
      adminNotes: string;
      userId: string;
    }) => {
      // Get current admin's ID for audit trail
      const { data: { session } } = await supabase.auth.getSession();
      const reviewerId = session?.user?.id || null;

      const { error: reqError } = await supabase
        .from("verification_requests")
        .update({
          status,
          admin_notes: adminNotes,
          reviewed_by: reviewerId,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);
      if (reqError) throw reqError;

      const newVerificationStatus = status === "approved" ? "verified" : "unverified";
      const { error: profError } = await supabase
        .from("profiles")
        .update({ verification_status: newVerificationStatus })
        .eq("id", userId);
      if (profError) throw profError;
    },
    onSuccess: (_, vars) => {
      toast.success(`Verification ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin-verification-queue"] });
      logAdminAction("verification_review", "verification_request", vars.requestId, {
        decision: vars.status,
        user_id: vars.userId,
      });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

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

/**
 * Fetches reports.
 * - includeArchived=false (default): pending + last 90 days resolved
 * - includeArchived=true: all records (capped at 500)
 */
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

      // Parallel fetch: profiles, roles, posts
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

/** Hook to check a single user's activity status (for messaging, jobs, etc.) */
export function useUserActivityStatus(userId: string | null) {
  return useQuery({
    queryKey: ["user-activity-status", userId],
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