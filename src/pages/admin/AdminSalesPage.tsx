import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminSalesManagement } from "@/components/admin/AdminSalesManagement";

export default function AdminSalesPage() {
  return <AdminRouteGuard permission="manage_sales"><AdminSalesManagement /></AdminRouteGuard>;
}
