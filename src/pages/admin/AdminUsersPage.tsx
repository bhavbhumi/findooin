import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminUsersPage() {
  return (
    <AdminRouteGuard permission="manage_users">
      <AdminModuleWrapper moduleKey="users">
        <AdminUserManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
