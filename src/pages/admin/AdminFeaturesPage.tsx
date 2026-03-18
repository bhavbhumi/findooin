import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminFeatureFlags } from "@/components/admin/AdminFeatureFlags";

export default function AdminFeaturesPage() {
  return <AdminRouteGuard permission="manage_features"><AdminFeatureFlags /></AdminRouteGuard>;
}
