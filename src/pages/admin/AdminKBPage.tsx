import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminKnowledgeBase } from "@/components/admin/AdminKnowledgeBase";

export default function AdminKBPage() {
  return <AdminRouteGuard permission="manage_kb"><AdminKnowledgeBase /></AdminRouteGuard>;
}
