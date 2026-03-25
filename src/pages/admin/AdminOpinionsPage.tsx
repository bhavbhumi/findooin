import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminOpinionsManagement } from "@/components/admin/AdminOpinionsManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminOpinionsPage() {
  return (
    <AdminRouteGuard permission="manage_moderation">
      <AdminModuleWrapper moduleKey="opinions">
        <AdminOpinionsManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
