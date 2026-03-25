import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminOverviewPage() {
  return (
    <AdminModuleWrapper moduleKey="overview">
      <AdminOverview />
    </AdminModuleWrapper>
  );
}
