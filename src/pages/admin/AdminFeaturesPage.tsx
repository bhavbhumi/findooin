import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminFeatureFlags } from "@/components/admin/AdminFeatureFlags";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminFeaturesPage() {
  return (
    <AdminRouteGuard permission="manage_features">
      <AdminModuleWrapper moduleKey="featureFlags">
        <AdminFeatureFlags />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
