/**
 * AdminRouteGuard — Route-level RBAC enforcement for admin pages.
 * Shows "Access Denied" for staff without the required permission.
 * Admins always pass (they have all permissions via get_staff_permissions).
 */
import { useStaffPermissions, type StaffPermission } from "@/hooks/useStaffPermissions";
import { ShieldAlert } from "lucide-react";
import { FindooLoader } from "@/components/FindooLoader";

interface Props {
  permission: StaffPermission;
  children: React.ReactNode;
}

export function AdminRouteGuard({ permission, children }: Props) {
  const { hasPermission, isLoading } = useStaffPermissions();

  if (isLoading) return <FindooLoader text="Checking access..." />;

  if (!hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <ShieldAlert className="h-12 w-12 mb-4 opacity-40" />
        <h2 className="text-lg font-semibold text-foreground">Access Denied</h2>
        <p className="text-sm mt-1">
          You don't have the <code className="px-1 py-0.5 bg-muted rounded text-xs">{permission}</code> permission.
        </p>
        <p className="text-xs mt-3 text-muted-foreground">Contact an admin to request access.</p>
      </div>
    );
  }

  return <>{children}</>;
}
