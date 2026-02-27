import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, Search, Users, FileText, TrendingUp, MapPin, Building2, X,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { FindooLoader } from "@/components/FindooLoader";
import { PostCard } from "@/components/feed/PostCard";
import { useFeedPosts, type FeedPost } from "@/hooks/useFeedPosts";
import { DiscoverSidebar, saveRecentSearch } from "@/components/discover/DiscoverSidebar";
import { ROLE_CONFIG } from "@/lib/role-config";
import { cn } from "@/lib/utils";

/* ── Types ── */
interface DiscoverUser {
  id: string;
  full_name: string;
  display_name: string | null;
  user_type: string;
  bio: string | null;
  headline: string | null;
  organization: string | null;
  location: string | null;
  avatar_url: string | null;
  verification_status: string;
  specializations: string[] | null;
  roles: { role: string; sub_type: string | null }[];
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ── Discover Page ── */
const Discover = () => {
  const [searchParams] = useSearchParams();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"people" | "posts">((searchParams.get("tab") as "people" | "posts") || "people");

  const { data: allPosts = [], isLoading: loadingPosts } = useFeedPosts();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setCurrentUserId(session.user.id);
      loadUsers(session.user.id);
    });
  }, []);

  const loadUsers = async (currentUserId: string) => {
    setLoadingUsers(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, display_name, user_type, bio, headline, organization, location, avatar_url, verification_status, specializations").neq("id", currentUserId),
      supabase.from("user_roles").select("*"),
    ]);

    const roleMap = new Map<string, { role: string; sub_type: string | null }[]>();
    rolesRes.data?.forEach((r) => {
      if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
      roleMap.get(r.user_id)!.push({ role: r.role, sub_type: r.sub_type });
    });

    const mapped: DiscoverUser[] = (profilesRes.data || []).map((p) => ({
      ...p,
      roles: roleMap.get(p.id) || [],
    }));
    setUsers(mapped);
    setLoadingUsers(false);
  };

  /* ── Unique locations for filter ── */
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    users.forEach((u) => { if (u.location) locs.add(u.location); });
    return Array.from(locs).sort();
  }, [users]);

  /* ── Filtered People ── */
  const filteredPeople = useMemo(() => {
    return users.filter((u) => {
      const q = search.toLowerCase();
      const nameMatch =
        (u.display_name || u.full_name).toLowerCase().includes(q) ||
        (u.headline || "").toLowerCase().includes(q) ||
        (u.organization || "").toLowerCase().includes(q) ||
        (u.bio || "").toLowerCase().includes(q) ||
        (u.specializations || []).some((s) => s.toLowerCase().includes(q));
      const roleMatch = !roleFilter || u.roles.some((r) => r.role === roleFilter);
      const locMatch = !locationFilter || u.location === locationFilter;
      return nameMatch && roleMatch && locMatch;
    });
  }, [users, search, roleFilter, locationFilter]);

  /* ── Filtered Posts ── */
  const filteredPosts = useMemo(() => {
    if (!search.trim()) return allPosts.slice(0, 20);
    const q = search.toLowerCase();
    return allPosts.filter((p) => {
      const contentMatch = p.content.toLowerCase().includes(q);
      const hashtagMatch = p.hashtags?.some((h) => h.toLowerCase().includes(q));
      const authorMatch = (p.author.display_name || p.author.full_name).toLowerCase().includes(q);
      return contentMatch || hashtagMatch || authorMatch;
    });
  }, [allPosts, search]);

  const peopleCount = filteredPeople.length;
  const postsCount = filteredPosts.length;
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

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Column */}
        <div>
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-xl font-bold font-heading text-foreground">Discover</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Find people, posts, and insights across the network</p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === "people" ? "Search by name, headline, specialization, org…" : "Search posts by content, hashtag, author…"}
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
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "people" | "posts")} className="mb-4">
            <TabsList className="w-full grid grid-cols-2 h-10">
              <TabsTrigger value="people" className="gap-1.5 text-sm">
                <Users className="h-4 w-4" />
                People
                {search && <span className="text-[10px] bg-muted px-1.5 rounded-full ml-1">{peopleCount}</span>}
              </TabsTrigger>
              <TabsTrigger value="posts" className="gap-1.5 text-sm">
                <FileText className="h-4 w-4" />
                Posts
                {search && <span className="text-[10px] bg-muted px-1.5 rounded-full ml-1">{postsCount}</span>}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* People Tab */}
          {activeTab === "people" && (
            <>
              {/* Filters row */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                {/* Role filters */}
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

                {/* Location filter */}
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
              </div>

              {loadingUsers ? (
                <FindooLoader text="Finding people..." />
              ) : filteredPeople.length === 0 ? (
                <EmptyState icon={Users} text="No people found" />
              ) : (
                <div className="space-y-3">
                  {filteredPeople.map((user) => (
                    <PersonCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <>
              {loadingPosts ? (
                <FindooLoader text="Searching posts..." />
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
            <DiscoverSidebar
              onHashtagClick={handleHashtagClick}
              onTopicClick={handleTopicClick}
            />
          </div>
        </aside>
      </div>
    </AppLayout>
  );
};

/* ── Enhanced Person Card ── */
function PersonCard({ user }: { user: DiscoverUser }) {
  return (
    <Link
      to={`/profile/${user.id}`}
      className="block rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center gap-3">
        <NetworkAvatar
          src={user.avatar_url}
          initials={getInitials(user.full_name)}
          size="md"
          roleColor={user.roles[0] ? ROLE_CONFIG[user.roles[0].role]?.hslVar : undefined}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-card-foreground text-sm truncate">
              {user.display_name || user.full_name}
            </span>
            {user.verification_status === "verified" && (
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
            )}
          </div>
          {user.headline && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{user.headline}</p>
          )}
          {/* Metadata row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {user.roles.map((r, i) => {
              const conf = ROLE_CONFIG[r.role];
              const Icon = conf?.icon;
              return (
                <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${conf?.bgColor || ""}`}>
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
          {/* Specializations */}
          {user.specializations && user.specializations.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {user.specializations.slice(0, 3).map((s) => (
                <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">{s}</Badge>
              ))}
              {user.specializations.length > 3 && (
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">+{user.specializations.length - 3}</Badge>
              )}
            </div>
          )}
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
