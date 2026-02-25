import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, Search, Bell, MessageSquare, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import findooLogo from "@/assets/findoo-logo-icon.png";
import { useFeedPosts } from "@/hooks/useFeedPosts";
import { PostCard } from "@/components/feed/PostCard";
import { TrendingSidebar } from "@/components/feed/TrendingSidebar";

const Feed = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const { data: posts, isLoading, error } = useFeedPosts();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserName(session.user.user_metadata?.full_name || "User");
    });
  }, [navigate]);

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

      {/* Main content */}
      <div className="container py-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 max-w-4xl mx-auto">
          {/* Feed column */}
          <div className="space-y-4">
            {isLoading && (
              <>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-8 w-48" />
                  </div>
                ))}
              </>
            )}

            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
                <p className="text-sm text-destructive">Failed to load feed. Please try again.</p>
              </div>
            )}

            {posts && posts.length === 0 && (
              <div className="rounded-xl border border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">No posts yet. Start following accounts to see their posts here.</p>
              </div>
            )}

            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-4">
            <TrendingSidebar />
          </aside>
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
