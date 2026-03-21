/**
 * Opinions — Always renders in PublicPageLayout for consistent public browsing.
 * App-view access is via Feed "Opinions" tab + sidebar widget.
 */
import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";

import { PageHero } from "@/components/PageHero";
import { PageTransition } from "@/components/PageTransition";
import { OpinionCard } from "@/components/opinions/OpinionCard";
import { OpinionDetailSheet } from "@/components/opinions/OpinionDetailSheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, BarChart3, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useOpinions, useOpinionDetail,
  type OpinionCategory, type OpinionStatus,
  OPINION_CATEGORIES,
} from "@/hooks/useOpinions";
import { Skeleton } from "@/components/ui/skeleton";


const CATEGORY_ALL = "all" as const;
type CategoryFilter = OpinionCategory | typeof CATEGORY_ALL;

function OpinionsContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<CategoryFilter>(CATEGORY_ALL);
  const [statusFilter, setStatusFilter] = useState<"active" | "closed" | "all">("active");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "ending">("recent");
  const [selectedOpinionId, setSelectedOpinionId] = useState<string | null>(
    searchParams.get("id") || null
  );

  const { data: allOpinions, isLoading } = useOpinions(
    category === CATEGORY_ALL ? undefined : category,
    statusFilter === "all" ? undefined : (statusFilter as OpinionStatus)
  );

  const { data: selectedOpinion } = useOpinionDetail(selectedOpinionId);

  useEffect(() => {
    const id = searchParams.get("id");
    if (id) setSelectedOpinionId(id);
  }, [searchParams]);

  const filtered = useMemo(() => {
    let list = allOpinions || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((o) => o.title.toLowerCase().includes(q) || o.description.toLowerCase().includes(q));
    }
    switch (sortBy) {
      case "popular":
        list = [...list].sort((a, b) => b.participation_count - a.participation_count);
        break;
      case "ending":
        list = [...list].sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime());
        break;
      default:
        list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [allOpinions, search, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allOpinions?.length || 0 };
    allOpinions?.forEach((o) => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return counts;
  }, [allOpinions]);

  const handleOpenDetail = (id: string) => {
    setSelectedOpinionId(id);
    setSearchParams({ id });
  };

  const handleCloseDetail = () => {
    setSelectedOpinionId(null);
    setSearchParams({});
  };

  return (
    <>
      <PulseWaves className="!fixed !inset-0 !z-0" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          {/* Category Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-1">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                Categories
              </h3>
              <button
                onClick={() => setCategory(CATEGORY_ALL)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                  category === CATEGORY_ALL ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-muted-foreground"
                )}
              >
                <span>All</span>
                <Badge variant="secondary" className="text-[10px] h-5">{categoryCounts.all || 0}</Badge>
              </button>
              {Object.entries(OPINION_CATEGORIES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setCategory(key as OpinionCategory)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    category === key ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{val.icon}</span>
                    <span className="truncate">{val.label}</span>
                  </span>
                  {categoryCounts[key] ? (
                    <Badge variant="secondary" className="text-[10px] h-5">{categoryCounts[key]}</Badge>
                  ) : null}
                </button>
              ))}

              {/* Disclaimer below categories */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 p-3 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Disclaimer</span>
                  </div>
                  <ul className="text-[10.5px] leading-relaxed text-muted-foreground space-y-1.5 list-disc list-outside pl-3.5">
                    <li>Outcomes are derived from participation by registered BFSI professionals (Intermediaries & Issuers) and do not represent universal market consensus.</li>
                    <li>Sentiment indicators reflect reactions from investor participants and are observational in nature.</li>
                    <li>FindOO is solely a medium and presenter platform — we do not encourage, facilitate, or endorse any betting, wagering, or actions involving financial stakes.</li>
                    <li>All content is for <strong>educational and informational purposes only</strong> and should not be construed as investment advice, research recommendations, or any form of professional financial guidance.</li>
                    <li>Please consult a qualified, SEBI-registered advisor before making any financial decisions.</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div>
            {/* Mobile category selector */}
            <div className="lg:hidden mb-4">
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryFilter)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(OPINION_CATEGORIES).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search opinions..."
                  className="pl-9 h-9 text-sm"
                />
              </div>

              <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="shrink-0">
                <TabsList className="h-9">
                  <TabsTrigger value="active" className="text-xs gap-1">
                    <TrendingUp className="h-3 w-3" /> Active
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="text-xs gap-1">
                    <Clock className="h-3 w-3" /> Closed
                  </TabsTrigger>
                  <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-36 h-9 text-sm shrink-0">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="popular">Most Voted</SelectItem>
                  <SelectItem value="ending">Ending Soon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Opinion Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl border p-4 space-y-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold">No opinions found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {search ? "Try a different search term" : "Check back soon for new professional sentiment polls"}
                </p>
              </div>
            ) : (
              <motion.div
                className="grid md:grid-cols-2 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.05 } },
                }}
              >
                <AnimatePresence>
                  {filtered.map((opinion) => (
                    <OpinionCard
                      key={opinion.id}
                      opinion={opinion}
                      onOpenDetail={handleOpenDetail}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Sheet */}
      <OpinionDetailSheet
        opinionId={selectedOpinionId}
        opinion={selectedOpinion || null}
        open={!!selectedOpinionId}
        onClose={handleCloseDetail}
      />
    </>
  );
}

export default function Opinions() {
  usePageMeta({
    title: "Professional Opinions — FindOO",
    description: "Track professional sentiment on RBI policy, SEBI regulations, markets, and the Indian BFSI ecosystem. No betting — pure professional insight.",
    path: "/opinions",
  });

  return (
    <PublicPageLayout>
      <PageTransition>
        <PageHero
          breadcrumb="Opinions"
          title="Professional"
          titleAccent="Opinions"
          subtitle="Track BFSI professional sentiment on policy, markets, and regulation. Curated by verified industry experts."
          variant="hexagons"
          context="opinions"
        />
        <OpinionsContent />
      </PageTransition>
    </PublicPageLayout>
  );
}
