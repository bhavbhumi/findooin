/**
 * useAdmin — Backward-compatible re-export barrel.
 * 
 * All logic has been split into domain-specific hooks:
 * - useAdminShared (constants, logAdminAction)
 * - useAdminVerification (queue, review)
 * - useAdminModeration (reports, delete post)
 * - useAdminUsers (user management)
 * - useUserActivityStatus (non-admin activity check)
 *
 * Import directly from the domain hooks for new code.
 */

export { useVerificationQueue, useReviewVerification } from "./useAdminVerification";
export type { VerificationRequest } from "./useAdminVerification";

export { useAdminReports, useUpdateReportStatus, useDeletePost } from "./useAdminModeration";
export type { AdminReport } from "./useAdminModeration";

export { useAdminUsers } from "./useAdminUsers";

export { useUserActivityStatus } from "./useUserActivityStatus";

// Re-export useIsAdmin from here for backward compat
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

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
