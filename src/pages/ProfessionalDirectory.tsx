/**
 * ProfessionalDirectory — Public SEO-optimized directory with tabbed layout.
 * Two tabs: Intermediaries and Issuers with filters, sort, and pagination.
 */
import { useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DirectoryPublicSidebar } from "@/components/directory/DirectoryPublicSidebar";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { FlairAvatarWrapper, FlairName } from "@/components/gamification/ProfileFlair";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { resolveProfileFlair } from "@/lib/profile-flair";
import {
  Search, Shield, MapPin, CheckCircle2, ArrowRight, ArrowUpDown,
  Users, ChevronLeft, ChevronRight, Briefcase, Building2, SlidersHorizontal, X, Settings2
} from "lucide-react";

const PAGE_SIZE = 24;

const TABS = [
  { key: "intermediaries", label: "Intermediaries", icon: Briefcase, description: "MF Distributors, Advisers, Brokers & Analysts" },
  { key: "issuers", label: "Issuers", icon: Building2, description: "Portfolio Managers, AMCs & Finance Companies" },
  { key: "enablers", label: "Enablers", icon: Settings2, description: "KRAs, Depositories, RTAs, Custodians & Vault Managers" },
] as const;

type TabKey = typeof TABS[number]["key"];

// Categories that map to Intermediaries vs Issuers
const INTERMEDIARY_CATEGORIES = [
  "Mutual Fund Distributor",
  "Investment Adviser",
  "Stock Broker",
  "Research Analyst",
  "Compliance Consultant",
  "Insurance Agent",
  "Insurance Broker",
  "Depository Participant",
  "Banker to Issue",
  "Qualified Depository Participant",
  "Designated Depository Participant",
  "Debentures Trustee",
  "Credit Rating Agency",
  "Merchant Banker",
];

const ISSUER_CATEGORIES = [
  "Portfolio Manager",
  "Alternative Investment Fund",
  "Mutual Fund",
  "Venture Capital Fund",
  "Infrastructure Investment Trust",
  "REIT",
  "SM REIT",
  "FVCI",
  "Infrastructure Finance Specialist",
];

const ENABLER_CATEGORIES = [
  "KYC Registration Agency",
  "Registrar & Transfer Agent",
  "Custodian",
  "Vault Manager",
  "ESG Rating Provider",
  "SCSB",
  "UPI Mobile App",
  "Point of Presence",
];

type SortOption = "name_asc" | "name_desc" | "recent" | "views";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name_asc", label: "Name A → Z" },
  { value: "name_desc", label: "Name Z → A" },
  { value: "recent", label: "Recently Added" },
  { value: "views", label: "Most Viewed" },
];

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.03, duration: 0.3, ease: "easeOut" as const },
  }),
};

function classifyEntity(entity: { registration_category: string | null; entity_type: string | null; source: string | null }): TabKey {
  if (entity.entity_type === "enabler") return "enablers";
  if (entity.registration_category && ENABLER_CATEGORIES.some(c => entity.registration_category!.includes(c))) return "enablers";
  if (entity.registration_category && ISSUER_CATEGORIES.some(c => entity.registration_category!.includes(c))) return "issuers";
  if (entity.registration_category && INTERMEDIARY_CATEGORIES.some(c => entity.registration_category!.includes(c))) return "intermediaries";
  // Fallback: AMFI entities are typically intermediaries, individuals too
  if (entity.source === "amfi") return "intermediaries";
  if (entity.entity_type === "individual") return "intermediaries";
  return "intermediaries";
}

