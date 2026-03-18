import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { InvitationsPipeline } from "@/components/admin/invitations/InvitationsPipeline";

export default function AdminInvitationsPage() {
  return <AdminRouteGuard permission="manage_invitations"><InvitationsPipeline /></AdminRouteGuard>;
}
