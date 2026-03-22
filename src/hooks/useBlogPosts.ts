/**
 * useBlogPosts — Public blog content hooks.
 *
 * Two exports:
 * - `useBlogPosts(limit?)` — paginated list of published posts
 * - `useBlogPost(slug)` — single post by URL slug
 *
 * Blog posts are managed by admins via the Admin CMS panel.
 * Only published posts are returned (RLS enforced).
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

export type BlogPostType = "article" | "survey" | "poll" | "bulletin";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  category: string;
  post_type: BlogPostType;
  tags: string[];
  author_name: string;
  author_avatar_url: string | null;
  published: boolean;
  featured: boolean;
  read_time_minutes: number;
  created_at: string;
  published_at: string | null;
}

export function useBlogPosts(limit?: number) {
  return useQuery({
    queryKey: QUERY_KEYS.blogPosts(limit),
    queryFn: async () => {
      let query = supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false, nullsFirst: false });

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data as BlogPost[];
    },
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: QUERY_KEYS.blogPost(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
}
