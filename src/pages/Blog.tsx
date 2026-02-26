import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Tag, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import findooLogo from "@/assets/findoo-logo-icon.png";
import { formatDistanceToNow } from "date-fns";

const categoryColors: Record<string, string> = {
  regulation: "bg-destructive/10 text-destructive",
  investing: "bg-accent/10 text-accent",
  "market-insights": "bg-gold/10 text-gold",
  general: "bg-muted text-muted-foreground",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

function BlogCard({ post, index, size = "normal" }: { post: BlogPost; index: number; size?: "featured" | "normal" }) {
  const isFeatured = size === "featured";
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      custom={index}
      className={`group break-inside-avoid mb-5 ${isFeatured ? "col-span-full" : ""}`}
    >
      <Link to={`/blog/${post.slug}`}>
        <div className={`rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${isFeatured ? "md:flex" : ""}`}>
          {/* Cover image placeholder */}
          {post.cover_image_url ? (
            <div className={`bg-muted overflow-hidden ${isFeatured ? "md:w-1/2 h-64 md:h-auto" : "h-40"}`}>
              <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ) : (
            <div className={`bg-gradient-to-br from-accent/5 to-accent/15 flex items-center justify-center ${isFeatured ? "md:w-1/2 h-48 md:h-auto" : "h-32"}`}>
              <BookOpen className={`text-accent/30 ${isFeatured ? "h-16 w-16" : "h-10 w-10"}`} />
            </div>
          )}

          <div className={`p-5 ${isFeatured ? "md:w-1/2 md:p-8 flex flex-col justify-center" : ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className={`text-[10px] font-semibold uppercase tracking-wider ${categoryColors[post.category] || categoryColors.general}`}>
                {post.category.replace("-", " ")}
              </Badge>
              {post.featured && (
                <Badge variant="secondary" className="text-[10px] bg-gold/10 text-gold">Featured</Badge>
              )}
            </div>

            <h3 className={`font-bold font-heading text-card-foreground group-hover:text-accent transition-colors leading-snug mb-2 ${isFeatured ? "text-2xl md:text-3xl" : "text-lg"}`}>
              {post.title}
            </h3>

            <p className={`text-muted-foreground leading-relaxed mb-4 ${isFeatured ? "text-base line-clamp-3" : "text-sm line-clamp-2"}`}>
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="font-medium text-card-foreground">{post.author_name}</span>
                {post.published_at && (
                  <>
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{post.read_time_minutes} min read</span>
              </div>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts();

  const featured = posts?.filter((p) => p.featured) || [];
  const regular = posts?.filter((p) => !p.featured) || [];

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
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-12">
        <div className="container">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-4">
              FindOO <span className="text-accent">Blog</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Insights, analysis, and updates from India's financial ecosystem. 
              Stay informed about regulations, market trends, and investment strategies.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container">
          {isLoading ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="break-inside-avoid mb-5 rounded-xl border border-border bg-card overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <>
              {/* Featured posts */}
              {featured.length > 0 && (
                <div className="mb-8">
                  {featured.map((post, i) => (
                    <BlogCard key={post.id} post={post} index={i} size="featured" />
                  ))}
                </div>
              )}

              {/* Masonry grid */}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
                {regular.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i + featured.length} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={findooLogo} alt="FindOO" className="h-6 w-6" />
            <span className="text-sm font-semibold font-heading text-foreground">FindOO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} FindOO. India's regulated financial network.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
