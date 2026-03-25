import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminJobsManagement } from "@/components/admin/AdminJobsManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminJobsPage() {
  return (
    <AdminRouteGuard permission="manage_moderation">
      <AdminModuleWrapper moduleKey="jobs">
        <AdminJobsManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
