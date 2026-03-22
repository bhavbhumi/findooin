/**
 * useStaffPermissions — Fetches and caches the current user's staff permissions.
 *
 * Uses the `get_staff_permissions` RPC which:
 * - Returns ALL permissions for admins (implicit)
 * - Returns explicitly granted permissions for moderators/staff
 * - Returns empty array for non-staff users
 *
 * Provides `hasPermission(perm)` helper for inline checks.
 * Cached for 60s to avoid redundant calls.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

export type StaffPermission =
  | "manage_users"
  | "manage_verification"
  | "manage_moderation"
  | "view_audit"
  | "manage_invitations"
  | "manage_registry"
  | "manage_sales"
  | "manage_campaigns"
  | "manage_blog"
  | "manage_support"
  | "manage_kb"
  | "view_monitoring"
  | "view_scorecard"
  | "view_module_audit"
  | "view_seo"
  | "manage_email"
  | "view_patent"
  | "view_cost_report"
  | "view_scaling_report"
  | "manage_billing"
  | "manage_notifications"
  | "manage_features";

/** All defined permissions for admin UI reference */
export const ALL_PERMISSIONS: { value: StaffPermission; label: string; group: string }[] = [
  { value: "manage_users", label: "Manage Users", group: "Operations" },
  { value: "manage_verification", label: "Manage Verification", group: "Operations" },
  { value: "manage_moderation", label: "Manage Moderation", group: "Operations" },
  { value: "view_audit", label: "View Audit Log", group: "Operations" },
  { value: "manage_invitations", label: "Manage Invitations", group: "Growth" },
  { value: "manage_registry", label: "Manage Registry", group: "Growth" },
  { value: "manage_sales", label: "Manage Sales", group: "Growth" },
  { value: "manage_campaigns", label: "Manage Campaigns", group: "Growth" },
  { value: "view_cost_report", label: "View Cost Report", group: "Growth" },
  { value: "view_scaling_report", label: "View Scaling Report", group: "Growth" },
  { value: "manage_blog", label: "Manage Blog", group: "Content" },
  { value: "manage_support", label: "Manage Support Tickets", group: "Support" },
  { value: "manage_kb", label: "Manage Knowledge Base", group: "Support" },
  { value: "view_monitoring", label: "View Monitoring", group: "Infrastructure" },
  { value: "view_scorecard", label: "View Scorecard", group: "Infrastructure" },
  { value: "view_module_audit", label: "View Module Audit", group: "Infrastructure" },
  { value: "view_seo", label: "View SEO Audit", group: "Infrastructure" },
  { value: "manage_email", label: "Manage Email", group: "Communications" },
  { value: "view_patent", label: "View Patent", group: "Platform" },
  { value: "manage_billing", label: "Manage Billing", group: "Coming Soon" },
  { value: "manage_notifications", label: "Manage Notifications", group: "Coming Soon" },
  { value: "manage_features", label: "Manage Feature Flags", group: "Coming Soon" },
];

export function useStaffPermissions() {
  const query = useQuery({
    queryKey: QUERY_KEYS.staffPermissions(),
    queryFn: async (): Promise<StaffPermission[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase.rpc("get_staff_permissions", {
        _user_id: session.user.id,
      });

      if (error) {
        console.error("Failed to fetch staff permissions:", error);
        return [];
      }

      return (data as StaffPermission[]) || [];
    },
    staleTime: 60_000,
  });

  const permissions = query.data || [];

  const hasPermission = (perm: StaffPermission): boolean =>
    permissions.includes(perm);

  const isStaff = permissions.length > 0;

  return {
    ...query,
    permissions,
    hasPermission,
    isStaff,
  };
}
