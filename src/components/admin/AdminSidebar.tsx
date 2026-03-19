/**
 * AdminSidebar — Collapsible sidebar navigation for the admin panel.
 * Items are filtered by the current user's staff permissions.
 * Admins see everything; moderators/staff see only permitted sections.
 */
import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, ShieldCheck, Users, Flag, BookOpen, Activity,
  Monitor, CreditCard, Bell, ToggleLeft, LifeBuoy,
  Mail, Database, TrendingUp, Megaphone, Send, Gauge, ClipboardList,
  IndianRupee, Server, Search, FileText, LogOut, ExternalLink, BarChart3,
  Crown, ShieldAlert
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import findooLogo from "@/assets/findoo-logo-icon.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useVerificationQueue, useAdminReports } from "@/hooks/useAdmin";
import { useStaffPermissions, type StaffPermission } from "@/hooks/useStaffPermissions";

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useStaffPermissions();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const { data: profile } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("profiles").select("full_name, display_name, avatar_url").eq("id", user.id).single();
      return { ...data, email: user.email };
    },
  });

  const { data: requests } = useVerificationQueue();
  const { data: reports } = useAdminReports();

  const pendingVerifications = requests?.filter(r => r.status === "pending").length || 0;
  const pendingReports = reports?.filter(r => r.status === "pending").length || 0;

  const badgeMap: Record<string, number> = {
    "/admin/verification": pendingVerifications,
    "/admin/feed": pendingReports,
  };

  type NavItem = {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    end?: boolean;
    soon?: boolean;
    permission?: StaffPermission;
  };

  const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
    {
      label: "Dashboard",
      items: [
        { title: "Overview", url: "/admin", icon: LayoutDashboard, end: true },
        { title: "Monitoring", url: "/admin/monitoring", icon: Monitor, permission: "view_monitoring" },
        { title: "Scorecard", url: "/admin/scorecard", icon: Gauge, permission: "view_scorecard" },
      ],
    },
    {
      label: "Users & Access",
      items: [
        { title: "Users", url: "/admin/users", icon: Users, permission: "manage_users" },
        { title: "Verification", url: "/admin/verification", icon: ShieldCheck, permission: "manage_verification" },
        { title: "Audit Log", url: "/admin/audit", icon: Activity, permission: "view_audit" },
      ],
    },
    {
      label: "App Modules",
      items: [
        { title: "Feed & Posts", url: "/admin/feed", icon: BookOpen, permission: "manage_moderation" },
        { title: "Jobs", url: "/admin/jobs", icon: Database, permission: "manage_moderation" },
        { title: "Events", url: "/admin/events", icon: Activity, permission: "manage_moderation" },
        { title: "Listings", url: "/admin/listings", icon: ClipboardList, permission: "manage_moderation" },
        { title: "Messages", url: "/admin/messages", icon: Mail, permission: "manage_moderation" },
        { title: "Opinions", url: "/admin/opinions", icon: BarChart3, permission: "manage_moderation" },
        { title: "Gamification", url: "/admin/gamification", icon: TrendingUp, permission: "manage_moderation" },
      ],
    },
    {
      label: "Growth & Outreach",
      items: [
        { title: "Invitations", url: "/admin/invitations", icon: Send, permission: "manage_invitations" },
        { title: "Registry", url: "/admin/registry", icon: Database, permission: "manage_registry" },
        { title: "Sales", url: "/admin/sales", icon: TrendingUp, permission: "manage_sales" },
        { title: "Campaigns", url: "/admin/campaigns", icon: Megaphone, permission: "manage_campaigns" },
        { title: "Email", url: "/admin/email", icon: Mail, permission: "manage_email" },
        { title: "Notifications", url: "/admin/notifications", icon: Bell, permission: "manage_notifications" },
      ],
    },
    {
      label: "Content & Support",
      items: [
        { title: "Blog", url: "/admin/blog", icon: BookOpen, permission: "manage_blog" },
        { title: "Support Tickets", url: "/admin/support", icon: LifeBuoy, permission: "manage_support" },
        { title: "Knowledge Base", url: "/admin/kb", icon: BookOpen, permission: "manage_kb" },
      ],
    },
    {
      label: "Infrastructure",
      items: [
        { title: "Security Hub", url: "/admin/security", icon: ShieldAlert, permission: "view_monitoring" },
        { title: "Module Audit", url: "/admin/module-audit", icon: ClipboardList, permission: "view_module_audit" },
        { title: "SEO Audit", url: "/admin/seo", icon: Search, permission: "view_seo" },
        { title: "TrustCircle IQ™", url: "/admin/patent", icon: FileText, permission: "view_patent" },
        { title: "Cost Report", url: "/admin/cost-report", icon: IndianRupee, permission: "view_cost_report" },
        { title: "Scaling Report", url: "/admin/scaling-report", icon: Server, permission: "view_scaling_report" },
        { title: "Feature Flags", url: "/admin/features", icon: ToggleLeft, permission: "manage_features" },
        { title: "Billing", url: "/admin/billing", icon: CreditCard, soon: true, permission: "manage_billing" },
        { title: "Premium Spec", url: "/admin/premium-features", icon: Crown, permission: "manage_billing" },
      ],
    },
  ];

  // Filter sections based on permissions
  const filteredSections = NAV_SECTIONS
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.permission || hasPermission(item.permission)
      ),
    }))
    .filter((section) => section.items.length > 0);

  const renderMenuItem = (item: NavItem, isActive: boolean, badgeCount: number, isCollapsed: boolean) => (
    <SidebarMenuItem key={item.title} className="mb-0">
      <SidebarMenuButton asChild className="h-8 px-2 py-1">
        <NavLink
          to={item.url}
          end={item.end}
          className={`hover:bg-white/10 transition-colors relative text-white/80 ${
            item.soon ? "opacity-60" : ""
          }`}
          activeClassName="bg-white/15 text-white font-medium"
        >
          <div className="relative mr-2 shrink-0">
            <item.icon className="h-4 w-4" />
            {isCollapsed && badgeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-3.5 min-w-3.5 rounded-full bg-destructive text-destructive-foreground text-[8px] flex items-center justify-center px-0.5">
                {badgeCount}
              </span>
            )}
          </div>
          {!isCollapsed && (
            <span className="flex-1 flex items-center justify-between">
              <span className="text-sm">{item.title}</span>
              {item.soon && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 ml-1 shrink-0 border-white/30 text-white/60">
                  Soon
                </Badge>
              )}
              {!item.soon && badgeCount > 0 && (
                <Badge variant="destructive" className="text-[9px] h-4.5 min-w-5 px-1.5 ml-1 shrink-0">
                  {badgeCount}
                </Badge>
              )}
            </span>
          )}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r-0 bg-gradient-to-b from-[hsl(240,100%,27%)] via-[hsl(240,100%,20%)] to-[hsl(43,72%,35%)] [&_[data-sidebar=sidebar]]:bg-transparent [&_[data-radix-scroll-area-viewport]]:scrollbar-thin [&_*::-webkit-scrollbar]:w-1 [&_*::-webkit-scrollbar-track]:bg-transparent [&_*::-webkit-scrollbar-thumb]:bg-white/15 [&_*::-webkit-scrollbar-thumb]:rounded-full [&_*::-webkit-scrollbar-thumb:hover]:bg-white/25">
      {/* Header — branded logo */}
      <div className={`flex items-center gap-2.5 px-2 py-3 border-b border-white/10 ${collapsed ? "justify-center px-1" : "px-4"}`}>
        <img src={findooLogo} alt="FindOO" className={`shrink-0 rounded-lg object-contain ${collapsed ? "h-8 w-8" : "h-10 w-10"}`} />
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight font-heading leading-tight">
              FindOO Admin
            </h1>
            <p className="text-[10px] text-white/50 leading-none mt-0.5">
              Control Center
            </p>
          </div>
        )}
      </div>

      <SidebarContent className="[&_[data-sidebar=group]]:py-1 [&_[data-sidebar=group]]:px-2 [&_ul]:gap-0 [&_[data-sidebar=group-label]]:h-6 [&_[data-sidebar=group-label]]:mb-0">
        {filteredSections.map((section) => {
          const sectionHasActive = section.items.some((item) =>
            item.end ? location.pathname === item.url : location.pathname.startsWith(item.url)
          );
          const isOverview = section.label === "Dashboard";

          if (isOverview || collapsed) {
            return (
              <SidebarGroup key={section.label}>
                <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-white/40">
                  {!collapsed && section.label}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const isActive = item.end
                        ? location.pathname === item.url
                        : location.pathname.startsWith(item.url);
                      const badgeCount = badgeMap[item.url] || 0;
                      return renderMenuItem(item, isActive, badgeCount, collapsed);
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          }

          return (
            <Collapsible key={section.label} defaultOpen={sectionHasActive} className="group/collapsible">
              <SidebarGroup>
                <SidebarGroupLabel asChild className="text-[10px] uppercase tracking-wider text-white/40 hover:bg-white/5 rounded-md cursor-pointer">
                  <CollapsibleTrigger className="flex w-full items-center justify-between">
                    <span>{section.label}</span>
                    <ChevronRight className="h-3 w-3 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {section.items.map((item) => {
                        const isActive = item.end
                          ? location.pathname === item.url
                          : location.pathname.startsWith(item.url);
                        const badgeCount = badgeMap[item.url] || 0;
                        return renderMenuItem(item, isActive, badgeCount, collapsed);
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-white/10">
        {/* User info + inline actions */}
        <div className={`flex items-center gap-2.5 rounded-lg bg-white/10 p-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(43,72%,53%)]/20 text-[hsl(43,72%,53%)]">
            <span className="text-xs font-bold">
              {profile?.display_name?.[0] || profile?.full_name?.[0] || "A"}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">
                  {profile?.display_name || profile?.full_name || "Admin"}
                </p>
                <p className="text-[10px] text-white/40 truncate">{profile?.email}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                <button
                  onClick={() => navigate("/feed")}
                  title="Back to App"
                  className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
        {!collapsed && (
          <p className="text-[9px] text-white/20 text-center mt-1.5">FindOO Admin v3.0</p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
