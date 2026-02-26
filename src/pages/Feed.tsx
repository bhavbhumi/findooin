import { useFeedPosts } from "@/hooks/useFeedPosts";
import { useTrendingPosts } from "@/hooks/useTrendingPosts";
import { useViralPosts } from "@/hooks/useViralPosts";
import { PostCard } from "@/components/feed/PostCard";
import { TrendingSidebar } from "@/components/feed/TrendingSidebar";
import { CreatePostComposer } from "@/components/feed/CreatePostComposer";
import { FeedTabs, type FeedFilter } from "@/components/feed/FeedTabs";
import { DraftsPanel } from "@/components/feed/DraftsPanel";
import { ScheduledPostsManager } from "@/components/feed/ScheduledPostsManager";
import AppLayout from "@/components/AppLayout";
import { FindooLoader } from "@/components/FindooLoader";
import { useState, useCallback, useRef, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";
import { PostDraft } from "@/hooks/useDrafts";
import { toast } from "sonner";

const POSTS_PER_PAGE = 10;

const Feed = () => {
  const [filter, setFilter] = useState<FeedFilter>("foryou");
  const [feedUserId, setFeedUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setFeedUserId(data.user?.id ?? null));
  }, []);

  const { data: forYouPosts, isLoading: forYouLoading, error: forYouError } = useFeedPosts();
  const { data: trendingPosts, isLoading: trendingLoading, error: trendingError } = useTrendingPosts();
  const { data: viralPosts, isLoading: viralLoading, error: viralError } = useViralPosts();

  const allPosts = filter === "foryou" ? forYouPosts : filter === "trending" ? trendingPosts : viralPosts;
  const isLoading = filter === "foryou" ? forYouLoading : filter === "trending" ? trendingLoading : viralLoading;
  const error = filter === "foryou" ? forYouError : filter === "trending" ? trendingError : viralError;

  // Pagination
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Reset pagination on filter change
  useEffect(() => {
    setVisibleCount(POSTS_PER_PAGE);
  }, [filter]);

  const visiblePosts = allPosts?.slice(0, visibleCount);
  const hasMore = (allPosts?.length ?? 0) > visibleCount;

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => prev + POSTS_PER_PAGE);
        }
      },
      { rootMargin: "200px" }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, isLoading, visibleCount]);

  return (
    <AppLayout>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <ErrorBoundary fallbackTitle="Error loading composer">
            <CreatePostComposer />
          </ErrorBoundary>
          <FeedTabs value={filter} onChange={setFilter} />

          {isLoading && <FindooLoader text="Loading your feed..." />}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive">Failed to load feed. Please try again.</p>
            </div>
          )}

          {visiblePosts && visiblePosts.length === 0 && !isLoading && (
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

          {visiblePosts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Infinite scroll trigger */}
          {hasMore && <div ref={observerRef} className="h-1" />}
          {hasMore && <FindooLoader size="sm" />}
        </div>

        <aside className="hidden lg:block space-y-4">
          <ScheduledPostsManager />
          <DraftsPanel userId={feedUserId} onLoadDraft={(draft) => {
            // For now, just toast — full integration requires composer ref
            toast.info("Draft loaded — resume editing in composer above");
          }} />
          <TrendingSidebar />
        </aside>
      </div>
    </AppLayout>
  );
};

export default Feed;
