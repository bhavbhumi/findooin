import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { InvitationsPipeline } from "@/components/admin/invitations/InvitationsPipeline";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminInvitationsPage() {
  return (
    <AdminRouteGuard permission="manage_invitations">
      <AdminModuleWrapper moduleKey="invitations">
        <InvitationsPipeline />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
