import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, Bell, MessageSquare, User, LogOut, Users, Settings, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRole, type AppRole } from "@/contexts/RoleContext";
import findooLogo from "@/assets/findoo-logo-icon.png";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ROLE_CONFIG as SHARED_ROLE_CONFIG } from "@/lib/role-config";

const NAVBAR_ROLE_CONFIG: Record<AppRole, { label: string; icon: typeof Users; color: string; bgColor: string }> = {
  investor: { label: SHARED_ROLE_CONFIG.investor.label, icon: SHARED_ROLE_CONFIG.investor.icon, color: SHARED_ROLE_CONFIG.investor.color, bgColor: "bg-investor/10 border-investor/20" },
  intermediary: { label: SHARED_ROLE_CONFIG.intermediary.label, icon: SHARED_ROLE_CONFIG.intermediary.icon, color: SHARED_ROLE_CONFIG.intermediary.color, bgColor: "bg-intermediary/10 border-intermediary/20" },
  issuer: { label: SHARED_ROLE_CONFIG.issuer.label, icon: SHARED_ROLE_CONFIG.issuer.icon, color: SHARED_ROLE_CONFIG.issuer.color, bgColor: "bg-issuer/10 border-issuer/20" },
};

const AppNavbar = () => {
  const navigate = useNavigate();
  const { availableRoles, activeRole, setActiveRole, loaded } = useRole();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let channel: any;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const uid = session.user.id;

      // Load initial count
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("read", false)
        .then(({ count }) => setUnreadCount(count || 0));

      // Realtime for new notifications
      channel = supabase
        .channel("navbar-notif-count")
        .on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${uid}`,
        }, () => {
          // Reload count on any change
          supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", uid)
            .eq("read", false)
            .then(({ count }) => setUnreadCount(count || 0));
        })
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between gap-4">
          {/* Left: Logo + Feed + Network */}
          <div className="flex items-center gap-4">
            <Link to="/feed" className="flex items-center gap-2">
              <img src={findooLogo} alt="FindOO" className="h-9 w-9" />
              <span className="text-lg font-bold font-heading text-primary hidden sm:block tracking-tight">
                FindOO
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link to="/feed">
                  <Home className="h-4 w-4 mr-1.5" />
                  Feed
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link to="/network">
                  <Users className="h-4 w-4 mr-1.5" />
                  Network
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Discover search + Icons + Profile dropdown */}
          <div className="flex items-center gap-2">
            {/* Discover search box */}
            <Link
              to="/discover"
              className="hidden md:flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors min-w-[160px]"
            >
              <Search className="h-4 w-4 shrink-0" />
              <span>Discover</span>
            </Link>

            {/* Messages icon */}
            <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
              <Link to="/messages">
                <MessageSquare className="h-5 w-5" />
              </Link>
            </Button>

            {/* Notifications icon */}
            <Button variant="ghost" size="icon" className="text-muted-foreground relative" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </Button>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-md h-9 w-9 border-border">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover border-border">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/analytics" className="flex items-center gap-2 cursor-pointer">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {/* Role switcher in dropdown for mobile */}
                {availableRoles.length > 1 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Active Role</p>
                      <div className="flex flex-col gap-1">
                        {availableRoles.map((role) => {
                          const config = NAVBAR_ROLE_CONFIG[role];
                          const Icon = config.icon;
                          const isActive = activeRole === role;
                          return (
                            <button
                              key={role}
                              onClick={() => setActiveRole(role)}
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all w-full text-left",
                                isActive
                                  ? `${config.bgColor} ${config.color} border`
                                  : "text-muted-foreground hover:bg-muted/50 border border-transparent"
                              )}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background md:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: Home, label: "Feed", href: "/feed" },
            { icon: Users, label: "Network", href: "/network" },
            { icon: Search, label: "Discover", href: "/discover" },
            { icon: Bell, label: "Alerts", href: "/notifications" },
            { icon: User, label: "Profile", href: "/profile" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors p-2"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default AppNavbar;
