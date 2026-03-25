import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminMessagesManagement } from "@/components/admin/AdminMessagesManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminMessagesPage() {
  return (
    <AdminRouteGuard permission="manage_moderation">
      <AdminModuleWrapper moduleKey="messages">
        <AdminMessagesManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
