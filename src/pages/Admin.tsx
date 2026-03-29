/**
 * Admin — Layout shell with sidebar + nested routes for all admin sections.
 * Access is gated by staff permissions (admins get all implicitly).
 */
import { useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { FindooLoader } from "@/components/FindooLoader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Shield } from "lucide-react";

const BREADCRUMB_MAP: Record<string, string> = {
  // Dashboard
  "/admin": "Dashboard",
  "/admin/monitoring": "Monitoring",
  "/admin/scorecard": "Project Scorecard",
  // Users & Access
  "/admin/users": "Users",
  "/admin/verification": "Verification",
  "/admin/audit": "Audit Log",
  // App Modules (Phase 2)
  "/admin/feed": "Feed & Posts",
  "/admin/jobs": "Jobs Management",
  "/admin/events": "Events Management",
  "/admin/listings": "Listings Management",
  "/admin/messages": "Messages",
  "/admin/gamification": "Gamification & XP",
  // Growth & Outreach
  "/admin/invitations": "Invitations",
  "/admin/registry": "Registry",
  "/admin/sales": "Sales Pipeline",
  "/admin/campaigns": "Campaigns",
  "/admin/email": "Email",
  "/admin/notifications": "Notifications",
  // Content & Support
  "/admin/blog": "Blog",
  "/admin/feedback": "Feedback Engine",
  "/admin/moderation": "Moderation",
  "/admin/support": "Support Tickets",
  "/admin/kb": "Knowledge Base",
  // Infrastructure
  "/admin/module-audit": "Module Audit",
  "/admin/seo": "SEO Audit",
  "/admin/patent": "TrustCircle IQ™ Patent",
  "/admin/cost-report": "Cost Report",
  "/admin/scaling-report": "Scaling Report",
  "/admin/features": "Feature Flags",
  "/admin/billing": "Billing",
};

export default function Admin() {
  usePageMeta({ title: "Admin Panel" });
  const navigate = useNavigate();
  const location = useLocation();
  const { isStaff, isLoading } = useStaffPermissions();

  useEffect(() => {
    if (!isLoading && !isStaff) {
      navigate("/feed");
    }
  }, [isStaff, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FindooLoader text="Checking access..." />
      </div>
    );
  }

  if (!isStaff) return null;

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
