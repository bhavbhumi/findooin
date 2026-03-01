import { usePageMeta } from "@/hooks/usePageMeta";
import { useFeedPosts } from "@/hooks/useFeedPosts";
import { useTrendingPosts } from "@/hooks/useTrendingPosts";
import { useViralPosts } from "@/hooks/useViralPosts";
import { PostCard } from "@/components/feed/PostCard";
import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";
import { CreatePostComposer } from "@/components/feed/CreatePostComposer";
import { FeedTabs, type FeedFilter } from "@/components/feed/FeedTabs";
import { FeedSidebar } from "@/components/feed/FeedSidebar";
import AppLayout from "@/components/AppLayout";
import { useState, useCallback, useRef, useEffect, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostDraft } from "@/hooks/useDrafts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DraftsPanel } from "@/components/feed/DraftsPanel";
import { ScheduledPostsManager } from "@/components/feed/ScheduledPostsManager";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyFeedIllustration } from "@/components/illustrations/EmptyStateIllustrations";
import { MessageSquare, TrendingUp, Zap } from "lucide-react";


const MemoizedPostCard = memo(PostCard);

const Feed = () => {
  usePageMeta({ title: "Feed", description: "Your personalized financial feed — market commentary, research notes, and insights from verified professionals." });
  const [filter, setFilter] = useState<FeedFilter>("foryou");
  const [feedUserId, setFeedUserId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftToLoad, setDraftToLoad] = useState<PostDraft | null>(null);

  // Mobile sheet for drafts/scheduled from profile dropdown
  const panelParam = searchParams.get("panel");
  const [mobileSheet, setMobileSheet] = useState<"drafts" | "scheduled" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setFeedUserId(data.user?.id ?? null));
  }, []);

  // Handle ?panel= URL param for mobile access
  useEffect(() => {
    if (panelParam === "drafts" || panelParam === "scheduled") {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktop) {
        setMobileSheet(panelParam);
      }
      setSearchParams({}, { replace: true });
    }
  }, [panelParam, setSearchParams]);

  const {
    flatPosts: forYouPosts,
    isLoading: forYouLoading,
    error: forYouError,
    fetchNextPage: fetchNextForYou,
    hasNextPage: hasNextForYou,
    isFetchingNextPage: fetchingNextForYou,
  } = useFeedPosts();
  const { data: trendingPosts, isLoading: trendingLoading, error: trendingError } = useTrendingPosts();
  const { data: viralPosts, isLoading: viralLoading, error: viralError } = useViralPosts();

  const visiblePosts = filter === "foryou" ? forYouPosts : filter === "trending" ? trendingPosts : viralPosts;
  const isLoading = filter === "foryou" ? forYouLoading : filter === "trending" ? trendingLoading : viralLoading;
  const error = filter === "foryou" ? forYouError : filter === "trending" ? trendingError : viralError;
  const hasMore = filter === "foryou" ? hasNextForYou : false;
  const isFetchingMore = filter === "foryou" ? fetchingNextForYou : false;

  // Infinite scroll observer
  const observerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMore || isLoading || isFetchingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && filter === "foryou") {
          fetchNextForYou();
        }
      },
      { rootMargin: "300px" }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, isLoading, isFetchingMore, filter, fetchNextForYou]);

  const handleLoadDraft = useCallback((draft: PostDraft) => {
    setDraftToLoad(draft);
    setMobileSheet(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Draft loaded — resume editing in composer above");
  }, []);

  // Derive initial sidebar tab from URL param (desktop)
  const initialSidebarTab = panelParam === "drafts" ? "drafts" : panelParam === "scheduled" ? "scheduled" : undefined;

  return (
    <AppLayout maxWidth="max-w-6xl">
      <PageTransition>
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <ErrorBoundary fallbackTitle="Error loading composer">
            <CreatePostComposer
              draftToLoad={draftToLoad}
              onDraftLoaded={() => setDraftToLoad(null)}
            />
          </ErrorBoundary>
          <FeedTabs value={filter} onChange={setFilter} />

          {/* Initial loading skeletons */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive">Failed to load feed. Please try again.</p>
            </div>
          )}

          {visiblePosts && visiblePosts.length === 0 && !isLoading && (
            <EmptyState
              illustration={<EmptyFeedIllustration />}
              icon={filter === "foryou" ? MessageSquare : filter === "trending" ? TrendingUp : Zap}
              title={filter === "foryou" ? "Your feed is waiting" : filter === "trending" ? "Nothing trending yet" : "No viral posts yet"}
              description={
                filter === "foryou"
                  ? "Start following verified professionals to see their market insights, research notes, and commentary here."
                  : "Check back later — when the community buzzes, you'll see it here."
              }
              actionLabel={filter === "foryou" ? "Discover People" : undefined}
              actionLink={filter === "foryou" ? "/discover" : undefined}
            />
          )}

          {visiblePosts?.map((post) => (
            <MemoizedPostCard key={post.id} post={post} />
          ))}

          {/* Infinite scroll trigger + manual fallback */}
          {hasMore && (
            <>
              <div ref={observerRef} className="h-4" />
              {!isFetchingMore && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => fetchNextForYou()}
                    className="px-6 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Load More Posts
                  </button>
                </div>
              )}
            </>
          )}
          {isFetchingMore && (
            <div className="space-y-4">
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          )}
          {!hasMore && !isLoading && visiblePosts && visiblePosts.length > 0 && (
            <p className="text-center text-xs text-muted-foreground py-6">You're all caught up!</p>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <FeedSidebar
              userId={feedUserId}
              onLoadDraft={handleLoadDraft}
              initialTab={initialSidebarTab}
            />
          </div>
        </aside>
      </div>
      </PageTransition>

      {/* Mobile sheet for Drafts/Scheduled */}
      <Sheet open={!!mobileSheet} onOpenChange={(open) => !open && setMobileSheet(null)}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{mobileSheet === "drafts" ? "My Drafts" : "Scheduled Posts"}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            {mobileSheet === "drafts" && (
              <DraftsPanel userId={feedUserId} onLoadDraft={handleLoadDraft} />
            )}
            {mobileSheet === "scheduled" && (
              <ScheduledPostsManager />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
};

export default Feed;
