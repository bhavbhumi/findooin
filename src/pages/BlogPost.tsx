import { Link, useParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, BookOpen, Calendar, Heart, Share2, User, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPost } from "@/hooks/useBlogPosts";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { format } from "date-fns";
import { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";

function extractHeadings(html: string) {
  const regex = /<h([2-3])[^>]*>(.*?)<\/h[2-3]>/gi;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    headings.push({ level: parseInt(match[1]), text, id });
  }
  return headings;
}

function injectHeadingIds(html: string) {
  return html.replace(/<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/gi, (_full, level, attrs, inner) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

const BlogPostPage = () => {
  usePageMeta({ title: "Blog Post" });
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug || "");
  const [activeHeading, setActiveHeading] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  const headings = useMemo(() => (post ? extractHeadings(post.content) : []), [post]);
  const processedContent = useMemo(() => (post ? injectHeadingIds(post.content) : ""), [post]);

  useEffect(() => {
    if (!contentRef.current || headings.length === 0) return;
    const observers: IntersectionObserver[] = [];
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveHeading(h.id); },
        { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [headings, processedContent]);

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  }

  return (
    <PublicPageLayout>
      {/* Back link */}
      <div className="border-b border-border bg-background">
        <div className="container py-3">
          <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Insights
            </Link>
          </motion.div>
        </div>
      </div>

      {isLoading ? (
        <div className="container py-10">
          <div className="max-w-5xl mx-auto flex gap-10">
            <div className="hidden lg:block w-72 space-y-4">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            <div className="flex-1 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <div className="space-y-3 pt-4">
                {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
              </div>
            </div>
          </div>
        </div>
      ) : error || !post ? (
        <div className="container py-20 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">Post not found</p>
          <p className="text-sm text-muted-foreground mb-6">The article you're looking for doesn't exist or has been moved.</p>
          <Button variant="outline" asChild>
            <Link to="/blog"><ArrowLeft className="h-4 w-4 mr-2" />Back to Blog</Link>
          </Button>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="container py-8 lg:py-10">
            <div className="flex gap-10 max-w-6xl mx-auto">

              {/* ── Left column: Cover image + sticky Topic Index (desktop) ── */}
              <div className="hidden lg:block w-72 shrink-0">
                {/* Cover image */}
                {post.cover_image_url && (
                  <div className="rounded-xl overflow-hidden border border-border mb-6">
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Divider */}
                <hr className="border-border mb-6" />

                {/* Topic Index — sticky */}
                {headings.length > 0 && (
                  <div className="sticky top-24">
                    <div className="border border-border rounded-xl p-5 bg-card">
                      <div className="flex items-center gap-2 mb-4">
                        <List className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-semibold text-foreground">Topic Index</h3>
                      </div>
                      <nav className="space-y-0.5">
                        {headings.map((h) => (
                          <a
                            key={h.id}
                            href={`#${h.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }}
                            className={`block text-xs leading-relaxed py-1.5 px-3 rounded-md transition-all duration-200 border-l-2 ${
                              activeHeading === h.id
                                ? "border-l-primary text-primary bg-primary/5 font-medium"
                                : "border-l-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            } ${h.level === 3 ? "ml-3 text-[11px]" : ""}`}
                          >
                            {h.text}
                          </a>
                        ))}
                      </nav>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Right column: Article content ── */}
              <article className="flex-1 min-w-0">
                {/* Category badges */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-xs font-medium text-primary border-primary/30 bg-primary/5">
                    {post.category.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </Badge>
                  {post.featured && (
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">Featured</Badge>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-[36px] font-bold font-heading text-foreground leading-tight mb-5">
                  {post.title}
                </h1>

                {/* Meta row */}
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    {post.author_avatar_url ? (
                      <img src={post.author_avatar_url} alt={post.author_name} className="h-6 w-6 rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="font-medium text-foreground">{post.author_name}</span>
                  </div>
                  {post.published_at && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(post.published_at), "d MMMM yyyy")}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {post.read_time_minutes} min read
                  </div>
                  <div className="flex-1" />
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs rounded-full">
                      <Heart className="h-3.5 w-3.5" /> Like
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs rounded-full" onClick={handleShare}>
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </Button>
                  </div>
                </div>

                {/* Excerpt */}
                {post.excerpt && (
                  <div className="border-l-4 border-primary/30 pl-5 py-3 mb-8 bg-muted/30 rounded-r-lg">
                    <p className="text-base italic text-muted-foreground leading-relaxed">{post.excerpt}</p>
                  </div>
                )}

                {/* Mobile cover image */}
                {post.cover_image_url && (
                  <div className="lg:hidden rounded-xl overflow-hidden border border-border mb-8">
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-auto object-cover" />
                  </div>
                )}

                <hr className="border-border mb-8" />

                {/* Content */}
                <div
                  ref={contentRef}
                  className="prose prose-lg max-w-none text-card-foreground leading-relaxed
                    prose-headings:font-heading prose-headings:text-foreground prose-headings:scroll-mt-24
                    prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-border
                    prose-h3:text-lg prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
                    prose-p:mb-4 prose-p:text-card-foreground/90
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-img:rounded-xl prose-img:border prose-img:border-border
                    prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-1 prose-blockquote:text-muted-foreground prose-blockquote:italic
                    prose-li:marker:text-primary
                    prose-ul:my-4 prose-ol:my-4 prose-li:my-1
                    prose-hr:border-border
                    prose-table:border prose-table:border-border prose-table:rounded-lg prose-table:overflow-hidden
                    prose-thead:bg-muted/50
                    prose-th:text-xs prose-th:font-semibold prose-th:uppercase prose-th:tracking-wider prose-th:text-foreground prose-th:px-4 prose-th:py-3 prose-th:border-b prose-th:border-border
                    prose-td:px-4 prose-td:py-2.5 prose-td:border-b prose-td:border-border prose-td:text-sm"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
                    {post.tags.map((tag) => (
                      <span key={tag} className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full border border-border">
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
              </article>
            </div>
          </div>
        </motion.div>
      )}
    </PublicPageLayout>
  );
};

export default BlogPostPage;
