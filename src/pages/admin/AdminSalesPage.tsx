import { AdminComingSoon } from "@/components/admin/AdminComingSoon";

export default function AdminSalesPage() {
  return (
    <AdminComingSoon
      title="Sales Pipeline"
      description="Track and manage sales leads from prospecting through conversion."
      features={[
        "Kanban-style pipeline view (New → Won/Lost)",
        "Lead scoring and priority assignment",
        "Activity timeline per lead",
        "Link leads to registry entities and invitations",
        "Assign leads to team members",
        "Conversion analytics and forecasting",
      ]}
    />
  );
}
