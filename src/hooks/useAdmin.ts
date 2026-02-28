/**
 * useAdmin — Admin panel hooks (verification, moderation, user management).
 *
 * Provides 8 exports:
 * - `useIsAdmin()` — role check via `has_role` RPC (cached 60s)
 * - `useVerificationQueue()` — pending/reviewed verification requests
 * - `useReviewVerification()` — approve/reject with profile status update
 * - `useAdminReports()` — content reports with user profiles
 * - `useUpdateReportStatus()` — update report status
 * - `useAdminUsers()` — all users (max 200) with roles
 * - `useDeletePost()` — admin-delete any post
 *
 * All admin queries require the `admin` role via RLS policies.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
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
  });
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  document_url: string;
  document_name: string;
  document_type: string | null;
  regulator: string | null;
  registration_number: string | null;
  notes: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
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

export function useVerificationQueue() {
  return useQuery({
    queryKey: ["admin-verification-queue"],
    queryFn: async (): Promise<VerificationRequest[]> => {
      const { data, error } = await supabase
        .from("verification_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch profiles for each request
      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, organization, user_type, verification_status")
        .in("id", userIds);

      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role, sub_type")
        .in("user_id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      const roleMap: Record<string, any[]> = {};
      (roles || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push({ role: r.role, sub_type: r.sub_type });
      });

      return (data || []).map((r: any) => ({
        ...r,
        profile: profileMap[r.user_id] || null,
        roles: roleMap[r.user_id] || [],
      }));
    },
    staleTime: 10_000,
  });
}

export function useReviewVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, status, adminNotes, userId }: {
      requestId: string;
      status: "approved" | "rejected";
      adminNotes?: string;
      userId: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Update request
      const { error: reqErr } = await supabase
        .from("verification_requests")
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_by: session.user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId);
      if (reqErr) throw reqErr;

      // Update profile verification_status
      const newStatus = status === "approved" ? "verified" : "unverified";
      const { error: profErr } = await supabase
        .from("profiles")
        .update({ verification_status: newStatus })
        .eq("id", userId);
      if (profErr) throw profErr;
    },
    onSuccess: (_, vars) => {
      toast.success(`Verification ${vars.status}`);
      qc.invalidateQueries({ queryKey: ["admin-verification-queue"] });
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
  reporter?: { full_name: string; avatar_url: string | null };
  reported_user?: { full_name: string; avatar_url: string | null };
}

export function useAdminReports() {
  return useQuery({
    queryKey: ["admin-reports"],
    queryFn: async (): Promise<AdminReport[]> => {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set([
        ...(data || []).map((r: any) => r.reporter_id),
        ...(data || []).filter((r: any) => r.reported_user_id).map((r: any) => r.reported_user_id),
      ])];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));

      return (data || []).map((r: any) => ({
        ...r,
        reporter: profileMap[r.reporter_id] || null,
        reported_user: r.reported_user_id ? profileMap[r.reported_user_id] || null : null,
      }));
    },
    staleTime: 10_000,
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
    onSuccess: () => {
      toast.success("Report updated");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;

      const userIds = (profiles || []).map((p: any) => p.id);
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role, sub_type")
        .in("user_id", userIds);

      const roleMap: Record<string, any[]> = {};
      (roles || []).forEach((r: any) => {
        if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
        roleMap[r.user_id].push(r);
      });

      return (profiles || []).map((p: any) => ({
        ...p,
        roles: roleMap[p.id] || [],
      }));
    },
    staleTime: 10_000,
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post deleted");
      qc.invalidateQueries({ queryKey: ["admin-reports"] });
      qc.invalidateQueries({ queryKey: ["feed-posts"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}
