import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Calendar, ChevronRight, Share2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { format } from "date-fns";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");

  return (
    <PublicPageLayout>
      {/* Breadcrumb bar */}
      <div className="border-b border-border bg-gradient-to-b from-primary/[0.03] to-transparent">
        <div className="container py-4">
          <motion.div
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
              {isLoading ? "Loading..." : post?.title || "Post"}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="container py-10">
        {isLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-80 w-full rounded-xl" />
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : error || !post ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground mb-1">Post not found</p>
            <p className="text-sm text-muted-foreground mb-6">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <Button variant="outline" asChild>
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        ) : (
          <motion.article
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Category */}
            <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-4 block">
              {post.category.replace("-", " ")}
            </span>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold font-heading text-foreground leading-tight mb-5">
              {post.title}
            </h1>

            {/* Meta row */}
            <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-8 pb-6 border-b border-border">
              <div className="flex items-center gap-2">
                {post.author_avatar_url && (
                  <img src={post.author_avatar_url} alt={post.author_name} className="h-7 w-7 rounded-full object-cover" />
                )}
                <span className="font-medium text-foreground">{post.author_name}</span>
              </div>
              {post.published_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(post.published_at), "MMM d, yyyy")}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.read_time_minutes} min read
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Bookmark className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Cover image */}
            {post.cover_image_url && (
              <div className="rounded-xl overflow-hidden mb-10 border border-border">
                <img src={post.cover_image_url} alt={post.title} className="w-full h-auto" />
              </div>
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none text-card-foreground leading-relaxed
                prose-headings:font-heading prose-headings:text-foreground
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-img:rounded-xl prose-img:border prose-img:border-border
                prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground
                prose-li:marker:text-primary prose-hr:border-border"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Back link */}
            <div className="mt-10 pt-6 border-t border-border">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to all posts
                </Link>
              </Button>
            </div>
          </motion.article>
        )}
      </div>
    </PublicPageLayout>
  );
};

export default BlogPostPage;
