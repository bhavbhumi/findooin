import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminMonitoring } from "@/components/admin/AdminMonitoring";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminMonitoringPage() {
  return (
    <AdminRouteGuard permission="view_monitoring">
      <AdminModuleWrapper moduleKey="monitoring">
        <AdminMonitoring />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
