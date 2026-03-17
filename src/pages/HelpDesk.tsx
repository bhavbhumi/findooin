import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, ShieldCheck, UserCog, CreditCard, FileText, Settings, ChevronRight, Mail, Phone, Clock, ExternalLink, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { CreateTicketDialog } from "@/components/support/CreateTicketDialog";
import { useKBArticles, type KBArticle } from "@/hooks/useKnowledgeBase";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

const CATEGORY_META: Record<string, { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }> = {
  account: { icon: UserCog, title: "Account & Profile", desc: "Registration, profile setup, and account settings" },
  verification: { icon: ShieldCheck, title: "Verification", desc: "Credential verification process and trust badges" },
  content: { icon: MessageCircle, title: "Posts & Content", desc: "Creating posts, sharing insights, and moderation" },
  billing: { icon: CreditCard, title: "Billing & Plans", desc: "Subscription plans, invoices, and payment methods" },
  privacy: { icon: Settings, title: "Privacy & Security", desc: "Data protection, two-factor auth, and privacy controls" },
  community: { icon: FileText, title: "Community & Guidelines", desc: "Rules of engagement and community standards" },
};

// Simple markdown to HTML (headings, bold, lists, links, tables)
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
    } else if (line.startsWith("|")) {
      // Skip table lines
      elements.push(<p key={i} className="text-sm text-muted-foreground font-mono">{line}</p>);
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

const HelpDesk = () => {
  usePageMeta({ title: "Help Desk", description: "Find answers and support for using FindOO." });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KBArticle | null>(null);

  const { data: allArticles = [] } = useKBArticles();

  // Group articles by category
  const categoryCounts: Record<string, number> = {};
  allArticles.forEach((a) => {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
  });

  const categories = Object.entries(CATEGORY_META).map(([key, meta]) => ({
    ...meta,
    key,
    articles: categoryCounts[key] || 0,
  }));

  // Filter articles for search and category
  const filteredArticles = allArticles.filter((a) => {
    const matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Popular articles = first 6 sorted by view_count desc
  const popularArticles = [...allArticles]
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 6);

  const showResults = searchQuery.length > 0 || selectedCategory;

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Help Desk"
        title="How can we"
        titleAccent="help you?"
        subtitle="Find answers to common questions, browse help articles, or reach out to our support team."
        variant="dots"
      />

      {/* Search bar */}
      <section className="py-10 border-b border-border">
        <div className="container max-w-2xl">
          <motion.div className="relative" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, topics, or questions..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setSelectedCategory(null); }}
              className="pl-12 h-12 text-base rounded-xl border-border"
            />
          </motion.div>
        </div>
      </section>

      {/* Search/Category results */}
      {showResults && (
        <section className="py-10 border-b border-border">
          <div className="container max-w-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold font-heading text-foreground">
                {selectedCategory ? CATEGORY_META[selectedCategory]?.title || selectedCategory : "Search Results"}
              </h2>
              {selectedCategory && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="text-xs">Clear filter</Button>
              )}
            </div>
            {filteredArticles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No articles found. Try a different search term.</p>
            ) : (
              <div className="space-y-2">
                {filteredArticles.map((article) => (
                  <button key={article.id} onClick={() => setSelectedArticle(article)}
                    className="w-full text-left flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/20 transition-colors group">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">{article.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px]">{CATEGORY_META[article.category]?.title || article.category}</Badge>
                        <span>{article.read_time_minutes} min read</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-4" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Help categories */}
      {!showResults && (
        <>
          <section className="py-14">
            <div className="container">
              <motion.h2 className="text-xl font-bold font-heading text-foreground mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                Browse by Category
              </motion.h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat, i) => (
                  <motion.button key={cat.key} onClick={() => setSelectedCategory(cat.key)}
                    className="text-left rounded-xl border border-border bg-card p-6 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
                    initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold font-heading text-card-foreground group-hover:text-primary transition-colors">{cat.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{cat.desc}</p>
                        <p className="text-xs text-muted-foreground mt-2">{cat.articles} articles</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </section>

          {/* Popular articles */}
          <section className="py-12 border-t border-border">
            <div className="container max-w-3xl">
              <motion.h2 className="text-xl font-bold font-heading text-foreground mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
                Popular Articles
              </motion.h2>
              <div className="space-y-3">
                {popularArticles.map((article, i) => (
                  <motion.button key={article.id} onClick={() => setSelectedArticle(article)}
                    className="w-full text-left flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/20 transition-colors cursor-pointer group"
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">{article.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{CATEGORY_META[article.category]?.title || article.category}</span>
                        <span>·</span>
                        <span>{article.read_time_minutes} min read</span>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-4" />
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Contact support CTA */}
      <section className="py-12 border-t border-border">
        <div className="container max-w-3xl">
          <motion.div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-10 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold font-heading text-foreground mb-3">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Our support team is available to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <CreateTicketDialog />
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:support@findoo.in">
                  <Mail className="h-4 w-4 mr-1.5" /> Email Us
                </a>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> +91 22 4000 1234</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Mon–Fri, 9AM–6PM IST</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article detail sheet */}
      <Sheet open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-base font-bold pr-6">{selectedArticle?.title}</SheetTitle>
          </SheetHeader>
          {selectedArticle && (
            <ScrollArea className="flex-1 px-4 pb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary" className="text-[10px]">{CATEGORY_META[selectedArticle.category]?.title || selectedArticle.category}</Badge>
                <span className="text-xs text-muted-foreground">{selectedArticle.read_time_minutes} min read</span>
              </div>
              <div className="prose-sm">{renderMarkdown(selectedArticle.content)}</div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </PublicPageLayout>
  );
};

export default HelpDesk;
