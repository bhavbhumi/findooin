/**
 * AdminSidebar — Collapsible sidebar navigation for the admin panel.
 * Groups sections into Operations, Content, Platform, and Coming Soon.
 * Shows real-time badge counts for pending verifications and reports.
 */
import { useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, ShieldCheck, Users, Flag, BookOpen, Activity,
  Monitor, CreditCard, Bell, ToggleLeft, LifeBuoy, Shield,
  Mail, Database, TrendingUp, Megaphone, Send, Gauge, ClipboardList,
  IndianRupee, Server
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useVerificationQueue, useAdminReports } from "@/hooks/useAdmin";

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const { data: requests } = useVerificationQueue();
  const { data: reports } = useAdminReports();

  const pendingVerifications = requests?.filter(r => r.status === "pending").length || 0;
  const pendingReports = reports?.filter(r => r.status === "pending").length || 0;

  const badgeMap: Record<string, number> = {
    "/admin/verification": pendingVerifications,
    "/admin/moderation": pendingReports,
  };

  type NavItem = { title: string; url: string; icon: React.ComponentType<{ className?: string }>; end?: boolean; soon?: boolean };

  const NAV_SECTIONS: { label: string; items: NavItem[] }[] = [
    {
      label: "Overview",
      items: [
        { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
      ],
    },
    {
      label: "Operations",
      items: [
        { title: "Users", url: "/admin/users", icon: Users },
        { title: "Verification", url: "/admin/verification", icon: ShieldCheck },
        { title: "Reports", url: "/admin/moderation", icon: Flag },
        { title: "Audit Log", url: "/admin/audit", icon: Activity },
      ],
    },
    {
      label: "Growth",
      items: [
        { title: "Invitations", url: "/admin/invitations", icon: Send },
        { title: "Registry", url: "/admin/registry", icon: Database },
        { title: "Sales", url: "/admin/sales", icon: TrendingUp },
        { title: "Campaigns", url: "/admin/campaigns", icon: Megaphone },
        { title: "Cost Report", url: "/admin/cost-report", icon: IndianRupee },
        { title: "Scaling Report", url: "/admin/scaling-report", icon: Server },
      ],
    },
    {
      label: "Content",
      items: [
        { title: "Blog", url: "/admin/blog", icon: BookOpen },
      ],
    },
    {
      label: "Infrastructure",
      items: [
        { title: "Monitoring", url: "/admin/monitoring", icon: Monitor },
        { title: "Scorecard", url: "/admin/scorecard", icon: Gauge },
        { title: "Module Audit", url: "/admin/module-audit", icon: ClipboardList },
        { title: "Support", url: "/admin/support", icon: LifeBuoy },
      ],
    },
    {
      label: "Coming Soon",
      items: [
        { title: "Billing", url: "/admin/billing", icon: CreditCard, soon: true },
        { title: "Notifications", url: "/admin/notifications", icon: Bell, soon: true },
        { title: "Feature Flags", url: "/admin/features", icon: ToggleLeft, soon: true },
      ],
    },
  ];

  const renderMenuItem = (item: NavItem, isActive: boolean, badgeCount: number, isCollapsed: boolean) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild>
        <NavLink
          to={item.url}
          end={item.end}
          className={`hover:bg-sidebar-accent transition-colors relative text-sidebar-foreground ${
            item.soon ? "opacity-60" : ""
          }`}
          activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
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
                <Badge variant="outline" className="text-[8px] px-1 py-0 ml-1 shrink-0 border-sidebar-foreground/30 text-sidebar-foreground/60">
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-1">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold font-heading">Admin</p>
              <p className="text-[10px] text-muted-foreground">Control Center</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        {NAV_SECTIONS.map((section) => {
          const sectionHasActive = section.items.some((item) =>
            item.end ? location.pathname === item.url : location.pathname.startsWith(item.url)
          );
          const isOverview = section.label === "Overview";

          if (isOverview || collapsed) {
            return (
              <SidebarGroup key={section.label}>
                <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50">
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
                <SidebarGroupLabel asChild className="text-[10px] uppercase tracking-wider text-sidebar-foreground/50 hover:bg-sidebar-accent/50 rounded-md cursor-pointer">
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

      <SidebarFooter className="p-3">
        {!collapsed && (
          <p className="text-[10px] text-sidebar-foreground/40 text-center">
            FindOO Admin v2.0
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
