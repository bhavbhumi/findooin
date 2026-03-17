/**
 * ProfessionalDirectory — Public SEO-optimized directory listing page.
 * Browse registry entities by source, city, category with search.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import {
  Search, Shield, MapPin, CheckCircle2, Clock, ArrowRight,
  Users, ChevronLeft, ChevronRight
} from "lucide-react";

const PAGE_SIZE = 24;

export default function ProfessionalDirectory() {
  usePageMeta({
    title: "Financial Professionals Directory — FindOO",
    description: "Browse AMFI & SEBI registered financial professionals across India. Find mutual fund distributors, investment advisers, and more.",
  });

  const [search, setSearch] = useState("");
  const [source, setSource] = useState("all");
  const [city, setCity] = useState("all");
  const [page, setPage] = useState(0);

  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["public-professionals", search, source, city],
    queryFn: async () => {
      let query = supabase
        .from("registry_entities")
        .select("id, entity_name, registration_number, registration_category, entity_type, source, city, state, matched_user_id, claimed_at, view_count")
        .eq("is_public", true)
        .eq("status", "active")
        .order("entity_name", { ascending: true })
        .limit(500);

      if (source !== "all") query = query.eq("source", source);
      if (city !== "all") query = query.eq("city", city);
      if (search) {
        query = query.or(
          `entity_name.ilike.%${search}%,registration_number.ilike.%${search}%,city.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Extract unique cities for filter
  const cities = useMemo(() => {
    const set = new Set(entities.map(e => e.city).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [entities]);

  const paginated = entities.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(entities.length / PAGE_SIZE);

  // Fetch flair for all claimed user IDs in current page
  const claimedUserIds = useMemo(
    () => paginated.filter(e => e.matched_user_id).map(e => e.matched_user_id!) || [],
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

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Directory"
        title="Financial Professionals"
        titleAccent="Directory"
        subtitle="Browse AMFI & SEBI registered professionals across India. Find, verify, and connect."
        variant="dots"
      />

      <div className="container py-6">
        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span><strong className="text-foreground">{entities.length}</strong> professionals</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, registration number, or city..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9"
            />
          </div>
          <Select value={source} onValueChange={(v) => { setSource(v); setPage(0); }}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="amfi">AMFI</SelectItem>
              <SelectItem value="sebi">SEBI</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>
          <Select value={city} onValueChange={(v) => { setCity(v); setPage(0); }}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="City" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : entities.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No professionals found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paginated.map((entity) => {
                const isClaimed = !!entity.matched_user_id;
                const flair = isClaimed && entity.matched_user_id ? flairMap[entity.matched_user_id] : null;
                const avatarBorder = flair?.avatar_border || "none";
                const nameEffect = flair?.name_effect || "none";
                return (
                  <Link
                    key={entity.id}
                    to={`/professional/${entity.registration_number}`}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-md transition-all hover:border-primary/20 group-hover:bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <FlairAvatarWrapper avatarBorder={avatarBorder} className="shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              <span className="text-sm font-bold text-primary">
                                {entity.entity_name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                            </div>
                          </FlairAvatarWrapper>
                          <div className="flex gap-1">
                            <Badge variant="outline" className="text-[8px] uppercase">
                              {entity.source}
                            </Badge>
                            {isClaimed && (
                              <Badge variant="default" className="text-[8px] gap-0.5">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Claimed
                              </Badge>
                            )}
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold truncate mb-1 group-hover:text-primary transition-colors">
                          <FlairName nameEffect={nameEffect}>
                            {entity.entity_name}
                          </FlairName>
                        </h3>
                        {entity.registration_category && (
                          <p className="text-[11px] text-muted-foreground truncate mb-2">
                            {entity.registration_category}
                          </p>
                        )}
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                          {entity.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {entity.city}
                            </span>
                          )}
                          {entity.registration_number && (
                            <span className="font-mono">{entity.registration_number}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages} ({entities.length} results)
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PublicPageLayout>
  );
}
