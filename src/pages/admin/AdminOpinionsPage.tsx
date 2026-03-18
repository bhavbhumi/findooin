import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminOpinionsManagement } from "@/components/admin/AdminOpinionsManagement";

export default function AdminOpinionsPage() {
  return <AdminRouteGuard permission="manage_moderation"><AdminOpinionsManagement /></AdminRouteGuard>;
}
