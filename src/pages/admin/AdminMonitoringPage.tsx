import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminMonitoring } from "@/components/admin/AdminMonitoring";

export default function AdminMonitoringPage() {
  return <AdminRouteGuard permission="view_monitoring"><AdminMonitoring /></AdminRouteGuard>;
}
