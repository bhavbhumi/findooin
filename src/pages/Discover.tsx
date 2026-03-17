import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  CheckCircle2, Search, Users, FileText, TrendingUp, MapPin, Building2, X,
  Shield, CircleDot, Sparkles, Eye, Zap, UserPlus, ArrowRight,
  RefreshCw, Info,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { PersonCardSkeleton } from "@/components/skeletons/PersonCardSkeleton";
import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";
import { PostCard } from "@/components/feed/PostCard";
import { useFeedPosts, type FeedPost } from "@/hooks/useFeedPosts";
import { DiscoverSidebar, saveRecentSearch } from "@/components/discover/DiscoverSidebar";
import { ROLE_CONFIG } from "@/lib/role-config";
import { cn } from "@/lib/utils";
import { useTrustCircleIQ, type TrustCircleResult } from "@/hooks/useTrustCircleIQ";
import { useRole } from "@/contexts/RoleContext";

const MemoizedDiscoverSidebar = memo(DiscoverSidebar);

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Circle Config ── */
const CIRCLE_CONFIG = {
  1: {
    title: "Your Inner Circle",
    subtitle: "High-trust connections and referred professionals",
    icon: Shield,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    ringColor: "ring-amber-500/30",
    gradient: "from-amber-500/5 to-transparent",
  },
  2: {
    title: "Potential Connections",
    subtitle: "2nd-degree network and complementary professionals",
    icon: UserPlus,
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/20",
    ringColor: "ring-primary/30",
    gradient: "from-primary/5 to-transparent",
  },
  3: {
    title: "Explore Ecosystem",
    subtitle: "Verified professionals across the network",
    icon: Eye,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50 border-border",
    ringColor: "ring-muted-foreground/20",
    gradient: "from-muted/30 to-transparent",
  },
} as const;

