import { AdminComingSoon } from "@/components/admin/AdminComingSoon";

export default function AdminFeaturesPage() {
  return (
    <AdminComingSoon
      title="Feature Flags & Config"
      description="Control feature rollouts and platform configuration."
      features={[
        "Toggle features on/off per user segment",
        "A/B testing controls & variant tracking",
        "Maintenance mode toggle",
        "Platform-wide configuration editor",
        "Gradual rollout percentages",
      ]}
    />
  );
}
