import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";

export default function AdminUsersPage() {
  return <AdminRouteGuard permission="manage_users"><AdminUserManagement /></AdminRouteGuard>;
}