/* ── Discover Page ── */
const Discover = () => {
  usePageMeta({ title: "Discover · TrustCircle IQ™", description: "AI-powered discovery of verified financial professionals ranked by trust, role affinity, and intent." });
  const [searchParams] = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"trustcircle" | "posts">((searchParams.get("tab") as any) || "trustcircle");
  const [collapsedCircles, setCollapsedCircles] = useState<Record<number, boolean>>({});

  const { activeRole } = useRole();
  const { flatPosts: allPosts, isLoading: loadingPosts } = useFeedPosts();
  const { data: trustData, isLoading: loadingTrust, refetch, isFetching } = useTrustCircleIQ(currentUserId, activeTab === "trustcircle");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUserId(session.user.id);
    });
  }, []);

  /* ── Filtered Trust Circle results ── */
  const filteredCircles = useMemo(() => {
    if (!trustData) return { inner_circle: [], potential: [], ecosystem: [] };

    const filterResults = (results: TrustCircleResult[]) => {
      return results.filter((r) => {
        const q = search.toLowerCase();
        const p = r.profile;
        const nameMatch = !q ||
          (p.display_name || p.full_name).toLowerCase().includes(q) ||
          (p.headline || "").toLowerCase().includes(q) ||
          (p.organization || "").toLowerCase().includes(q) ||
          (p.specializations || []).some((s) => s.toLowerCase().includes(q));
        const roleMatch = !roleFilter || r.roles.some((role) => role.role === roleFilter);
        const locMatch = !locationFilter || p.location === locationFilter;
        return nameMatch && roleMatch && locMatch;
      });
    };

    return {
      inner_circle: filterResults(trustData.inner_circle),
      potential: filterResults(trustData.potential),
      ecosystem: filterResults(trustData.ecosystem),
    };
  }, [trustData, search, roleFilter, locationFilter]);

  /* ── Unique locations ── */
  const uniqueLocations = useMemo(() => {
    if (!trustData) return [];
    const all = [...trustData.inner_circle, ...trustData.potential, ...trustData.ecosystem];
    const locs = new Set<string>();
    all.forEach((r) => { if (r.profile.location) locs.add(r.profile.location); });
    return Array.from(locs).sort();
  }, [trustData]);

  /* ── Filtered Posts ── */
  const filteredPosts = useMemo(() => {
    if (!search.trim()) return allPosts.slice(0, 20);
    const q = search.toLowerCase();
    return allPosts.filter((p) =>
      p.content.toLowerCase().includes(q) ||
      p.hashtags?.some((h) => h.toLowerCase().includes(q)) ||
      (p.author.display_name || p.author.full_name).toLowerCase().includes(q)
    );
  }, [allPosts, search]);

  const totalPeople = (filteredCircles.inner_circle.length + filteredCircles.potential.length + filteredCircles.ecosystem.length);
  const hasActiveFilters = !!roleFilter || !!locationFilter;

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    saveRecentSearch(query);
  }, []);

  const handleHashtagClick = useCallback((tag: string) => {
    setSearch(`#${tag}`);
    setActiveTab("posts");
    saveRecentSearch(`#${tag}`);
  }, []);

  const handleTopicClick = useCallback((topic: string) => {
    setSearch(topic);
    saveRecentSearch(topic);
  }, []);

  const clearFilters = () => {
    setRoleFilter(null);
    setLocationFilter("");
    setSearch("");
  };

  const toggleCircle = (tier: number) => {
    setCollapsedCircles((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Column */}
        <div>
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-heading text-foreground">Discover</h1>
              <Badge variant="secondary" className="text-[10px] gap-1 font-mono">
                <Zap className="h-2.5 w-2.5" />
                TrustCircle IQ™
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Professionals ranked by trust affinity, role relevance, and behavioral intent
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "trustcircle" ? "Search by name, headline, specialization, org…" : "Search posts by content, hashtag, author…"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => { if (search.trim()) saveRecentSearch(search.trim()); }}
              className="pl-9 pr-9 h-11"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "trustcircle" | "posts")} className="mb-4">
            <TabsList className="w-full grid grid-cols-2 h-10">
              <TabsTrigger value="trustcircle" className="gap-1.5 text-sm">
                <Sparkles className="h-4 w-4" />
                TrustCircle
                {trustData && <span className="text-[10px] bg-muted px-1.5 rounded-full ml-1">{totalPeople}</span>}
              </TabsTrigger>
              <TabsTrigger value="posts" className="gap-1.5 text-sm">
                <FileText className="h-4 w-4" />
                Posts
                {search && <span className="text-[10px] bg-muted px-1.5 rounded-full ml-1">{filteredPosts.length}</span>}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* TrustCircle Tab */}
          {activeTab === "trustcircle" && (
            <>
              {/* Filters row */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {["investor", "intermediary", "issuer"].map((r) => {
                  const conf = ROLE_CONFIG[r];
                  const Icon = conf?.icon;
                  return (
                    <Button
                      key={r}
                      variant={roleFilter === r ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRoleFilter(roleFilter === r ? null : r)}
                      className="text-xs gap-1"
                    >
                      {Icon && <Icon className="h-3 w-3" />}
                      {conf?.label || r}
                    </Button>
                  );
                })}

                {uniqueLocations.length > 0 && (
                  <Select value={locationFilter} onValueChange={(v) => setLocationFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="h-8 w-[150px] text-xs">
                      <MapPin className="h-3 w-3 mr-1 shrink-0" />
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover border border-border shadow-lg">
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground gap-1">
                    <X className="h-3 w-3" /> Clear
                  </Button>
                )}

                <div className="ml-auto">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="text-xs gap-1 text-muted-foreground"
                      >
                        <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
                        {trustData?.cached ? "Cached" : "Fresh"}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Refresh TrustCircle IQ™ scores</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Active role context */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-muted/30 border border-border">
                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Viewing as <span className="font-semibold text-foreground capitalize">{activeRole}</span> — results are personalized to your role, connections, and activity
                </p>
              </div>

              {loadingTrust ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => <PersonCardSkeleton key={i} />)}
                </div>
              ) : !trustData || totalPeople === 0 ? (
                <EmptyState icon={Users} text="No professionals found. Try adjusting your filters or complete your profile for better matches." />
              ) : (
                <div className="space-y-6">
                  {/* Circle Sections */}
                  {([1, 2, 3] as const).map((tier) => {
                    const config = CIRCLE_CONFIG[tier];
                    const results = tier === 1 ? filteredCircles.inner_circle
                      : tier === 2 ? filteredCircles.potential
                      : filteredCircles.ecosystem;

                    if (results.length === 0) return null;

                    const Icon = config.icon;
                    const isCollapsed = collapsedCircles[tier];

                    return (
                      <div key={tier} className="space-y-2">
                        {/* Section Header */}
                        <button
                          onClick={() => toggleCircle(tier)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl border transition-colors",
                            config.bgColor,
                            "hover:shadow-sm"
                          )}
                        >
                          <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>
                          <div className="text-left flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-card-foreground">{config.title}</h3>
                            <p className="text-[11px] text-muted-foreground">{config.subtitle}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] shrink-0">{results.length}</Badge>
                          <ArrowRight className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isCollapsed ? "" : "rotate-90"
                          )} />
                        </button>

                        {/* Cards */}
                        {!isCollapsed && (
                          <div className="space-y-2 pl-2">
                            {results.map((result) => (
                              <TrustCircleCard key={result.target_id} result={result} circleTier={tier} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <>
              {loadingPosts ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
                </div>
              ) : filteredPosts.length === 0 ? (
                <EmptyState icon={FileText} text="No posts found" />
              ) : (
                <div className="space-y-4">
                  {!search.trim() && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" /> Showing recent posts — search to find specific content
                    </p>
                  )}
                  {filteredPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <MemoizedDiscoverSidebar
              onHashtagClick={handleHashtagClick}
              onTopicClick={handleTopicClick}
            />
          </div>
        </aside>
      </div>
    </AppLayout>
  );
};

/* ── TrustCircle Person Card ── */
function TrustCircleCard({ result, circleTier }: { result: TrustCircleResult; circleTier: number }) {
  const { profile: user, roles, referral_source, affinity_score } = result;
  const config = CIRCLE_CONFIG[circleTier as keyof typeof CIRCLE_CONFIG];

  return (
    <Link
      to={`/profile/${result.target_id}`}
      className={cn(
        "block rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all",
        "hover:border-primary/20"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("ring-2 rounded-full", config.ringColor)}>
          <NetworkAvatar
            src={user.avatar_url}
            initials={getInitials(user.full_name)}
            size="md"
            roleColor={roles[0] ? ROLE_CONFIG[roles[0].role]?.hslVar : undefined}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-card-foreground text-sm truncate">
              {user.display_name || user.full_name}
            </span>
            {user.verification_status === "verified" && (
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
            )}
            {/* Affinity score indicator */}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="ml-auto text-[9px] font-mono text-muted-foreground/50 shrink-0">
                  {(affinity_score * 100).toFixed(0)}%
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs max-w-[200px]">
                <p className="font-semibold mb-1">TrustCircle IQ™ Score</p>
                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between"><span>Role Affinity</span><span>{(result.role_weight * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between"><span>Intent Match</span><span>{result.intent_multiplier.toFixed(1)}×</span></div>
                  <div className="flex justify-between"><span>Trust Proximity</span><span>{(result.trust_proximity * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between"><span>Activity Resonance</span><span>{(result.activity_resonance * 100).toFixed(0)}%</span></div>
                  <div className="flex justify-between"><span>Freshness</span><span>{(result.freshness_decay * 100).toFixed(0)}%</span></div>
                  {result.referral_boost > 0 && (
                    <div className="flex justify-between text-amber-500"><span>Referral Boost</span><span>+{(result.referral_boost * 100).toFixed(0)}%</span></div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          {user.headline && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{user.headline}</p>
          )}
          {/* Metadata row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {roles.map((r, i) => {
              const conf = ROLE_CONFIG[r.role];
              const Icon = conf?.icon;
              return (
                <span key={i} className={cn("inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full", conf?.bgColor || "")}>
                  {Icon && <Icon className="h-2.5 w-2.5" />}
                  {r.sub_type || r.role}
                </span>
              );
            })}
            {user.location && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <MapPin className="h-2.5 w-2.5" />
                {user.location}
              </span>
            )}
            {user.organization && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Building2 className="h-2.5 w-2.5" />
                {user.organization}
              </span>
            )}
          </div>
          {/* Context labels */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {referral_source && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Sparkles className="h-2.5 w-2.5" />
                {referral_source}
              </span>
            )}
            {user.specializations && user.specializations.length > 0 && (
              <>
                {user.specializations.slice(0, 3).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{s}</Badge>
                ))}
                {user.specializations.length > 3 && (
                  <Badge variant="secondary" className="text-[9px] px-1.5 py-0">+{user.specializations.length - 3}</Badge>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  );
}

export default Discover;
