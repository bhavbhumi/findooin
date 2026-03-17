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
  Shield, Sparkles, Eye, Zap, UserPlus, Users2, Globe, Network,
  RefreshCw, Info,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { PersonCardSkeleton } from "@/components/skeletons/PersonCardSkeleton";
import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";
import { PostCard } from "@/components/feed/PostCard";
import { useFeedPosts, type FeedPost } from "@/hooks/useFeedPosts";
import { useTrendingPosts } from "@/hooks/useTrendingPosts";
import { useViralPosts } from "@/hooks/useViralPosts";
import { DiscoverSidebar, saveRecentSearch } from "@/components/discover/DiscoverSidebar";
import { ROLE_CONFIG } from "@/lib/role-config";
import { cn } from "@/lib/utils";
import { useTrustCircleIQ, CIRCLE_TIERS, type TrustCircleResult, type CircleTier, type TrustCircleData } from "@/hooks/useTrustCircleIQ";
import { useRole } from "@/contexts/RoleContext";

const MemoizedDiscoverSidebar = memo(DiscoverSidebar);

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Circle Visual Config ── */
const CIRCLE_VISUALS: Record<CircleTier, { icon: typeof Shield; color: string; ringColor: string; bgAccent: string }> = {
  1: { icon: Shield, color: "text-amber-500", ringColor: "ring-amber-500/40", bgAccent: "bg-amber-500/10" },
  2: { icon: Network, color: "text-primary", ringColor: "ring-primary/40", bgAccent: "bg-primary/10" },
  3: { icon: Users2, color: "text-intermediary", ringColor: "ring-intermediary/30", bgAccent: "bg-intermediary/10" },
  4: { icon: Globe, color: "text-issuer", ringColor: "ring-issuer/30", bgAccent: "bg-issuer/10" },
  5: { icon: Eye, color: "text-muted-foreground", ringColor: "ring-muted-foreground/20", bgAccent: "bg-muted/50" },
};

/* AffinityFeed™ scoring moved to Feed page — Discover uses exploration modes */

