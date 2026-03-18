import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";

export default function AdminAuditPage() {
  return <AdminRouteGuard permission="view_audit"><AdminAuditLog /></AdminRouteGuard>;
}
