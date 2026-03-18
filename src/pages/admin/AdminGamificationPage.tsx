import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminGamificationManagement } from "@/components/admin/AdminGamificationManagement";

export default function AdminGamificationPage() {
  return <AdminRouteGuard permission="manage_moderation"><AdminGamificationManagement /></AdminRouteGuard>;
}
