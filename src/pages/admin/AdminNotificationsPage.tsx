import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminNotificationsManagement } from "@/components/admin/AdminNotificationsManagement";

export default function AdminNotificationsPage() {
  return <AdminRouteGuard permission="manage_notifications"><AdminNotificationsManagement /></AdminRouteGuard>;
}
