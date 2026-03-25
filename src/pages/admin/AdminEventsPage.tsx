import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminEventsManagement } from "@/components/admin/AdminEventsManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminEventsPage() {
  return (
    <AdminRouteGuard permission="manage_moderation">
      <AdminModuleWrapper moduleKey="events">
        <AdminEventsManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
