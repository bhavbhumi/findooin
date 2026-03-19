/**
 * useTrendingPosts — Posts containing the top 5 hashtags from the last 7 days.
 *
 * Algorithm: Count hashtag frequency across recent posts → find top 5 →
 * return posts that contain at least one trending tag. Enriches with
 * author profiles, roles, and interaction counts via parallel queries.
 *
 * `staleTime: 60s` to avoid excessive recalculation.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FeedPost } from "./useFeedPosts";

export function useTrendingPosts() {
  return useQuery({
    queryKey: ["trending-posts"],
    queryFn: async (): Promise<FeedPost[]> => {
      const since = new Date();
      since.setDate(since.getDate() - 7);

      // Get trending hashtags first
      const { data: allPosts, error: postsError } = await supabase
        .from("posts")
        .select("*")
        .gte("created_at", since.toISOString())
        .not("hashtags", "is", null)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      if (!allPosts?.length) return [];

      // Find most-used hashtags
      const freq = new Map<string, number>();
      allPosts.forEach((p) => {
        (p.hashtags as string[])?.forEach((tag) => {
          const n = tag.startsWith("#") ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
          freq.set(n, (freq.get(n) || 0) + 1);
        });
      });
      const topTags = new Set(
        [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t)
      );

      // Filter posts that have at least one trending tag
      const trendingPosts = allPosts.filter((p) =>
        (p.hashtags as string[])?.some((t) => {
          const n = t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`;
          return topTags.has(n);
        })
      );

      if (!trendingPosts.length) return [];

      const authorIds = [...new Set(trendingPosts.map((p) => p.author_id))];
      const postIds = trendingPosts.map((p) => p.id);

      const [profilesRes, rolesRes, interactionsRes, commentsRes] = await Promise.all([
        supabase.from("profiles").select("*").in("id", authorIds),
        supabase.from("user_roles").select("*").in("user_id", authorIds),
        supabase.from("post_interactions").select("post_id, interaction_type").in("post_id", postIds),
        supabase.from("comments").select("post_id").in("post_id", postIds),
      ]);

      const profileMap = new Map(profilesRes.data?.map((p) => [p.id, p]));
      const roleMap = new Map<string, { role: string; sub_type: string | null }[]>();
      rolesRes.data?.forEach((r) => {
        if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
        roleMap.get(r.user_id)!.push({ role: r.role, sub_type: r.sub_type });
      });

      const likeMap = new Map<string, number>();
      const bookmarkMap = new Map<string, number>();
      interactionsRes.data?.forEach((i) => {
        if (i.interaction_type === "like") likeMap.set(i.post_id, (likeMap.get(i.post_id) || 0) + 1);
        else if (i.interaction_type === "bookmark") bookmarkMap.set(i.post_id, (bookmarkMap.get(i.post_id) || 0) + 1);
      });

      const commentCountMap = new Map<string, number>();
      commentsRes.data?.forEach((c) => {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
      });

      return trendingPosts.map((post) => {
        const profile = profileMap.get(post.author_id);
        return {
          id: post.id,
          content: post.content,
          post_type: post.post_type,
          query_category: post.query_category || null,
          hashtags: post.hashtags,
          attachment_url: post.attachment_url,
          attachment_name: post.attachment_name,
          attachment_type: post.attachment_type,
          created_at: post.created_at,
          posted_as_role: (post as any).posted_as_role || null,
          author: {
            id: post.author_id,
            full_name: profile?.full_name || "Unknown",
            display_name: profile?.display_name,
            avatar_url: profile?.avatar_url,
            verification_status: profile?.verification_status || "unverified",
          },
          roles: roleMap.get(post.author_id) || [],
          like_count: likeMap.get(post.id) || 0,
          comment_count: commentCountMap.get(post.id) || 0,
          bookmark_count: bookmarkMap.get(post.id) || 0,
        };
      });
    },
    staleTime: 60_000,
  });
}
