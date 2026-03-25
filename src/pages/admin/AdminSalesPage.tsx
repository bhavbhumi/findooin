import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminSalesManagement } from "@/components/admin/AdminSalesManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminSalesPage() {
  return (
    <AdminRouteGuard permission="manage_sales">
      <AdminModuleWrapper moduleKey="sales">
        <AdminSalesManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
