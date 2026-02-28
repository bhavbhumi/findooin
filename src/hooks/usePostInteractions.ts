/**
 * usePostInteractions — Like/Bookmark hook with optimistic updates.
 *
 * Key patterns:
 * 1. **Batch loader**: When multiple PostCards mount simultaneously, their
 *    interaction checks are coalesced into a single DB query (50ms debounce).
 *    This prevents N+1 queries when rendering a feed page.
 *
 * 2. **Optimistic updates**: `toggleLike` / `toggleBookmark` immediately
 *    update local state AND the React Query cache (feed-posts, trending-posts,
 *    viral-posts). On server failure, both are rolled back.
 *
 * 3. **Cache updater**: `optimisticUpdateFeedCache` patches infinite query
 *    pages in-place so counts update without refetching.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import type { FeedPost } from "@/hooks/useFeedPosts";

// ── Batch loader: coalesces per-post interaction checks into a single DB call ──
let batchQueue: { postId: string; userId: string; resolve: (result: { liked: boolean; bookmarked: boolean }) => void }[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleBatch() {
  if (batchTimer) return;
  batchTimer = setTimeout(async () => {
    const batch = batchQueue.splice(0);
    batchTimer = null;
    if (!batch.length) return;

    const userId = batch[0].userId;
    const postIds = [...new Set(batch.map((b) => b.postId))];

    const { data } = await supabase
      .from("post_interactions")
      .select("post_id, interaction_type")
      .eq("user_id", userId)
      .in("post_id", postIds);

    const resultMap = new Map<string, { liked: boolean; bookmarked: boolean }>();
    postIds.forEach((id) => resultMap.set(id, { liked: false, bookmarked: false }));
    data?.forEach((i) => {
      const entry = resultMap.get(i.post_id);
      if (entry) {
        if (i.interaction_type === "like") entry.liked = true;
        if (i.interaction_type === "bookmark") entry.bookmarked = true;
      }
    });

    batch.forEach((b) => b.resolve(resultMap.get(b.postId) || { liked: false, bookmarked: false }));
  }, 50);
}

function batchLoadInteraction(postId: string, userId: string): Promise<{ liked: boolean; bookmarked: boolean }> {
  return new Promise((resolve) => {
    batchQueue.push({ postId, userId, resolve });
    scheduleBatch();
  });
}

// ── Optimistic cache updater ──
function optimisticUpdateFeedCache(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  updater: (post: FeedPost) => FeedPost
) {
  // Update infinite query cache (feed-posts)
  queryClient.setQueriesData<InfiniteData<FeedPost[]>>(
    { queryKey: ["feed-posts"] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) =>
          page.map((post) => (post.id === postId ? updater(post) : post))
        ),
      };
    }
  );

  // Also update trending/viral caches which use flat arrays
  for (const key of ["trending-posts", "viral-posts"]) {
    queryClient.setQueriesData<FeedPost[]>(
      { queryKey: [key] },
      (old) => old?.map((post) => (post.id === postId ? updater(post) : post))
    );
  }
}

// ── Hook ──
export function usePostInteractions(postId: string) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUserId(session.user.id);
        batchLoadInteraction(postId, session.user.id).then((result) => {
          if (mountedRef.current) {
            setLiked(result.liked);
            setBookmarked(result.bookmarked);
          }
        });
      }
    });
  }, [postId]);

  const toggleLike = useCallback(async () => {
    if (!currentUserId || loading) return;
    const wasLiked = liked;
    
    // Optimistic update
    setLiked(!wasLiked);
    optimisticUpdateFeedCache(queryClient, postId, (post) => ({
      ...post,
      like_count: post.like_count + (wasLiked ? -1 : 1),
    }));

    try {
      if (wasLiked) {
        await supabase
          .from("post_interactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUserId)
          .eq("interaction_type", "like");
      } else {
        await supabase.from("post_interactions").insert({
          post_id: postId,
          user_id: currentUserId,
          interaction_type: "like",
        });
      }
    } catch {
      // Rollback on failure
      setLiked(wasLiked);
      optimisticUpdateFeedCache(queryClient, postId, (post) => ({
        ...post,
        like_count: post.like_count + (wasLiked ? 1 : -1),
      }));
    }
  }, [currentUserId, postId, loading, liked, queryClient]);

  const toggleBookmark = useCallback(async () => {
    if (!currentUserId || loading) return;
    const wasBookmarked = bookmarked;
    
    // Optimistic update
    setBookmarked(!wasBookmarked);
    optimisticUpdateFeedCache(queryClient, postId, (post) => ({
      ...post,
      bookmark_count: post.bookmark_count + (wasBookmarked ? -1 : 1),
    }));

    try {
      if (wasBookmarked) {
        await supabase
          .from("post_interactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUserId)
          .eq("interaction_type", "bookmark");
      } else {
        await supabase.from("post_interactions").insert({
          post_id: postId,
          user_id: currentUserId,
          interaction_type: "bookmark",
        });
      }
    } catch {
      // Rollback on failure
      setBookmarked(wasBookmarked);
      optimisticUpdateFeedCache(queryClient, postId, (post) => ({
        ...post,
        bookmark_count: post.bookmark_count + (wasBookmarked ? 1 : -1),
      }));
    }
  }, [currentUserId, postId, loading, bookmarked, queryClient]);

  return { liked, bookmarked, currentUserId, toggleLike, toggleBookmark, loading };
}
