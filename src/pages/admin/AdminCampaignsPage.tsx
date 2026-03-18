import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminCampaignsManagement } from "@/components/admin/AdminCampaignsManagement";

export default function AdminCampaignsPage() {
  return <AdminRouteGuard permission="manage_campaigns"><AdminCampaignsManagement /></AdminRouteGuard>;
}
