import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminProjectScorecard } from "@/components/admin/AdminProjectScorecard";

export default function AdminScorecardPage() {
  return <AdminRouteGuard permission="view_scorecard"><AdminProjectScorecard /></AdminRouteGuard>;
}
