import { AdminComingSoon } from "@/components/admin/AdminComingSoon";

export default function AdminCampaignsPage() {
  return (
    <AdminComingSoon
      title="Campaigns"
      description="Plan and execute marketing campaigns across email, SMS, and WhatsApp channels."
      features={[
        "Multi-channel campaign builder",
        "Target audience segmentation from registry",
        "Template editor with personalization",
        "A/B testing and performance tracking",
        "Open, click, and conversion metrics",
        "Scheduled and drip campaign support",
      ]}
    />
  );
}
