import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminBlogManagement } from "@/components/admin/AdminBlogManagement";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminBlogPage() {
  return (
    <AdminRouteGuard permission="manage_blog">
      <AdminModuleWrapper moduleKey="blog">
        <AdminBlogManagement />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
