import { AdminRouteGuard } from "@/components/admin/AdminRouteGuard";
import { AdminProjectScorecard } from "@/components/admin/AdminProjectScorecard";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminScorecardPage() {
  return (
    <AdminRouteGuard permission="view_scorecard">
      <AdminModuleWrapper moduleKey="scorecard">
        <AdminProjectScorecard />
      </AdminModuleWrapper>
    </AdminRouteGuard>
  );
}
