/**
 * Admin — Layout shell with sidebar + nested routes for all admin sections.
 */
import { useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useIsAdmin } from "@/hooks/useAdmin";
import { FindooLoader } from "@/components/FindooLoader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Shield } from "lucide-react";

const BREADCRUMB_MAP: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Users",
  "/admin/verification": "Verification",
  "/admin/moderation": "Reports",
  "/admin/audit": "Audit Log",
  "/admin/invitations": "Invitations",
  "/admin/registry": "Registry",
  "/admin/sales": "Sales Pipeline",
  "/admin/campaigns": "Campaigns",
  "/admin/blog": "Blog",
  "/admin/monitoring": "Monitoring",
  "/admin/billing": "Billing",
  "/admin/notifications": "Notifications",
  "/admin/features": "Feature Flags",
  "/admin/support": "Tickets",
  "/admin/kb": "Knowledge Base",
  "/admin/scorecard": "Project Scorecard",
  "/admin/module-audit": "Module Audit",
  "/admin/cost-report": "Cost Report",
  "/admin/scaling-report": "Scaling Report",
  "/admin/email": "Email",
  "/admin/patent": "TrustCircle IQ™ Patent",
};

export default function Admin() {
  usePageMeta({ title: "Admin Panel" });
  const navigate = useNavigate();
  const location = useLocation();
  const { data: isAdmin, isLoading } = useIsAdmin();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/feed");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FindooLoader text="Checking access..." />
      </div>
    );
  }

  if (!isAdmin) return null;

  const currentLabel = BREADCRUMB_MAP[location.pathname] || "Admin";
  const isRoot = location.pathname === "/admin";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-12 flex items-center gap-3 border-b border-border/50 px-4 shrink-0 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
            <SidebarTrigger className="shrink-0" />
            
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/admin" className="flex items-center gap-1.5 text-xs">
                    <Shield className="h-3 w-3" />
                    Admin
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {!isRoot && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-xs font-medium">
                        {currentLabel}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {/* Content */}
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            <div className="max-w-6xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
