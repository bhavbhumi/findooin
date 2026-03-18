import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminListingsManagement } from "@/components/admin/AdminListingsManagement";

export default function AdminListingsPage() {
  return <AdminRouteGuard permission="manage_moderation"><AdminListingsManagement /></AdminRouteGuard>;
}
