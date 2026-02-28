import { AdminComingSoon } from "@/components/admin/AdminComingSoon";

export default function AdminInvitationsPage() {
  return (
    <AdminComingSoon
      title="Invitations Pipeline"
      description="Manage outreach invitations to issuers and intermediaries with automated reminder cycles."
      features={[
        "Import leads from Registry or manual entry",
        "7-reminder lifecycle with smart scheduling",
        "3-month archive cooldown with auto-reactivation",
        "Auto-detect joined users and stop outreach",
        "Bulk invite from AMFI/SEBI registry data",
        "Conversion tracking and funnel analytics",
      ]}
    />
  );
}
