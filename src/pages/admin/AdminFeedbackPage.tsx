import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { FeedbackAdminPanel } from "@/components/feedback/FeedbackAdminPanel";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminFeedbackPage() {
  return (
    <AdminRouteGuard permission="manage_moderation">
      <AdminModuleWrapper moduleKey="feedback">
        <FeedbackAdminPanel />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
