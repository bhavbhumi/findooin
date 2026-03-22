/**
 * useViralPosts — Posts from the last 7 days ranked by engagement.
 *
 * Engagement score = likes + (comments × 2). Enriches with author
 * profiles, roles, and interaction counts via parallel queries.
 *
 * `staleTime: 60s`.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FeedPost } from "./useFeedPosts";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useViralPosts() {
  return useQuery({
    queryKey: QUERY_KEYS.viralPosts(),
    queryFn: async (): Promise<FeedPost[]> => {
      // Get posts from last 7 days
      const since = new Date();
      since.setDate(since.getDate() - 7);

      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .gte("created_at", since.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!posts?.length) return [];

      const authorIds = [...new Set(posts.map((p) => p.author_id))];
      const postIds = posts.map((p) => p.id);

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

      const feedPosts: FeedPost[] = posts.map((post) => {
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

      // Sort by total engagement (likes + comments)
      return feedPosts
        .map((p) => ({
          ...p,
          _engagement: p.like_count + p.comment_count * 2,
        }))
        .sort((a, b) => b._engagement - a._engagement)
        .map(({ _engagement, ...p }) => p);
    },
    staleTime: 60_000,
  });
}
