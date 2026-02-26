import { BookOpen, ArrowRight, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export function BlogSidebarWidget() {
  const { data: posts, isLoading } = useBlogPosts(4);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold font-heading text-card-foreground text-sm flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-accent" />
          From the Blog
        </h3>
        <Link to="/blog" className="text-[10px] font-medium text-accent hover:underline flex items-center gap-0.5">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.slug}`}
              className="block group"
            >
              <p className="text-xs font-medium text-card-foreground line-clamp-2 group-hover:text-accent transition-colors">
                {post.title}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                <span className="capitalize">{post.category.replace("-", " ")}</span>
                <span>·</span>
                <div className="flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {post.read_time_minutes}m
                </div>
                {post.published_at && (
                  <>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">No blog posts yet.</p>
      )}
    </div>
  );
}
