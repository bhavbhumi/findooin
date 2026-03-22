/**
 * useAdminVerification — Verification queue & review hooks for admin panel.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { subDays } from "date-fns";
import { QUERY_KEYS } from "@/lib/query-keys";
import { ADMIN_CACHE, logAdminAction } from "./useAdminShared";

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
