import AdminCodedMessaging from "@/components/admin/AdminCodedMessaging";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";

export default function AdminCodedMessagingPage() {
  return (
    <AdminModuleWrapper moduleKey="codedMessaging">
      <AdminCodedMessaging />
    </AdminModuleWrapper>
  );
}