/* ── Discover Page ── */
const Discover = () => {
  usePageMeta({ title: "Discover · TrustCircle IQ™", description: "AI-powered discovery of verified financial professionals ranked by trust, role affinity, and intent." });
  const [searchParams] = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [mainTab, setMainTab] = useState<"people" | "posts">((searchParams.get("tab") as any) || "people");
  const [activeCircle, setActiveCircle] = useState<CircleTier | "all">("all");
  const [postFeedMode, setPostFeedMode] = useState<"trending" | "viral" | "recent">("trending");

  const { activeRole } = useRole();
  const { data: trendingPosts, isLoading: loadingTrending } = useTrendingPosts();
  const { data: viralPosts, isLoading: loadingViral } = useViralPosts();
  const { flatPosts: recentPosts, isLoading: loadingRecent } = useFeedPosts();
  const { data: trustData, isLoading: loadingTrust, refetch, isFetching } = useTrustCircleIQ(currentUserId, true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUserId(session.user.id);
    });
  }, []);

  /* ── Filter results ── */
  const filterResults = useCallback((results: TrustCircleResult[]) => {
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
  }, [search, roleFilter, locationFilter]);

  const circleCounts = useMemo(() => {
    if (!trustData) return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, all: 0 };
    const counts: Record<string, number> = { all: 0 };
    ([1, 2, 3, 4, 5] as CircleTier[]).forEach((tier) => {
      const key = CIRCLE_TIERS[tier].key;
      const filtered = filterResults(trustData[key]);
      counts[tier] = filtered.length;
      counts.all += filtered.length;
    });
    return counts;
  }, [trustData, filterResults]);

  const activeResults = useMemo(() => {
    if (!trustData) return [];
    if (activeCircle === "all") {
      return ([1, 2, 3, 4, 5] as CircleTier[]).flatMap((tier) =>
        filterResults(trustData[CIRCLE_TIERS[tier].key]).map((r) => ({ ...r, _tier: tier }))
      );
    }
    return filterResults(trustData[CIRCLE_TIERS[activeCircle].key]).map((r) => ({ ...r, _tier: activeCircle }));
  }, [trustData, activeCircle, filterResults]);

  /* ── Unique locations ── */
  const uniqueLocations = useMemo(() => {
    if (!trustData) return [];
    const locs = new Set<string>();
    ([1, 2, 3, 4, 5] as CircleTier[]).forEach((tier) => {
      trustData[CIRCLE_TIERS[tier].key].forEach((r) => {
        if (r.profile.location) locs.add(r.profile.location);
      });
    });
    return Array.from(locs).sort();
  }, [trustData]);

  /* ── Discover Posts: Exploration modes (Trending / Viral / Recent) ── */
  const discoverPosts = useMemo(() => {
    const raw = postFeedMode === "trending" ? (trendingPosts || [])
      : postFeedMode === "viral" ? (viralPosts || [])
      : recentPosts;

    if (!search.trim()) return raw.slice(0, 30);

    const q = search.toLowerCase();
    return raw.filter((p) =>
      p.content.toLowerCase().includes(q) ||
      p.hashtags?.some((h) => h.toLowerCase().includes(q)) ||
      (p.author.display_name || p.author.full_name).toLowerCase().includes(q)
    ).slice(0, 30);
  }, [trendingPosts, viralPosts, recentPosts, search, postFeedMode]);

  const postsLoading = postFeedMode === "trending" ? loadingTrending
    : postFeedMode === "viral" ? loadingViral
    : loadingRecent;

  const hasActiveFilters = !!roleFilter || !!locationFilter;

  const handleHashtagClick = useCallback((tag: string) => {
    setSearch(`#${tag}`);
    setMainTab("posts");
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
              placeholder={mainTab === "people" ? "Search by name, headline, specialization, org…" : "Search posts by content, hashtag, author…"}
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

          {/* Main Tabs: People (AffinityRank™) / Posts (AffinityFeed™) */}
          <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as "people" | "posts")} className="mb-4">
            <TabsList className="w-full grid grid-cols-2 h-10">
              <TabsTrigger value="people" className="gap-1.5 text-sm">
                <Users className="h-4 w-4" />
                People
                {trustData && <span className="text-[10px] bg-muted px-1.5 rounded-full ml-1">{circleCounts.all}</span>}
              </TabsTrigger>
              <TabsTrigger value="posts" className="gap-1.5 text-sm">
                <FileText className="h-4 w-4" />
                Posts
                {discoverPosts.length > 0 && <span className="text-[10px] bg-muted px-1.5 rounded-full ml-1">{discoverPosts.length}</span>}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* People Tab (AffinityRank™) */}
          {mainTab === "people" && (
            <>
              {/* Circle Tabs — Horizontal */}
              <div className="mb-4 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1.5 min-w-max">
                  <button
                    onClick={() => setActiveCircle("all")}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border",
                      activeCircle === "all"
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Users className="h-3.5 w-3.5" />
                    All
                    <span className={cn("text-[10px] px-1.5 rounded-full", activeCircle === "all" ? "bg-primary-foreground/20" : "bg-muted")}>{circleCounts.all}</span>
                  </button>
                  {([1, 2, 3, 4, 5] as CircleTier[]).map((tier) => {
                    const visual = CIRCLE_VISUALS[tier];
                    const config = CIRCLE_TIERS[tier];
                    const Icon = visual.icon;
                    const count = circleCounts[tier];
                    const isActive = activeCircle === tier;
                    return (
                      <Tooltip key={tier}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setActiveCircle(tier)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border",
                              isActive
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            <Icon className={cn("h-3.5 w-3.5", !isActive && visual.color)} />
                            {config.shortLabel}
                            <span className={cn("text-[10px] px-1.5 rounded-full", isActive ? "bg-primary-foreground/20" : "bg-muted")}>{count}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                          <p className="font-semibold">{config.label}</p>
                          <p className="text-muted-foreground">{config.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>

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

              {/* Role context */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-muted/30 border border-border">
                <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Viewing as <span className="font-semibold text-foreground capitalize">{activeRole}</span> — results personalized to your role, connections, and activity
                </p>
              </div>

              {loadingTrust ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => <PersonCardSkeleton key={i} />)}
                </div>
              ) : activeResults.length === 0 ? (
                <EmptyState icon={Users} text="No professionals found in this circle. Try a different circle or adjust your filters." />
              ) : (
                <div className="space-y-2.5">
                  {/* Section header when viewing "all" */}
                  {activeCircle === "all" && ([1, 2, 3, 4, 5] as CircleTier[]).map((tier) => {
                    const tierResults = activeResults.filter((r) => r._tier === tier);
                    if (tierResults.length === 0) return null;
                    const visual = CIRCLE_VISUALS[tier];
                    const config = CIRCLE_TIERS[tier];
                    const Icon = visual.icon;

                    return (
                      <div key={tier} className="space-y-2">
                        <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border", visual.bgAccent, "border-border/50")}>
                          <Icon className={cn("h-4 w-4", visual.color)} />
                          <span className="text-xs font-semibold text-card-foreground">{config.label}</span>
                          <span className="text-[10px] text-muted-foreground">— {config.description}</span>
                          <Badge variant="secondary" className="text-[10px] ml-auto">{tierResults.length}</Badge>
                        </div>
                        {tierResults.map((result) => (
                          <TrustCircleCard key={result.target_id} result={result} circleTier={result._tier} />
                        ))}
                      </div>
                    );
                  })}

                  {/* Single circle view */}
                  {activeCircle !== "all" && activeResults.map((result) => (
                    <TrustCircleCard key={result.target_id} result={result} circleTier={result._tier} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Posts Tab — Exploration: Trending / Viral / Recent */}
          {mainTab === "posts" && (
            <>
              {/* Mode Selector */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5">
                  {([
                    { key: "trending" as const, label: "Trending", icon: TrendingUp },
                    { key: "viral" as const, label: "Viral", icon: Zap },
                    { key: "recent" as const, label: "Recent", icon: RefreshCw },
                  ]).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setPostFeedMode(key)}
                      className={cn(
                        "flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                        postFeedMode === key
                          ? "bg-card shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </button>
                  ))}
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                      <Info className="h-3 w-3" />
                      {postFeedMode === "trending" ? "Top hashtags, 7 days" : postFeedMode === "viral" ? "Highest engagement" : "Latest posts"}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs max-w-[260px]">
                    {postFeedMode === "trending" && <p>Posts containing the most-used hashtags from the past 7 days across the entire ecosystem.</p>}
                    {postFeedMode === "viral" && <p>Posts ranked by engagement score (likes + comments × 2) — discover what the whole community is buzzing about.</p>}
                    {postFeedMode === "recent" && <p>Newest posts from the entire community, unfiltered.</p>}
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Exploration context */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-muted/30 border border-border">
                <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Exploring the <span className="font-semibold text-foreground">broader ecosystem</span> — for trust-weighted content from your network, visit your <a href="/feed" className="text-primary underline underline-offset-2 font-medium">Feed</a>
                </p>
              </div>

              {postsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
                </div>
              ) : discoverPosts.length === 0 ? (
                <EmptyState icon={FileText} text="No posts found. Try a different search or check back later." />
              ) : (
                <div className="space-y-3">
                  {discoverPosts.map((post) => (
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
function TrustCircleCard({ result, circleTier }: { result: TrustCircleResult; circleTier: CircleTier }) {
  const { profile: user, roles, referral_source, affinity_score } = result;
  const visual = CIRCLE_VISUALS[circleTier];

  return (
    <Link
      to={`/profile/${result.target_id}`}
      className="block rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all hover:border-primary/20"
    >
      <div className="flex items-center gap-3">
        <div className={cn("ring-2 rounded-full", visual.ringColor)}>
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
                  <div className="flex justify-between"><span>Activity</span><span>{(result.activity_resonance * 100).toFixed(0)}%</span></div>
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
                <MapPin className="h-2.5 w-2.5" />{user.location}
              </span>
            )}
            {user.organization && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                <Building2 className="h-2.5 w-2.5" />{user.organization}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {referral_source && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Sparkles className="h-2.5 w-2.5" />{referral_source}
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
