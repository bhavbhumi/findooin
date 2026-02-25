import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Home, Search, Bell, MessageSquare, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import findooLogo from "@/assets/findoo-logo-icon.png";

const Feed = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/feed" className="flex items-center gap-2">
              <img src={findooLogo} alt="FindOO" className="h-7 w-7" />
              <span className="text-lg font-bold font-heading text-foreground hidden sm:block tracking-tight">FindOO</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {[
                { icon: Home, label: "Feed", href: "/feed" },
                { icon: Search, label: "Discover", href: "/discover" },
                { icon: MessageSquare, label: "Messages", href: "/messages" },
                { icon: Bell, label: "Notifications", href: "/notifications" },
              ].map((item) => (
                <Button key={item.label} variant="ghost" size="sm" className="text-muted-foreground" asChild>
                  <Link to={item.href}>
                    <item.icon className="h-4 w-4 mr-1.5" />
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile">
                <User className="h-4 w-4 mr-1.5" />
                Profile
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main content placeholder */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 mb-6">
            <Shield className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground mb-3">
            Welcome to FindOO
          </h1>
          <p className="text-muted-foreground mb-8">
            Your feed will appear here once you start connecting with verified entities and professionals.
            Start by discovering and following accounts.
          </p>
          <Button asChild>
            <Link to="/discover">
              <Search className="mr-2 h-4 w-4" />
              Discover Entities
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background md:hidden">
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
    </div>
  );
};

export default Feed;
