import { AdminContentModeration } from "@/components/admin/AdminContentModeration";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminModerationPage() {
  return (
    <AdminModuleWrapper moduleKey="moderation">
      <AdminContentModeration />
    </AdminModuleWrapper>
  );
}
