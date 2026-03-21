import { usePageMeta } from "@/hooks/usePageMeta";
import { useFeedPosts, type FeedPost } from "@/hooks/useFeedPosts";
import { PostCard } from "@/components/feed/PostCard";
import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";
import { CreatePostComposer } from "@/components/feed/CreatePostComposer";
import { FeedTabs, type FeedFilter } from "@/components/feed/FeedTabs";
import { FeedSidebar } from "@/components/feed/FeedSidebar";
import AppLayout from "@/components/AppLayout";
import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react";
import { useSearchParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageTransition } from "@/components/PageTransition";
import { SignalStreams } from "@/components/decorative/ContextualSpaceElements";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PostDraft } from "@/hooks/useDrafts";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DraftsPanel } from "@/components/feed/DraftsPanel";
import { ScheduledPostsManager } from "@/components/feed/ScheduledPostsManager";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyFeedIllustration } from "@/components/illustrations/EmptyStateIllustrations";
import { MessageSquare, Clock, Sparkles, Info, BarChart3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTrustCircleIQ, CIRCLE_TIERS, type CircleTier } from "@/hooks/useTrustCircleIQ";
import { cn } from "@/lib/utils";
import { OpinionCard } from "@/components/opinions/OpinionCard";
import { OpinionDetailSheet } from "@/components/opinions/OpinionDetailSheet";
import { useOpinions, useOpinionDetail } from "@/hooks/useOpinions";
import { Skeleton } from "@/components/ui/skeleton";

/* ── AffinityFeed™ Trust-Weighted Scoring ── */
const TRUST_WEIGHT_BY_TIER: Record<number, number> = { 1: 10, 2: 6, 3: 3, 4: 1.5, 5: 1 };
const FRESHNESS_DECAY_DAYS_BY_TIER: Record<number, number> = { 1: 7, 2: 5, 3: 3, 4: 2, 5: 1 };

function computeAffinityFeedScore(post: FeedPost, authorTier: number): number {
  const trustWeight = TRUST_WEIGHT_BY_TIER[authorTier] || 1;
  const engagement = post.like_count + (post.comment_count * 2) + (post.bookmark_count * 3);
  const engagementScore = 1 + Math.log1p(engagement);
  const ageHours = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60);
  const decayDays = FRESHNESS_DECAY_DAYS_BY_TIER[authorTier] || 1;
  const freshness = Math.exp(-0.03 * Math.max(0, ageHours / 24) / decayDays);
  return trustWeight * engagementScore * freshness;
}

const MemoizedPostCard = memo(PostCard);

