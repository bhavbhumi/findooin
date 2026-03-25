import AdminBillingDashboard from "@/components/admin/AdminBillingDashboard";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminBillingPage() {
  return (
    <AdminModuleWrapper moduleKey="billing">
      <AdminBillingDashboard />
    </AdminModuleWrapper>
  );
}
