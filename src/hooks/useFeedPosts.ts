import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeedPost {
  id: string;
  content: string;
  post_type: string;
  post_kind?: string;
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
      const { data, error } = await supabase.rpc("get_feed_posts", {
        p_limit: 50,
        p_offset: 0,
      });

      if (error) throw error;

      // RPC returns JSON — parse and normalize
      const posts = (data as any[]) || [];
      return posts.map((p: any) => ({
        id: p.id,
        content: p.content,
        post_type: p.post_type,
        post_kind: p.post_kind,
        query_category: p.query_category || null,
        hashtags: p.hashtags,
        attachment_url: p.attachment_url,
        attachment_name: p.attachment_name,
        attachment_type: p.attachment_type,
        created_at: p.created_at,
        author: {
          id: p.author?.id || "",
          full_name: p.author?.full_name || "Unknown",
          display_name: p.author?.display_name || null,
          avatar_url: p.author?.avatar_url || null,
          verification_status: p.author?.verification_status || "unverified",
        },
        roles: p.roles || [],
        like_count: Number(p.like_count) || 0,
        comment_count: Number(p.comment_count) || 0,
        bookmark_count: Number(p.bookmark_count) || 0,
      }));
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
