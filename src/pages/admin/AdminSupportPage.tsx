import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminSupportDashboard } from "@/components/admin/AdminSupportDashboard";

export default function AdminSupportPage() {
  return <AdminRouteGuard permission="manage_support"><AdminSupportDashboard /></AdminRouteGuard>;
}
