import { AdminComingSoon } from "@/components/admin/AdminComingSoon";

export default function AdminSupportPage() {
  return (
    <AdminComingSoon
      title="Support & Tickets"
      description="Manage user support requests and knowledge base."
      features={[
        "Support ticket queue & assignment",
        "User conversation history",
        "FAQ / knowledge base editor",
        "Canned response templates",
        "SLA tracking & resolution metrics",
      ]}
    />
  );
}
