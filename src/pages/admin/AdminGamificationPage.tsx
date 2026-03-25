import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminGamificationManagement } from "@/components/admin/AdminGamificationManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminGamificationPage() {
  return (
    <AdminRouteGuard permission="manage_moderation">
      <AdminModuleWrapper moduleKey="gamification">
        <AdminGamificationManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
