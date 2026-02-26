import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Clock, BookOpen, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBlogPosts, BlogPost } from "@/hooks/useBlogPosts";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { formatDistanceToNow } from "date-fns";

const categoryColors: Record<string, string> = {
  regulation: "bg-destructive/10 text-destructive",
  investing: "bg-accent/10 text-accent",
  "market-insights": "bg-primary/10 text-primary",
  general: "bg-muted text-muted-foreground",
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

const tabs = ["Articles", "Market Insights", "Regulation"];
const categoryMap: Record<string, string | null> = {
  "Articles": null,
  "Market Insights": "market-insights",
  "Regulation": "regulation",
};

function BlogCard({ post, index, size = "normal" }: { post: BlogPost; index: number; size?: "featured" | "normal" }) {
  const isFeatured = size === "featured";

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={index}
      className={`group break-inside-avoid mb-5 ${isFeatured ? "col-span-full" : ""}`}
    >
      <Link to={`/blog/${post.slug}`}>
        <div className={`rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${isFeatured ? "md:flex" : ""}`}>
          {post.cover_image_url ? (
            <div className={`bg-muted overflow-hidden ${isFeatured ? "md:w-1/2 h-64 md:h-auto" : "h-40"}`}>
              <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
          ) : (
            <div className={`bg-gradient-to-br from-primary/5 to-primary/15 flex items-center justify-center ${isFeatured ? "md:w-1/2 h-48 md:h-auto" : "h-32"}`}>
              <BookOpen className={`text-primary/30 ${isFeatured ? "h-16 w-16" : "h-10 w-10"}`} />
            </div>
          )}

          <div className={`p-5 ${isFeatured ? "md:w-1/2 md:p-8 flex flex-col justify-center" : ""}`}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="secondary" className={`text-[10px] font-semibold uppercase tracking-wider ${categoryColors[post.category] || categoryColors.general}`}>
                {post.category.replace("-", " ")}
              </Badge>
              {post.featured && <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">Featured</Badge>}
            </div>

            <h3 className={`font-bold font-heading text-card-foreground group-hover:text-primary transition-colors leading-snug mb-2 ${isFeatured ? "text-2xl md:text-3xl" : "text-lg"}`}>
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
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts();
  const [activeTab, setActiveTab] = useState("Articles");

  const filterCategory = categoryMap[activeTab];
  const filteredPosts = filterCategory
    ? posts?.filter((p) => p.category === filterCategory)
    : posts;

  const featured = filteredPosts?.filter((p) => p.featured) || [];
  const regular = filteredPosts?.filter((p) => !p.featured) || [];

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Blog"
        title="Stay ahead with expert"
        titleAccent="Insights"
        subtitle="Articles, market analysis, and regulatory updates — all in one place."
        decoration={
          <svg width="160" height="160" viewBox="0 0 160 160" className="text-primary">
            <circle cx="100" cy="60" r="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
            <circle cx="110" cy="50" r="30" fill="currentColor" opacity="0.04" />
          </svg>
        }
      />

      {/* Tabs */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="blog-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <section className="pt-8 pb-0">
        <div className="container">
          <motion.div className="flex items-center gap-3 mb-6 pb-6 border-b border-border"
            initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-foreground">{activeTab}</h3>
              <p className="text-sm text-muted-foreground">Explore insights and stay informed with the latest updates.</p>
            </div>
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
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts && filteredPosts.length > 0 ? (
            <>
              {featured.length > 0 && (
                <div className="mb-8">
                  {featured.map((post, i) => (
                    <BlogCard key={post.id} post={post} index={i} size="featured" />
                  ))}
                </div>
              )}
              <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
                {regular.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i + featured.length} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No posts in this category yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Blog;
