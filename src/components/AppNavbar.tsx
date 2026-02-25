import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, Bell, MessageSquare, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import findooLogo from "@/assets/findoo-logo-icon.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AppNavbar = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between gap-4">
          {/* Left: Logo + Feed */}
          <div className="flex items-center gap-4">
            <Link to="/feed" className="flex items-center gap-2">
              <img src={findooLogo} alt="FindOO" className="h-8 w-8" />
              <span className="text-lg font-bold font-heading text-foreground hidden sm:block tracking-tight">
                FindOO
              </span>
            </Link>
            <div className="hidden md:flex items-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                <Link to="/feed">
                  <Home className="h-4 w-4 mr-1.5" />
                  Feed
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
            <Button variant="ghost" size="icon" className="text-muted-foreground" asChild>
              <Link to="/notifications">
                <Bell className="h-5 w-5" />
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
            { icon: Search, label: "Discover", href: "/discover" },
            { icon: MessageSquare, label: "Messages", href: "/messages" },
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
