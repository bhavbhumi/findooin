import { AdminComingSoon } from "@/components/admin/AdminComingSoon";

export default function AdminBillingPage() {
  return (
    <AdminComingSoon
      title="Billing & Subscriptions"
      description="Manage revenue, subscription tiers, and payment infrastructure."
      features={[
        "Stripe integration & payment processing",
        "Subscription tier management (Free, Pro, Enterprise)",
        "Revenue dashboards & MRR tracking",
        "Invoice history & refund management",
        "Usage-based billing metrics",
      ]}
    />
  );
}
