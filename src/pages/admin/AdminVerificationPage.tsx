import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminVerificationQueue } from "@/components/admin/AdminVerificationQueue";

export default function AdminVerificationPage() {
  return <AdminRouteGuard permission="manage_verification"><AdminVerificationQueue /></AdminRouteGuard>;
}
