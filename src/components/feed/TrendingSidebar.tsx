import { TrendingUp, Flame } from "lucide-react";
import { useTrendingHashtags } from "@/hooks/useTrendingHashtags";
import { useViralPosts } from "@/hooks/useViralPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export function TrendingSidebar() {
  const { data: hashtags, isLoading: hashtagsLoading } = useTrendingHashtags(7);
  const { data: viralPosts, isLoading: viralLoading } = useViralPosts();

  const topViral = viralPosts?.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Trending Hashtags */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold font-heading text-card-foreground text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-accent" />
          Trending
        </h3>

        {hashtagsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        ) : hashtags && hashtags.length > 0 ? (
          <div className="space-y-3">
            {hashtags.map((topic, idx) => (
              <div key={topic.tag} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground w-4">{idx + 1}</span>
                  <span className="text-sm font-medium text-accent group-hover:underline">{topic.tag}</span>
                </div>
                <span className="text-xs text-muted-foreground">{topic.count} {topic.count === 1 ? "post" : "posts"}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No trending topics yet.</p>
        )}
      </div>

      {/* Viral Posts */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold font-heading text-card-foreground text-sm mb-4 flex items-center gap-2">
          <Flame className="h-4 w-4 text-destructive" />
          Viral
        </h3>

        {viralLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : topViral && topViral.length > 0 ? (
          <div className="space-y-3">
            {topViral.map((post) => {
              const engagement = post.like_count + post.comment_count + post.repost_count;
              return (
                <div key={post.id} className="group cursor-pointer">
                  <p className="text-xs text-card-foreground line-clamp-2 group-hover:text-accent transition-colors">
                    {post.content.slice(0, 100)}{post.content.length > 100 ? "…" : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                    <span>{post.author.display_name || post.author.full_name}</span>
                    <span>·</span>
                    <span>{engagement} reactions</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No viral posts yet.</p>
        )}
      </div>
    </div>
  );
}