export default function ProfessionalDirectory() {
  usePageMeta({
    title: "Financial Professionals Directory — findoo",
    description: "Browse AMFI & SEBI registered financial professionals across India. Find mutual fund distributors, investment advisers, and more.",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabKey) || "intermediaries";

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<SortOption>("name_asc");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setPage(0);
    setSearchParams({ tab }, { replace: true });
  }, [setSearchParams]);

  const { data: allEntities = [], isLoading } = useQuery({
    queryKey: ["public-professionals-consolidated"],
    queryFn: async () => {
      // Fetch in batches to bypass 1000-row limit
      const batchSize = 1000;
      let allData: any[] = [];
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from("registry_entities")
          .select("id, entity_name, registration_number, registration_category, entity_type, source, city, state, matched_user_id, claimed_at, view_count, created_at, all_registrations, is_primary_record")
          .eq("is_public", true)
          .eq("status", "active")
          .eq("is_primary_record", true)
          .order("entity_name", { ascending: true })
          .range(offset, offset + batchSize - 1);
        if (error) throw error;
        allData = allData.concat(data || []);
        hasMore = (data?.length ?? 0) === batchSize;
        offset += batchSize;
      }

      return allData;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Split entities by tab
  const intermediaries = useMemo(() => allEntities.filter(e => classifyEntity(e) === "intermediaries"), [allEntities]);
  const issuers = useMemo(() => allEntities.filter(e => classifyEntity(e) === "issuers"), [allEntities]);
  const enablers = useMemo(() => allEntities.filter(e => classifyEntity(e) === "enablers"), [allEntities]);
  const tabEntities = activeTab === "intermediaries" ? intermediaries : activeTab === "issuers" ? issuers : enablers;

  // Cities for current tab
  const cities = useMemo(() => {
    const set = new Set(tabEntities.map(e => e.city).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [tabEntities]);

  // Sources for current tab
  const sources = useMemo(() => {
    const set = new Set(tabEntities.map(e => e.source).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [tabEntities]);

  // Filter
  const filtered = useMemo(() => {
    let result = tabEntities;
    if (source !== "all") result = result.filter(e => e.source === source);
    if (city !== "all") result = result.filter(e => e.city === city);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.entity_name?.toLowerCase().includes(q) ||
        e.registration_number?.toLowerCase().includes(q) ||
        e.city?.toLowerCase().includes(q) ||
        e.registration_category?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [tabEntities, source, city, search]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "name_asc": return arr.sort((a, b) => (a.entity_name || "").localeCompare(b.entity_name || ""));
      case "name_desc": return arr.sort((a, b) => (b.entity_name || "").localeCompare(a.entity_name || ""));
      case "recent": return arr.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      case "views": return arr.sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
      default: return arr;
    }
  }, [filtered, sort]);

  const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);

  // Flair data for claimed profiles
  const claimedUserIds = useMemo(
    () => paginated.filter(e => e.matched_user_id).map(e => e.matched_user_id!),
    [paginated]
  );

  const { data: flairMap = {} } = useQuery({
    queryKey: ["directory-flair", claimedUserIds],
    enabled: claimedUserIds.length > 0,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_flair")
        .select("user_id, avatar_border, name_effect")
        .in("user_id", claimedUserIds);
      if (error) throw error;
      const map: Record<string, { avatar_border: string; name_effect: string }> = {};
      data?.forEach(f => { map[f.user_id] = f; });
      return map;
    },
  });

  const { data: xpMap = {} } = useQuery({
    queryKey: ["directory-xp", claimedUserIds],
    enabled: claimedUserIds.length > 0,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_xp")
        .select("user_id, level")
        .in("user_id", claimedUserIds);
      if (error) throw error;
      const map: Record<string, number> = {};
      data?.forEach(x => { map[x.user_id] = x.level; });
      return map;
    },
  });

  const hasActiveFilters = source !== "all" || city !== "all" || search !== "";

  const clearFilters = () => {
    setSearch("");
    setSource("all");
    setCity("all");
    setPage(0);
  };

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Directory"
        title="Financial Professionals"
        titleAccent="Directory"
        subtitle="Browse AMFI & SEBI registered professionals across India. Find, verify, and connect with trusted intermediaries and issuers."
        variant="dots"
        context="professionals"
      />

      {/* Sticky Tabs */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === tab.key
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                {tab.key === "intermediaries" ? intermediaries.length : tab.key === "issuers" ? issuers.length : enablers.length}
              </Badge>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="directory-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
          >
            {/* Tab description + stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {TABS.find(t => t.key === activeTab)?.label}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {TABS.find(t => t.key === activeTab)?.description}
                  {" · "}
                  <span className="font-medium text-foreground">{sorted.length}</span> professionals found
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showFilters ? "secondary" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {hasActiveFilters && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
                <Select value={sort} onValueChange={(v) => { setSort(v as SortOption); setPage(0); }}>
                  <SelectTrigger className="w-[150px] h-9 text-xs">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filters panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <Card className="mb-6 border-dashed">
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search by name, ARN, city, or category..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                            className="pl-9"
                          />
                        </div>
                        <Select value={source} onValueChange={(v) => { setSource(v); setPage(0); }}>
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Source" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Sources</SelectItem>
                            {sources.map(s => (
                              <SelectItem key={s} value={s}>{s.toUpperCase()}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={city} onValueChange={(v) => { setCity(v); setPage(0); }}>
                          <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="City" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {cities.map((c) => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {hasActiveFilters && (
                          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground">
                            <X className="h-3.5 w-3.5" /> Clear
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground mb-1">No professionals found</p>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginated.map((entity, i) => {
                    const isClaimed = !!entity.matched_user_id;
                    const flair = isClaimed && entity.matched_user_id ? flairMap[entity.matched_user_id] : null;
                    const level = isClaimed && entity.matched_user_id ? xpMap[entity.matched_user_id] : 0;
                    const resolvedFlair = resolveProfileFlair(flair, level);
                    return (
                      <motion.div
                        key={entity.id}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariant}
                      >
                        <Link
                          to={`/professional/${entity.registration_number}`}
                          className="group block"
                        >
                          <Card className="h-full hover:shadow-lg transition-all duration-300 hover:border-primary/30 group-hover:bg-muted/20 hover:-translate-y-0.5">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <FlairAvatarWrapper avatarBorder={resolvedFlair.avatar_border} className="shrink-0">
                                  <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                    <span className="text-sm font-bold text-primary">
                                      {entity.entity_name?.charAt(0)?.toUpperCase() || "?"}
                                    </span>
                                  </div>
                                </FlairAvatarWrapper>
                                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                  {level > 0 && <LevelBadge level={level} size="xs" />}
                                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                                    {entity.source}
                                  </Badge>
                                  {isClaimed && (
                                    <Badge variant="default" className="text-[9px] gap-0.5">
                                      <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <h3 className="text-sm font-semibold truncate mb-1 group-hover:text-primary transition-colors">
                                <FlairName nameEffect={resolvedFlair.name_effect}>
                                  {entity.entity_name}
                                </FlairName>
                              </h3>
                              {(() => {
                                const regs = entity.all_registrations as Array<{ registration_category?: string }> | null;
                                const regCount = regs?.length || 0;
                                const allCats = regCount > 1
                                  ? [...new Set(regs?.map(r => r.registration_category).filter(Boolean))].join(" · ")
                                  : entity.registration_category;
                                return allCats ? (
                                  <div className="flex items-center gap-1.5 mb-2.5">
                                    <p className="text-[11px] text-muted-foreground truncate">
                                      {allCats}
                                    </p>
                                    {regCount > 1 && (
                                      <Badge variant="secondary" className="text-[9px] h-4 px-1 shrink-0">
                                        {regCount} reg.
                                      </Badge>
                                    )}
                                  </div>
                                ) : null;
                              })()}
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <div className="flex items-center gap-3">
                                  {entity.city && (
                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" /> {entity.city}
                                    </span>
                                  )}
                                  {entity.registration_number && (
                                    <span className="font-mono text-[10px]">{entity.registration_number}</span>
                                  )}
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Showing <span className="font-medium text-foreground">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)}</span> of{" "}
                      <span className="font-medium text-foreground">{sorted.length}</span>
                    </p>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 0}
                        onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                        className="gap-1"
                      >
                        <ChevronLeft className="h-4 w-4" /> Prev
                      </Button>
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i;
                        } else if (page < 3) {
                          pageNum = i;
                        } else if (page > totalPages - 4) {
                          pageNum = totalPages - 5 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-9 h-9 p-0"
                            onClick={() => { setPage(pageNum); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                          >
                            {pageNum + 1}
                          </Button>
                        );
                      })}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages - 1}
                        onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                        className="gap-1"
                      >
                        Next <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
        </div>

        {/* Right sidebar — desktop only */}
        <div className="hidden lg:block w-[300px] shrink-0">
          <div className="sticky top-28">
            <DirectoryPublicSidebar
              tabTotal={tabEntities.length}
              tabClaimed={tabEntities.filter(e => !!e.matched_user_id).length}
              tabLabel={TABS.find(t => t.key === activeTab)?.label || "Directory"}
              activeTab={activeTab}
            />
          </div>
        </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
