import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminKnowledgeBase } from "@/components/admin/AdminKnowledgeBase";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminKBPage() {
  return (
    <AdminRouteGuard permission="manage_kb">
      <AdminModuleWrapper moduleKey="knowledgeBase">
        <AdminKnowledgeBase />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
