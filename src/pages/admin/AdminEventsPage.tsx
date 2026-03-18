import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminEventsManagement } from "@/components/admin/AdminEventsManagement";

export default function AdminEventsPage() {
  return <AdminRouteGuard permission="manage_moderation"><AdminEventsManagement /></AdminRouteGuard>;
}
