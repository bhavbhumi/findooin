/**
 * SupportCategory — Category detail page with sidebar + article view.
 * Routes: /support/:categorySlug and /support/:categorySlug?article=slug
 */
import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState, useEffect } from "react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search, BookOpen, ChevronRight, ChevronDown, ChevronUp, Clock, ThumbsUp,
  ArrowLeft, Send, Phone, Download, ExternalLink
} from "lucide-react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useKBArticles, type KBArticle } from "@/hooks/useKnowledgeBase";
import { KB_CATEGORIES } from "@/pages/Support";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: "easeOut" as const },
  }),
};

// Simple markdown renderer
function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-bold font-heading text-foreground mt-6 mb-2">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-semibold text-foreground mt-4 mb-1.5">{line.slice(4)}</h3>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="text-sm text-muted-foreground ml-4 list-disc">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(line.slice(2)) }} />
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <li key={i} className="text-sm text-muted-foreground ml-4 list-decimal">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(line.replace(/^\d+\.\s/, "")) }} />
        </li>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          <span dangerouslySetInnerHTML={{ __html: inlineMarkdown(line) }} />
        </p>
      );
    }
    i++;
  }
  return elements;
}

function inlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong class='text-foreground font-medium'>$1</strong>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline underline-offset-2">$1</a>');
}

const SupportCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const articleSlug = searchParams.get("article");
  const [filter, setFilter] = useState("");
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set());

  // Find category metadata
  const categoryEntry = Object.entries(KB_CATEGORIES).find(([, v]) => v.slug === categorySlug);
  const categoryKey = categoryEntry?.[0] || categorySlug || "";
  const catMeta = categoryEntry?.[1] || { icon: BookOpen, title: categorySlug || "Articles", desc: "", slug: categorySlug || "", color: "text-primary" };
  const CatIcon = catMeta.icon;

  usePageMeta({ title: `${catMeta.title} — Support`, description: catMeta.desc });

  // Fetch articles for this category
  const { data: allArticles = [] } = useKBArticles(categoryKey);

  // Group by subcategory
  const subcategoryMap: Record<string, KBArticle[]> = {};
  allArticles.forEach((a) => {
    const sub = (a as any).subcategory || "General";
    if (!subcategoryMap[sub]) subcategoryMap[sub] = [];
    subcategoryMap[sub].push(a);
  });
  const subcategories = Object.entries(subcategoryMap).sort(([a], [b]) => a.localeCompare(b));

  // Initialize expanded subcategories
  useEffect(() => {
    if (subcategories.length > 0 && expandedSubs.size === 0) {
      setExpandedSubs(new Set([subcategories[0][0]]));
    }
  }, [subcategories.length]);

  // Filter articles
  const filteredArticles = filter
    ? allArticles.filter((a) => a.title.toLowerCase().includes(filter.toLowerCase()))
    : allArticles;

  // Selected article
  const selectedArticle = articleSlug ? allArticles.find((a) => a.slug === articleSlug) : null;

  const toggleSub = (sub: string) => {
    setExpandedSubs((prev) => {
      const next = new Set(prev);
      if (next.has(sub)) next.delete(sub); else next.add(sub);
      return next;
    });
  };

  // Increment view count
  useEffect(() => {
    if (selectedArticle) {
      supabase.from("kb_articles").update({ view_count: selectedArticle.view_count + 1 }).eq("id", selectedArticle.id).then(() => {});
    }
  }, [selectedArticle?.id]);

  return (
    <PublicPageLayout>
      {/* Breadcrumbs */}
      <div className="border-b border-border">
        <div className="container py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/support" className="hover:text-foreground transition-colors">Support</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{catMeta.title}</span>
            {selectedArticle && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground font-medium truncate max-w-[200px]">{selectedArticle.title}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            {/* Category info card */}
            <div className="rounded-xl border border-border bg-card p-5 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ${catMeta.color}`}>
                  <CatIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className={`text-base font-bold font-heading ${catMeta.color}`}>{catMeta.title}</h2>
                  <p className="text-xs text-muted-foreground">{allArticles.length} articles</p>
                </div>
              </div>
            </div>

            {/* Filter */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter articles..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            {/* Subcategory accordion */}
            <nav className="space-y-1">
              {subcategories.map(([sub, articles]) => {
                const isExpanded = expandedSubs.has(sub);
                const filteredSubArticles = filter
                  ? articles.filter((a) => a.title.toLowerCase().includes(filter.toLowerCase()))
                  : articles;
                if (filter && filteredSubArticles.length === 0) return null;

                return (
                  <div key={sub}>
                    <button
                      onClick={() => toggleSub(sub)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate">{sub}</span>
                        <Badge variant="secondary" className="text-[9px] shrink-0">{filteredSubArticles.length}</Badge>
                      </div>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 pl-4 border-l border-border space-y-0.5 pb-2">
                        {filteredSubArticles.map((article) => (
                          <button
                            key={article.id}
                            onClick={() => setSearchParams({ article: article.slug })}
                            className={`w-full text-left text-xs py-1.5 px-2 rounded hover:bg-muted/50 transition-colors truncate ${
                              article.slug === articleSlug ? "text-primary font-medium bg-primary/5" : "text-muted-foreground"
                            }`}
                          >
                            {article.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {selectedArticle ? (
              /* Article detail view */
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                <button
                  onClick={() => setSearchParams({})}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to {catMeta.title}
                </button>

                <article className="rounded-xl border border-border bg-card p-6 md:p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className="text-[10px]">{(selectedArticle as any).subcategory || "General"}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {selectedArticle.read_time_minutes} min read
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {selectedArticle.view_count} views
                    </span>
                  </div>
                  <h1 className="text-xl font-bold font-heading text-card-foreground mb-4">{selectedArticle.title}</h1>
                  {selectedArticle.excerpt && (
                    <p className="text-sm text-muted-foreground mb-6 border-l-2 border-primary/20 pl-4 italic">{selectedArticle.excerpt}</p>
                  )}
                  <div className="prose-sm">{renderMarkdown(selectedArticle.content)}</div>

                  {/* Helpful feedback */}
                  <div className="border-t border-border mt-8 pt-6 flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Was this article helpful?</span>
                    <Button variant="outline" size="sm" className="text-xs gap-1.5">
                      <ThumbsUp className="h-3.5 w-3.5" /> Yes ({selectedArticle.helpful_count})
                    </Button>
                  </div>
                </article>
              </motion.div>
            ) : (
              /* Category overview */
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                {/* Category header */}
                <div className="rounded-xl border border-border bg-card p-6 md:p-8 mb-8">
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 ${catMeta.color}`}>
                      <CatIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold font-heading text-card-foreground">{catMeta.title} Knowledge Base</h1>
                      <p className="text-sm text-muted-foreground">{catMeta.desc} — {allArticles.length} articles across {subcategories.length} categories</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Browse self-help articles organised by issue category. Select any article from the sidebar, or click a category below to explore.
                  </p>
                </div>

                {/* Issue Categories grid */}
                <h2 className="text-base font-bold font-heading text-foreground mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-primary rounded-full" />
                  Issue Categories
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                  {subcategories.map(([sub, articles], i) => (
                    <motion.button
                      key={sub}
                      onClick={() => {
                        setExpandedSubs(new Set([sub]));
                        if (articles.length > 0) setSearchParams({ article: articles[0].slug });
                      }}
                      className="text-left rounded-xl border border-border bg-card p-5 hover:border-primary/20 hover:shadow-sm transition-all group"
                      initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-bold text-primary group-hover:text-primary/80 transition-colors">{sub}</h3>
                        <Badge variant="secondary" className="text-[10px] shrink-0">{articles.length}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {articles.slice(0, 3).map((a) => a.title).join(" · ")}
                      </p>
                    </motion.button>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <Link to="/support?tab=raise" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all group">
                    <Send className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">Raise a Ticket</h4>
                      <p className="text-xs text-muted-foreground">Can't find what you need?</p>
                    </div>
                  </Link>
                  <Link to="/contact" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all group">
                    <Phone className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">Contact Support</h4>
                      <p className="text-xs text-muted-foreground">Talk to our support team</p>
                    </div>
                  </Link>
                  <Link to="/quick-links" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 transition-all group">
                    <ExternalLink className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">Quick Links</h4>
                      <p className="text-xs text-muted-foreground">Useful resources & forms</p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default SupportCategory;
