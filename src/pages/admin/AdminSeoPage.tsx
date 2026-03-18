import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminSeoAudit } from "@/components/admin/AdminSeoAudit";

export default function AdminSeoPage() {
  return <AdminRouteGuard permission="view_seo"><AdminSeoAudit /></AdminRouteGuard>;
}
