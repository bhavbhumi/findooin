import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminPremiumFeatures } from "@/components/admin/AdminPremiumFeatures";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminPremiumFeaturesPage() {
  return (
    <AdminRouteGuard permission="manage_billing">
      <AdminModuleWrapper moduleKey="premiumFeatures">
        <AdminPremiumFeatures />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
