import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminAuditPage() {
  return (
    <AdminRouteGuard permission="view_audit">
      <AdminModuleWrapper moduleKey="audit">
        <AdminAuditLog />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
