import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPost } from "@/hooks/useBlogPosts";
import findooLogo from "@/assets/findoo-logo-icon.png";
import { format } from "date-fns";

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={findooLogo} alt="FindOO" className="h-8 w-8" />
            <span className="text-xl font-bold font-heading text-foreground tracking-tight">FindOO</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/blog">Blog</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="container pt-28 pb-20">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Blog
          </Link>
        </Button>

        {isLoading ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <div className="space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        ) : error || !post ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Post not found.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link to="/blog">Browse all posts</Link>
            </Button>
          </div>
        ) : (
          <motion.article
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Badge variant="secondary" className="text-xs font-semibold uppercase tracking-wider mb-4">
              {post.category.replace("-", " ")}
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-foreground leading-tight mb-4">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="font-medium text-foreground">{post.author_name}</span>
              {post.published_at && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {format(new Date(post.published_at), "MMM d, yyyy")}
                  </div>
                </>
              )}
              <span>·</span>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.read_time_minutes} min read
              </div>
            </div>

            {post.cover_image_url && (
              <div className="rounded-xl overflow-hidden mb-10">
                <img src={post.cover_image_url} alt={post.title} className="w-full h-auto" />
              </div>
            )}

            <div className="prose prose-lg max-w-none text-card-foreground leading-relaxed whitespace-pre-line">
              {post.content}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.article>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
