import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminFeedManagement } from "@/components/admin/AdminFeedManagement";

export default function AdminFeedPage() {
  return <AdminRouteGuard permission="manage_moderation"><AdminFeedManagement /></AdminRouteGuard>;
}
