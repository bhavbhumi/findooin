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
  IndianRupee, Server, Search, FileText
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
      label: "Platform",
      items: [
        { title: "TrustCircle IQ™", url: "/admin/patent", icon: FileText },
      ],
    },
    {
      label: "Support",
      items: [
        { title: "Tickets", url: "/admin/support", icon: LifeBuoy },
        { title: "Knowledge Base", url: "/admin/kb", icon: BookOpen },
      ],
    },
    {
      label: "Infrastructure",
      items: [
        { title: "Monitoring", url: "/admin/monitoring", icon: Monitor },
        { title: "Scorecard", url: "/admin/scorecard", icon: Gauge },
        { title: "Module Audit", url: "/admin/module-audit", icon: ClipboardList },
        { title: "SEO Audit", url: "/admin/seo", icon: Search },
      ],
    },
    {
      label: "Communications",
      items: [
        { title: "Email", url: "/admin/email", icon: Mail },
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-gradient-to-b from-[hsl(240,100%,27%)] via-[hsl(240,100%,20%)] to-[hsl(43,72%,35%)] [&_[data-sidebar=sidebar]]:bg-transparent">
      <SidebarHeader className="p-3 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2 px-1">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-[hsl(43,72%,53%)]" />
            </div>
            <div>
              <p className="text-sm font-bold font-heading text-white">Admin</p>
              <p className="text-[10px] text-white/50">Control Center</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <Shield className="h-5 w-5 text-[hsl(43,72%,53%)]" />
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
