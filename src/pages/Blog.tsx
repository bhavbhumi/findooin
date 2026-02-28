import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Clock, BookOpen, FileText, BarChart3, ScrollText, Bell, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts, BlogPost, BlogPostType } from "@/hooks/useBlogPosts";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { formatDistanceToNow } from "date-fns";

/* ── Primary tabs map to post_type ── */
const primaryTabs = [
  { key: "article", label: "Articles", icon: FileText },
  { key: "survey", label: "Surveys", icon: BarChart3 },
  { key: "poll", label: "Polls", icon: ScrollText },
  { key: "bulletin", label: "Bulletin", icon: Bell },
];

/* ── Category sub-filters (shared across all tabs) ── */
const CATEGORY_FILTERS = ["All", "General", "Awareness", "Opinion", "Analysis", "Compliance"];

const categoryValueMap: Record<string, string | null> = {
  All: null,
  General: "general",
  Awareness: "awareness",
  Opinion: "opinion",
  Analysis: "analysis",
  Compliance: "compliance",
};

const tabDescriptions: Record<string, string> = {
  article: "Explore insights in text, image, audio, and video formats — learn the way that suits you best.",
  survey: "Participate in surveys and share your perspective on industry trends.",
  poll: "Quick polls on topics that matter — see where the community stands.",
  bulletin: "Important announcements, updates, and time-sensitive information.",
};

/* ── Blog card ── */
function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
    >
      <Link to={`/blog/${post.slug}`} className="group block">
        <div className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-all duration-300 hover:border-primary/20">
          {/* Image */}
          {post.cover_image_url ? (
            <div className="aspect-[16/9] bg-muted overflow-hidden">
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="aspect-[16/9] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-primary/25" />
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                {post.post_type}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {post.category}
              </span>
              {post.featured && (
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0 px-2 py-0">
                  Featured
                </Badge>
              )}
            </div>

            <h3 className="text-base font-semibold font-heading text-card-foreground group-hover:text-primary transition-colors leading-snug mb-2 line-clamp-2">
              {post.title}
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
              {post.excerpt}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="font-medium text-card-foreground">{post.author_name}</span>
                {post.published_at && (
                  <>
                    <span className="text-border">·</span>
                    <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{post.read_time_minutes} min</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const Blog = () => {
  usePageMeta({ title: "Blog", description: "Articles, analysis, reports, and insights from the financial ecosystem." });
  const { data: posts, isLoading } = useBlogPosts();
  const [activeTab, setActiveTab] = useState<string>("article");
  const [activeSubFilter, setActiveSubFilter] = useState("All");

  const ActiveIcon = primaryTabs.find((t) => t.key === activeTab)?.icon || FileText;

  // Filter posts by post_type then category
  const filteredPosts = (() => {
    let result = posts || [];

    // Primary tab = post_type
    result = result.filter((p) => p.post_type === activeTab);

    // Sub-filter = category
    if (activeSubFilter !== "All") {
      const cat = categoryValueMap[activeSubFilter];
      if (cat) {
        result = result.filter((p) => p.category === cat);
      }
    }

    return result;
  })();

  const currentSubFilters = CATEGORY_FILTERS;

  return (
    <PublicPageLayout>
      {/* Hero */}
      <PageHero
        breadcrumb="Blog"
        title="Stay ahead with expert"
        titleAccent="Insights"
        subtitle="Articles, market analysis, research reports, and important bulletins — all in one place."
        variant="waves"
      />

      {/* ── Primary Tabs (sticky) ── */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0 overflow-x-auto scrollbar-hide">
          {primaryTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setActiveSubFilter("All");
              }}
              className={`relative px-5 py-3.5 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="blog-primary-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section header + Sub-filters ── */}
      <section className="pt-8 pb-0">
        <div className="container">
          {/* Section header */}
          <motion.div
            key={activeTab}
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <ActiveIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-heading text-foreground">
                {primaryTabs.find((t) => t.key === activeTab)?.label}
              </h2>
              <p className="text-sm text-muted-foreground">
                {tabDescriptions[activeTab]}
              </p>
            </div>
          </motion.div>

          {/* Sub-filter chips */}
          <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-border">
            {currentSubFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveSubFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  activeSubFilter === filter
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-background text-muted-foreground border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured post hero (if on Articles tab) ── */}
      {activeTab === "article" && !isLoading && (() => {
        const featured = (posts || []).find((p) => p.featured && p.post_type === "article");
        if (!featured) return null;
        return (
          <section className="py-6 border-b border-border">
            <div className="container">
              <Link to={`/blog/${featured.slug}`} className="group block">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-muted border border-border">
                    {featured.cover_image_url ? (
                      <img src={featured.cover_image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                        <BookOpen className="h-16 w-16 text-primary/20" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-0">Featured</Badge>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">{featured.category.replace("-", " ")}</span>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold font-heading text-foreground group-hover:text-primary transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">{featured.author_name}</span>
                      {featured.published_at && (
                        <>
                          <span>·</span>
                          <span>{formatDistanceToNow(new Date(featured.published_at), { addSuffix: true })}</span>
                        </>
                      )}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.read_time_minutes} min</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        );
      })()}

      {/* ── Content grid ── */}
      <section className="py-8 pb-20">
        <div className="container">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                className="flex flex-col items-center justify-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground mt-3">Loading posts...</p>
              </motion.div>
            ) : filteredPosts.length > 0 ? (
              <motion.div
                key={`${activeTab}-${activeSubFilter}`}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filteredPosts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                className="text-center py-20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <BookOpen className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">No posts in this category yet. Check back soon!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Blog;
