import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

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
  }, 50); // 50ms debounce window to collect all PostCards
}

function batchLoadInteraction(postId: string, userId: string): Promise<{ liked: boolean; bookmarked: boolean }> {
  return new Promise((resolve) => {
    batchQueue.push({ postId, userId, resolve });
    scheduleBatch();
  });
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

  const toggleInteraction = useCallback(async (type: string, current: boolean, setter: (v: boolean) => void) => {
    if (!currentUserId || loading) return;
    setLoading(true);
    if (current) {
      await supabase
        .from("post_interactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", currentUserId)
        .eq("interaction_type", type);
      setter(false);
    } else {
      await supabase.from("post_interactions").insert({
        post_id: postId,
        user_id: currentUserId,
        interaction_type: type,
      });
      setter(true);
    }
    queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    setLoading(false);
  }, [currentUserId, postId, loading, queryClient]);

  const toggleLike = useCallback(() => toggleInteraction("like", liked, setLiked), [toggleInteraction, liked]);
  const toggleBookmark = useCallback(() => toggleInteraction("bookmark", bookmarked, setBookmarked), [toggleInteraction, bookmarked]);

  return { liked, bookmarked, currentUserId, toggleLike, toggleBookmark, loading };
}