const Feed = () => {
  usePageMeta({ title: "Feed", description: "Your personalized financial feed — market commentary, research notes, and insights from verified professionals.", path: "/feed" });
  const [filter, setFilter] = useState<FeedFilter>("affinity");
  const [feedUserId, setFeedUserId] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftToLoad, setDraftToLoad] = useState<PostDraft | null>(null);

  const panelParam = searchParams.get("panel");
  const [mobileSheet, setMobileSheet] = useState<"drafts" | "scheduled" | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setFeedUserId(data.user?.id ?? null));
  }, []);

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
    flatPosts,
    isLoading: postsLoading,
    error: postsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFeedPosts();

  const { data: trustData, isLoading: trustLoading } = useTrustCircleIQ(feedUserId, true);

  /* ── AffinityFeed™ ranked posts ── */
  const affinityPosts = useMemo(() => {
    if (!flatPosts.length) return [];

    const authorTierMap = new Map<string, number>();
    if (trustData) {
      ([1, 2, 3, 4, 5] as CircleTier[]).forEach((tier) => {
        const key = CIRCLE_TIERS[tier].key;
        trustData[key].forEach((r) => {
          authorTierMap.set(r.target_id, tier);
        });
      });
    }

    return [...flatPosts]
      .map((post) => {
        // Own posts always rank as Inner Circle (tier 1)
        const tier = post.author.id === feedUserId ? 1 : (authorTierMap.get(post.author.id) || 5);
        return { post, score: computeAffinityFeedScore(post, tier), tier };
      })
    .sort((a, b) => b.score - a.score);
  }, [flatPosts, trustData, feedUserId]);

  const visiblePosts = filter === "affinity"
    ? affinityPosts.map((a) => a.post)
    : flatPosts;
  const isLoading = postsLoading || (filter === "affinity" && trustLoading);
  const error = postsError;
  const hasMore = filter === "recent" ? hasNextPage : false;
  const isFetchingMore = filter === "recent" ? isFetchingNextPage : false;

  // Build tier lookup for affinity indicator
  const postTierMap = useMemo(() => {
    const map = new Map<string, { tier: number; score: number }>();
    affinityPosts.forEach(({ post, tier, score }) => {
      map.set(post.id, { tier, score });
    });
    return map;
  }, [affinityPosts]);

  // Infinite scroll observer (only for Recent)
  const observerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMore || isLoading || isFetchingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && filter === "recent") {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" }
    );
    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, isLoading, isFetchingMore, filter, fetchNextPage]);

  const handleLoadDraft = useCallback((draft: PostDraft) => {
    setDraftToLoad(draft);
    setMobileSheet(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("Draft loaded — resume editing in composer above");
  }, []);

  const initialSidebarTab = panelParam === "drafts" ? "drafts" : panelParam === "scheduled" ? "scheduled" : undefined;

  return (
    <AppLayout maxWidth="max-w-6xl">
      <PageTransition>
      <div className="relative">
      <SignalStreams />
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <ErrorBoundary fallbackTitle="Error loading composer">
            <CreatePostComposer
              draftToLoad={draftToLoad}
              onDraftLoaded={() => setDraftToLoad(null)}
            />
          </ErrorBoundary>
          <FeedTabs value={filter} onChange={setFilter} />

          {/* Opinions Tab */}
          {filter === "opinions" && <FeedOpinionsTab />}

          {/* AffinityFeed™ context bar */}
          {filter === "affinity" && !isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Ranked by <span className="font-semibold text-foreground">AffinityFeed™</span> — content from your trust network is prioritized by circle proximity
              </p>
            </div>
          )}

          {filter !== "opinions" && isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          )}

          {filter !== "opinions" && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive">Failed to load feed. Please try again.</p>
            </div>
          )}

          {filter !== "opinions" && visiblePosts && visiblePosts.length === 0 && !isLoading && (
            <EmptyState
              illustration={<EmptyFeedIllustration />}
              icon={filter === "affinity" ? Sparkles : Clock}
              title={filter === "affinity" ? "Your AffinityFeed™ is waiting" : "No recent posts yet"}
              description={
                filter === "affinity"
                  ? "Start following verified professionals to see their market insights ranked by trust proximity."
                  : "Check back later — new posts from the community will appear here."
              }
              actionLabel={filter === "affinity" ? "Discover People" : undefined}
              actionLink={filter === "affinity" ? "/discover" : undefined}
            />
          )}

          {filter !== "opinions" && visiblePosts?.map((post) => {
            const tierInfo = filter === "affinity" ? postTierMap.get(post.id) : null;
            return (
              <div key={post.id} className="relative">
                {tierInfo && tierInfo.tier <= 3 && (
                  <div className="absolute -left-1 top-3 z-10">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn(
                          "w-1.5 h-8 rounded-full",
                          tierInfo.tier === 1 && "bg-amber-500",
                          tierInfo.tier === 2 && "bg-primary",
                          tierInfo.tier === 3 && "bg-intermediary",
                        )} />
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-[10px]">
                        {CIRCLE_TIERS[tierInfo.tier as CircleTier].label} · Score {tierInfo.score.toFixed(1)}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )}
                <MemoizedPostCard post={post} />
              </div>
            );
          })}

          {/* Infinite scroll trigger (Recent only) */}
          {filter !== "opinions" && hasMore && (
            <>
              <div ref={observerRef} className="h-4" />
              {!isFetchingMore && (
                <div className="flex justify-center py-4">
                  <button
                    onClick={() => fetchNextPage()}
                    className="px-6 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Load More Posts
                  </button>
                </div>
              )}
            </>
          )}
          {filter !== "opinions" && isFetchingMore && (
            <div className="space-y-4">
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          )}
          {filter !== "opinions" && !hasMore && !isLoading && visiblePosts && visiblePosts.length > 0 && (
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

/** FeedOpinionsTab — Inline opinions content within the Feed page */
function FeedOpinionsTab() {
  const { data: opinions, isLoading } = useOpinions(undefined, "active");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: selectedOpinion } = useOpinionDetail(selectedId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!opinions?.length) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No active opinions"
        description="Professional sentiment polls will appear here when published by the FindOO team."
      />
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-border mb-4">
        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">Professional Opinions</span> — curated BFSI sentiment polls from verified industry experts
        </p>
      </div>
      <div className="grid gap-4">
        {opinions.map((op) => (
          <OpinionCard key={op.id} opinion={op} onOpenDetail={setSelectedId} />
        ))}
      </div>
      <OpinionDetailSheet
        opinionId={selectedId}
        opinion={selectedOpinion || null}
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}

export default Feed;
