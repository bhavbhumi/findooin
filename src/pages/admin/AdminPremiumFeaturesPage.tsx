import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminPremiumFeatures } from "@/components/admin/AdminPremiumFeatures";

export default function AdminPremiumFeaturesPage() {
  return <AdminRouteGuard permission="manage_billing"><AdminPremiumFeatures /></AdminRouteGuard>;
}
