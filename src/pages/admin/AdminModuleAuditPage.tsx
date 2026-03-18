import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminModuleAudit } from "@/components/admin/AdminModuleAudit";

export default function AdminModuleAuditPage() {
  return <AdminRouteGuard permission="view_module_audit"><AdminModuleAudit /></AdminRouteGuard>;
}
