import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useFeedPosts } from "@/hooks/useFeedPosts";
import { useTrendingPosts } from "@/hooks/useTrendingPosts";
import { useViralPosts } from "@/hooks/useViralPosts";
import { PostCard } from "@/components/feed/PostCard";
import { TrendingSidebar } from "@/components/feed/TrendingSidebar";
import { CreatePostComposer } from "@/components/feed/CreatePostComposer";
import { FeedTabs, type FeedFilter } from "@/components/feed/FeedTabs";
import AppNavbar from "@/components/AppNavbar";

const Feed = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [filter, setFilter] = useState<FeedFilter>("foryou");

  const { data: forYouPosts, isLoading: forYouLoading, error: forYouError } = useFeedPosts();
  const { data: trendingPosts, isLoading: trendingLoading, error: trendingError } = useTrendingPosts();
  const { data: viralPosts, isLoading: viralLoading, error: viralError } = useViralPosts();

  const posts = filter === "foryou" ? forYouPosts : filter === "trending" ? trendingPosts : viralPosts;
  const isLoading = filter === "foryou" ? forYouLoading : filter === "trending" ? trendingLoading : viralLoading;
  const error = filter === "foryou" ? forYouError : filter === "trending" ? trendingError : viralError;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserName(session.user.user_metadata?.full_name || "User");
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AppNavbar />

      <div className="container py-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6 max-w-4xl mx-auto">
          <div className="space-y-4">
            <CreatePostComposer />
            <FeedTabs value={filter} onChange={setFilter} />

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
                <p className="text-muted-foreground">
                  {filter === "foryou"
                    ? "No posts yet. Start following accounts to see their posts here."
                    : filter === "trending"
                    ? "No trending posts right now. Check back later."
                    : "No viral posts right now. Check back later."}
                </p>
              </div>
            )}

            {posts?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          <aside className="hidden lg:block space-y-4">
            <TrendingSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Feed;
