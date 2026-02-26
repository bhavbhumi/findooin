import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeedPost {
  id: string;
  content: string;
  post_type: string;
  query_category: string | null;
  hashtags: string[] | null;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    verification_status: string;
  };
  roles: { role: string; sub_type: string | null }[];
  like_count: number;
  comment_count: number;
  bookmark_count: number;
}

export function useFeedPosts() {
  return useQuery({
    queryKey: ["feed-posts"],
    queryFn: async (): Promise<FeedPost[]> => {
      // Fetch published posts (exclude future-scheduled ones)
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .is("scheduled_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch all profiles, roles, interactions, comments in parallel
      const authorIds = [...new Set(posts.map((p) => p.author_id))];
      
      const [profilesRes, rolesRes, interactionsRes, commentsRes] = await Promise.all([
        supabase.from("profiles").select("*").in("id", authorIds),
        supabase.from("user_roles").select("*").in("user_id", authorIds),
        supabase.from("post_interactions").select("post_id, interaction_type"),
        supabase.from("comments").select("post_id"),
      ]);

      const profileMap = new Map(profilesRes.data?.map((p) => [p.id, p]));
      const roleMap = new Map<string, { role: string; sub_type: string | null }[]>();
      rolesRes.data?.forEach((r) => {
        if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
        roleMap.get(r.user_id)!.push({ role: r.role, sub_type: r.sub_type });
      });

      // Count interactions per post
      const likeMap = new Map<string, number>();
      const bookmarkMap = new Map<string, number>();
      interactionsRes.data?.forEach((i) => {
        if (i.interaction_type === "like") {
          likeMap.set(i.post_id, (likeMap.get(i.post_id) || 0) + 1);
        } else if (i.interaction_type === "bookmark") {
          bookmarkMap.set(i.post_id, (bookmarkMap.get(i.post_id) || 0) + 1);
        }
      });

      const commentCountMap = new Map<string, number>();
      commentsRes.data?.forEach((c) => {
        commentCountMap.set(c.post_id, (commentCountMap.get(c.post_id) || 0) + 1);
      });

      return posts.map((post) => {
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
  });
}
