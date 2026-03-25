import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminCampaignsManagement } from "@/components/admin/AdminCampaignsManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminCampaignsPage() {
  return (
    <AdminRouteGuard permission="manage_campaigns">
      <AdminModuleWrapper moduleKey="campaigns">
        <AdminCampaignsManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
