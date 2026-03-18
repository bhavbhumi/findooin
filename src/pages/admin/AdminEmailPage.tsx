import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminEmailDashboard } from "@/components/admin/AdminEmailDashboard";

export default function AdminEmailPage() {
  return <AdminRouteGuard permission="manage_email"><AdminEmailDashboard /></AdminRouteGuard>;
}
