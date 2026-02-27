import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Clock, BookOpen, FileText, BarChart3, ScrollText, Bell, Shield, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { formatDistanceToNow } from "date-fns";

/* ── Primary tabs (top-level categories like Sernet) ── */
const primaryTabs = [
  { key: "articles", label: "Articles", icon: FileText },
  { key: "analysis", label: "Analysis", icon: BarChart3 },
  { key: "reports", label: "Reports", icon: ScrollText },
  { key: "bulletin", label: "Bulletin", icon: Bell },
  { key: "awareness", label: "Awareness", icon: Shield },
];

/* ── Map primary tabs to actual DB categories ── */
const tabCategoryMap: Record<string, string | null> = {
  articles: null, // show all
  analysis: "market-insights",
  reports: "regulation",
  bulletin: "investing",
  awareness: "general",
};

/* ── Sub-filter chips per tab ── */
const subFilters: Record<string, string[]> = {
  articles: ["All", "Market Insights", "Regulation", "Investing", "General"],
  analysis: ["All", "Equity", "Debt", "Commodities"],
  reports: ["All", "Quarterly", "Annual", "Special"],
  bulletin: ["All", "Updates", "Announcements"],
  awareness: ["All", "Basics", "Advanced"],
};

const tabDescriptions: Record<string, string> = {
  articles: "Explore insights in text, image, audio, and video formats — learn the way that suits you best.",
  analysis: "Deep-dive market analysis and expert commentary on trends shaping the financial landscape.",
  reports: "Regulatory updates, compliance changes, and policy insights you need to know.",
  bulletin: "Important announcements, updates, and time-sensitive information.",
  awareness: "Educational content to help you make informed financial decisions.",
};

/* ── Sub-filter to category mapping ── */
const subFilterCategoryMap: Record<string, string | null> = {
  "All": null,
  "Market Insights": "market-insights",
  "Regulation": "regulation",
  "Investing": "investing",
  "General": "general",
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
                {post.category.replace("-", " ")}
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
  const { data: posts, isLoading } = useBlogPosts();
  const [activeTab, setActiveTab] = useState("articles");
  const [activeSubFilter, setActiveSubFilter] = useState("All");

  const ActiveIcon = primaryTabs.find((t) => t.key === activeTab)?.icon || FileText;

  // Filter posts
  const filteredPosts = (() => {
    let result = posts || [];

    // Primary tab filter
    const tabCategory = tabCategoryMap[activeTab];
    if (tabCategory) {
      result = result.filter((p) => p.category === tabCategory);
    }

    // Sub-filter (only for articles tab where we have real mappings)
    if (activeTab === "articles" && activeSubFilter !== "All") {
      const subCat = subFilterCategoryMap[activeSubFilter];
      if (subCat) {
        result = result.filter((p) => p.category === subCat);
      }
    }

    return result;
  })();

  const currentSubFilters = subFilters[activeTab] || [];

  return (
    <PublicPageLayout>
      {/* Hero */}
      <PageHero
        breadcrumb="Blog"
        title="Stay ahead with expert"
        titleAccent="Insights"
        subtitle="Articles, market analysis, research reports, and important bulletins — all in one place."
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
