import { AdminComingSoon } from "@/components/admin/AdminComingSoon";

export default function AdminNotificationsPage() {
  return (
    <AdminComingSoon
      title="Email & Notifications"
      description="Manage communication channels and notification campaigns."
      features={[
        "Auth email template editor",
        "Push notification campaigns (PWA)",
        "Broadcast messaging to user segments",
        "Notification delivery analytics",
        "Custom email domain management",
      ]}
    />
  );
}
