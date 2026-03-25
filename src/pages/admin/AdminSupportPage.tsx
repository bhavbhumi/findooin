import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminSupportDashboard } from "@/components/admin/AdminSupportDashboard";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminSupportPage() {
  return (
    <AdminRouteGuard permission="manage_support">
      <AdminModuleWrapper moduleKey="support">
        <AdminSupportDashboard />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
