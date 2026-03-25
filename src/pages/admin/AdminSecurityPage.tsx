import { AdminSecurityHub } from "@/components/admin/AdminSecurityHub";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminSecurityPage() {
  return (
    <AdminModuleWrapper moduleKey="security">
      <AdminSecurityHub />
    </AdminModuleWrapper>
  );
}
