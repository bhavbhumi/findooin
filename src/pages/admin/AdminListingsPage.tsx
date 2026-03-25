import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminListingsManagement } from "@/components/admin/AdminListingsManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminListingsPage() {
  return (
    <AdminRouteGuard permission="manage_moderation">
      <AdminModuleWrapper moduleKey="listings">
        <AdminListingsManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
