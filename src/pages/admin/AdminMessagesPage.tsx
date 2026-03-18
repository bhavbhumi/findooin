import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminMessagesManagement } from "@/components/admin/AdminMessagesManagement";

export default function AdminMessagesPage() {
  return <AdminRouteGuard permission="manage_moderation"><AdminMessagesManagement /></AdminRouteGuard>;
}
