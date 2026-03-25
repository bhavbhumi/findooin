import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminModuleAudit } from "@/components/admin/AdminModuleAudit";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminModuleAuditPage() {
  return (
    <AdminRouteGuard permission="view_module_audit">
      <AdminModuleWrapper moduleKey="moduleAudit">
        <AdminModuleAudit />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
