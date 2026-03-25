import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminFeedManagement } from "@/components/admin/AdminFeedManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminFeedPage() {
  return (
    <AdminRouteGuard permission="manage_moderation">
      <AdminModuleWrapper moduleKey="feed">
        <AdminFeedManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
