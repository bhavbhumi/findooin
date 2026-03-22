/**
 * useTrendingHashtags — Top 10 hashtags by frequency over a time window.
 *
 * Scans all posts with hashtags from the last N days (default 7),
 * normalizes tags to lowercase with # prefix, and returns sorted
 * by frequency. `staleTime: 60s`.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface TrendingHashtag {
  tag: string;
  count: number;
}

export function useTrendingHashtags(days = 7) {
  return useQuery({
    queryKey: ["trending-hashtags", days],
    queryFn: async (): Promise<TrendingHashtag[]> => {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const { data: posts, error } = await supabase
        .from("posts")
        .select("hashtags")
        .gte("created_at", since.toISOString())
        .not("hashtags", "is", null);

      if (error) throw error;

      const freq = new Map<string, number>();
      posts?.forEach((p) => {
        (p.hashtags as string[])?.forEach((tag) => {
          const normalized = tag.startsWith("#") ? tag.toLowerCase() : `#${tag.toLowerCase()}`;
          freq.set(normalized, (freq.get(normalized) || 0) + 1);
        });
      });

      return [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }));
    },
    staleTime: 60_000,
  });
}
