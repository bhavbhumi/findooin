import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminEmailDashboard } from "@/components/admin/AdminEmailDashboard";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminEmailPage() {
  return (
    <AdminRouteGuard permission="manage_email">
      <AdminModuleWrapper moduleKey="email">
        <AdminEmailDashboard />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
