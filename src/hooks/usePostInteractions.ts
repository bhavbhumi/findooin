import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function usePostInteractions(postId: string) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUserId(session.user.id);
        loadUserInteractions(session.user.id);
      }
    });
  }, [postId]);

  const loadUserInteractions = async (userId: string) => {
    const { data } = await supabase
      .from("post_interactions")
      .select("interaction_type")
      .eq("post_id", postId)
      .eq("user_id", userId);

    data?.forEach((i) => {
      if (i.interaction_type === "like") setLiked(true);
      if (i.interaction_type === "bookmark") setBookmarked(true);
    });
  };

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
