import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminNotificationsManagement } from "@/components/admin/AdminNotificationsManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminNotificationsPage() {
  return (
    <AdminRouteGuard permission="manage_notifications">
      <AdminModuleWrapper moduleKey="notifications">
        <AdminNotificationsManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
