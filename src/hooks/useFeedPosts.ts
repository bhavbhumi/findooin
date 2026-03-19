/**
 * useFeedPosts — Infinite-scroll feed data hook.
 *
 * Uses `useInfiniteQuery` to paginate via the `get_feed_posts` RPC.
 * Returns `flatPosts` (a flattened array of all loaded pages) for
 * consumers like Discover and Profile that need a simple array.
 *
 * Performance notes:
 * - PAGE_SIZE of 15 balances perceived speed vs. network calls
 * - `staleTime: 30s` prevents refetches during rapid tab switches
 * - `refetchOnWindowFocus: false` avoids jarring reloads
 */
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Number of posts fetched per page */
const PAGE_SIZE = 15;

/** Normalized feed post shape used across the entire app */
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
  posted_as_role: string | null;
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

function normalizePosts(data: any[]): FeedPost[] {
  return data.map((p: any) => ({
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
    posted_as_role: p.posted_as_role || null,
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
}

export function useFeedPosts() {
  const query = useInfiniteQuery({
    queryKey: ["feed-posts"],
    queryFn: async ({ pageParam = 0 }): Promise<FeedPost[]> => {
      const { data, error } = await supabase.rpc("get_feed_posts", {
        p_limit: PAGE_SIZE,
        p_offset: pageParam,
      });

      if (error) throw error;
      return normalizePosts((data as any[]) || []);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.reduce((sum, page) => sum + page.length, 0);
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  // Flat array of all loaded posts for consumers that need it
  const flatPosts = query.data?.pages.flat() ?? [];

  return {
    ...query,
    flatPosts,
  };
}
