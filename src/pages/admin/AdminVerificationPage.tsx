import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminVerificationQueue } from "@/components/admin/AdminVerificationQueue";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminVerificationPage() {
  return (
    <AdminRouteGuard permission="manage_verification">
      <AdminModuleWrapper moduleKey="verification">
        <AdminVerificationQueue />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
