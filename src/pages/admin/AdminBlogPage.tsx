import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminBlogManagement } from "@/components/admin/AdminBlogManagement";

export default function AdminBlogPage() {
  return <AdminRouteGuard permission="manage_blog"><AdminBlogManagement /></AdminRouteGuard>;
}
