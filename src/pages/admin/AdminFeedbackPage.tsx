import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { FeedbackAdminPanel } from "@/components/feedback/FeedbackAdminPanel";

export default function AdminFeedbackPage() {
  return (
    <AdminRouteGuard permission="manage_moderation">
      <FeedbackAdminPanel />
    </AdminRouteGuard>
  );
}
