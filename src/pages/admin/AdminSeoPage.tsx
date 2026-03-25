import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminSeoAudit } from "@/components/admin/AdminSeoAudit";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminSeoPage() {
  return (
    <AdminRouteGuard permission="view_seo">
      <AdminModuleWrapper moduleKey="seo">
        <AdminSeoAudit />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
