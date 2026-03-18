import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminJobsManagement } from "@/components/admin/AdminJobsManagement";

export default function AdminJobsPage() {
  return <AdminRouteGuard permission="manage_moderation"><AdminJobsManagement /></AdminRouteGuard>;
}
