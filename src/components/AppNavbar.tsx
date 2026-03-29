import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, Bell, MessageSquare, User, LogOut, Users, Settings, BarChart3, FileEdit, Clock, Shield, Briefcase, CalendarDays, Compass, FolderLock, Store, Bookmark, Trophy, Download, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useRole, type AppRole } from "@/contexts/RoleContext";
import findooLogo from "@/assets/findoo-logo-icon.png";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/hooks/useAdmin";
import { StreakIndicator } from "@/components/gamification/StreakIndicator";
import { useUserXP } from "@/hooks/useGamification";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


import { ROLE_CONFIG as SHARED_ROLE_CONFIG } from "@/lib/role-config";

const NAVBAR_ROLE_CONFIG: Partial<Record<AppRole, { label: string; icon: typeof Users; color: string; bgColor: string }>> = {
  investor: { label: SHARED_ROLE_CONFIG.investor.label, icon: SHARED_ROLE_CONFIG.investor.icon, color: SHARED_ROLE_CONFIG.investor.color, bgColor: "bg-investor/10 border-investor/20" },
  intermediary: { label: SHARED_ROLE_CONFIG.intermediary.label, icon: SHARED_ROLE_CONFIG.intermediary.icon, color: SHARED_ROLE_CONFIG.intermediary.color, bgColor: "bg-intermediary/10 border-intermediary/20" },
  issuer: { label: SHARED_ROLE_CONFIG.issuer.label, icon: SHARED_ROLE_CONFIG.issuer.icon, color: SHARED_ROLE_CONFIG.issuer.color, bgColor: "bg-issuer/10 border-issuer/20" },
};

const AppNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { availableRoles, activeRole, setActiveRole, loaded } = useRole();
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { data: isAdmin } = useIsAdmin();
  const { data: xp } = useUserXP(currentUserId || undefined);
  const { isEnabled, isFetched } = useFeatureFlags();
  const showJobs = !isFetched || isEnabled("jobs_board");
  const showEvents = !isFetched || isEnabled("events_module");
  const showShowcase = !isFetched || isEnabled("directory_listings");
  const showMessages = !isFetched || isEnabled("messaging");
  const showLeaderboard = !isFetched || isEnabled("leaderboard");
  const showVault = !isFetched || isEnabled("vault_storage");

  useEffect(() => {
    let channel: any;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      const uid = session.user.id;
      setCurrentUserId(uid);

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
    const { removeSession } = await import("@/lib/session-manager");
    await removeSession();
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg" aria-label="Main navigation">
        <div className="container flex h-14 items-center justify-between gap-4">
          {/* Left: Logo + Feed + Network */}
          <div className="flex items-center gap-4">
            <Link to="/feed" className="flex items-center gap-2">
              <img src={findooLogo} alt="findoo" className="h-9 w-9 dark:brightness-0 dark:invert" />
              <span className="text-lg font-bold font-heading text-primary hidden sm:block tracking-tight">
                findoo
              </span>
            </Link>
          <div className="hidden md:flex items-center gap-0.5">
              <Button variant="ghost" size="sm" className="text-muted-foreground px-2 lg:px-3" asChild>
                <Link to="/feed">
                  <Home className="h-4 w-4 lg:mr-1.5" />
                  <span className="hidden lg:inline">Feed</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground px-2 lg:px-3" asChild>
                <Link to="/network">
                  <Users className="h-4 w-4 lg:mr-1.5" />
                  <span className="hidden lg:inline">Network</span>
                </Link>
              </Button>
              {showJobs && (
                <Button variant="ghost" size="sm" className="text-muted-foreground px-2 lg:px-3" asChild>
                  <Link to="/jobs">
                    <Briefcase className="h-4 w-4 lg:mr-1.5" />
                    <span className="hidden lg:inline">Jobs</span>
                  </Link>
                </Button>
              )}
              {showEvents && (
                <Button variant="ghost" size="sm" className="text-muted-foreground px-2 lg:px-3" asChild>
                  <Link to="/events">
                    <CalendarDays className="h-4 w-4 lg:mr-1.5" />
                    <span className="hidden lg:inline">Events</span>
                  </Link>
                </Button>
              )}
              {showShowcase && (
                <Button variant="ghost" size="sm" className="text-muted-foreground px-2 lg:px-3" asChild>
                  <Link to="/showcase">
                    <Store className="h-4 w-4 lg:mr-1.5" />
                    <span className="hidden lg:inline">Showcase</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Right: Discover search + Icons + Profile dropdown */}
          <div className="flex items-center gap-2">
            {/* Discover */}
            <Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground px-2 lg:px-3" asChild>
              <Link to="/discover">
                <Compass className="h-4 w-4 lg:mr-1.5" />
                <span className="hidden lg:inline">Discover</span>
              </Link>
            </Button>

            {/* Streak indicator */}
            {xp && xp.current_streak > 0 && (
              <StreakIndicator streak={xp.current_streak} multiplier={xp.streak_multiplier} />
            )}

            {/* Leaderboard */}
            {showLeaderboard && (
              <Button variant="ghost" size="icon" className="text-muted-foreground" asChild aria-label="Leaderboard">
                <Link to="/leaderboard">
                  <Trophy className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Messages icon */}
            {showMessages && (
              <Button variant="ghost" size="icon" className="text-muted-foreground" asChild aria-label="Messages">
                <Link to="/messages">
                  <MessageSquare className="h-5 w-5" />
                </Link>
              </Button>
            )}

            {/* Notifications icon */}
            <Button variant="ghost" size="icon" className="text-muted-foreground relative" asChild aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}>
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
                <Button variant="outline" size="icon" className="rounded-md h-9 w-9 border-border" aria-label="User menu">
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
                {showVault && (
                  <DropdownMenuItem asChild>
                    <Link to="/vault" className="flex items-center gap-2 cursor-pointer">
                      <FolderLock className="h-4 w-4" />
                      My Vault
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/bookmarks" className="flex items-center gap-2 cursor-pointer">
                    <Bookmark className="h-4 w-4" />
                    Bookmarks
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/feed?filter=opinions" className="flex items-center gap-2 cursor-pointer">
                    <BarChart3 className="h-4 w-4" />
                    Opinions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/install" className="flex items-center gap-2 cursor-pointer">
                    <Download className="h-4 w-4" />
                    Install App
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer text-primary">
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="lg:hidden" />
                <div className="lg:hidden px-2 py-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground mb-1.5">My Content</p>
                  <DropdownMenuItem asChild>
                    <Link to="/feed?panel=drafts" className="flex items-center gap-2 cursor-pointer">
                      <FileEdit className="h-4 w-4" />
                      Drafts
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/feed?panel=scheduled" className="flex items-center gap-2 cursor-pointer">
                      <Clock className="h-4 w-4" />
                      Scheduled Posts
                    </Link>
                  </DropdownMenuItem>
                </div>
                {/* Role switcher in dropdown for mobile */}
                {availableRoles.length > 1 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Active Role</p>
                      <div className="flex flex-col gap-1">
                        {availableRoles.filter(role => role !== 'admin').map((role) => {
                          const config = NAVBAR_ROLE_CONFIG[role];
                          if (!config) return null;
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
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background md:hidden z-50" aria-label="Mobile navigation">
        <div className="flex items-center justify-around py-1.5">
          {[
            { icon: Home, label: "Feed", href: "/feed" },
            { icon: Users, label: "Network", href: "/network" },
            ...(showJobs ? [{ icon: Briefcase, label: "Jobs", href: "/jobs" }] : []),
            ...(showEvents ? [{ icon: CalendarDays, label: "Events", href: "/events" }] : []),
            { icon: Compass, label: "Discover", href: "/discover" },
            { icon: User, label: "Profile", href: "/profile" },
          ].map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 transition-colors px-1 py-1",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-5 w-5" />
                <span className={cn("text-[9px]", isActive && "font-semibold")}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default AppNavbar;
