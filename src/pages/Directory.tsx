import { useState, memo, useMemo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Package, GitCompare, Info, Sparkles, User, LayoutList, Star, Eye, MessageSquare } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { useListings, useMyListings, type Listing, type ListingType } from "@/hooks/useListings";
import { ListingCard } from "@/components/directory/ListingCard";
import { ListingCardSkeleton } from "@/components/skeletons/ListingCardSkeleton";
import { DirectorySidebar } from "@/components/directory/DirectorySidebar";
import { ListingDetailSheet } from "@/components/directory/ListingDetailSheet";
import { CreateListingDialog } from "@/components/directory/CreateListingDialog";
import { ListingComparison } from "@/components/directory/ListingComparison";
import { useRole } from "@/contexts/RoleContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const MemoizedDirectorySidebar = memo(DirectorySidebar);

const Directory = () => {
  usePageMeta({ title: "Showcase" });
  const { activeRole } = useRole();

  const [activeTab, setActiveTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<ListingType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [compareList, setCompareList] = useState<Listing[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const canCreate = activeRole === "issuer" || activeRole === "intermediary" || activeRole === "admin";

  const { data: listings, isLoading } = useListings({
    type: selectedType ?? undefined,
    category: selectedCategory ?? undefined,
    search: search || undefined,
  });

  // My listings for the "My Showcase" tab
  const { data: myListings, isLoading: myListingsLoading } = useMyListings();

  // Profile data for suggestions
  const { data: profile } = useQuery({
    queryKey: ["my-profile-showcase"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;
      const { data } = await supabase
        .from("profiles")
        .select("id, certifications, specializations, location, user_type")
        .eq("id", session.user.id)
        .single();
      return data;
    },
  });

  // My enquiries for "My Showcase" tab (investor view)
  const { data: myEnquiries } = useQuery({
    queryKey: ["my-enquiries"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data } = await supabase
        .from("listing_enquiries")
        .select("*, listings:listing_id(id, title, listing_type, status)")
        .eq("enquirer_id", session.user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  // Enquiries received on my listings (issuer/intermediary view)
  const { data: receivedEnquiries } = useQuery({
    queryKey: ["received-enquiries", myListings?.map((l) => l.id)],
    enabled: canCreate && !!myListings?.length,
    queryFn: async () => {
      if (!myListings?.length) return [];
      const listingIds = myListings.map((l) => l.id);
      const { data } = await supabase
        .from("listing_enquiries")
        .select("*")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false });
      
      if (!data?.length) return [];
      const enquirerIds = [...new Set(data.map((e: any) => e.enquirer_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url")
        .in("id", enquirerIds);
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      
      return data.map((e: any) => ({
        ...e,
        enquirer: profileMap.get(e.enquirer_id) || null,
        listing_title: myListings.find((l) => l.id === e.listing_id)?.title || "Unknown",
      }));
    },
  });

  // Suggested listings based on profile
  const suggestedListings = useMemo(() => {
    if (!listings?.length || !profile) return listings || [];

    const userCerts = new Set((profile.certifications || []).map((c: string) => c.toLowerCase()));
    const userSpecs = new Set((profile.specializations || []).map((s: string) => s.toLowerCase()));
    const userLocation = profile.location?.toLowerCase() || "";

    return [...(listings || [])].map((listing) => {
      let score = 0;
      // Match by certifications
      (listing.certifications || []).forEach((c) => {
        if (userCerts.has(c.toLowerCase())) score += 3;
      });
      // Match by tags/specializations
      (listing.tags || []).forEach((t) => {
        if (userSpecs.has(t.toLowerCase())) score += 2;
      });
      // Match by location
      if (userLocation && listing.location?.toLowerCase().includes(userLocation)) score += 1;
      // Boost high-rated
      if (listing.average_rating >= 4) score += 1;
      return { ...listing, _score: score };
    })
    .filter((l) => l._score > 0)
    .sort((a, b) => b._score - a._score);
  }, [listings, profile]);

  const handleSelect = (listing: Listing) => {
    setSelectedListing(listing);
    setDetailOpen(true);
  };

  const handleCompare = (listing: Listing) => {
    setCompareList((prev) => {
      const exists = prev.find((l) => l.id === listing.id);
      if (exists) return prev.filter((l) => l.id !== listing.id);
      if (prev.length >= 3) return prev;
      return [...prev, listing];
    });
  };

  const renderListingGrid = (items: Listing[] | undefined, loading: boolean, emptyMessage: string, emptySubtext: string) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <ListingCardSkeleton key={i} />)}
        </div>
      );
    }
    if (items && items.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onSelect={handleSelect}
              onCompare={handleCompare}
              isComparing={!!compareList.find((l) => l.id === listing.id)}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-card-foreground mb-1">{emptyMessage}</p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">{emptySubtext}</p>
      </div>
    );
  };

  return (
    <AppLayout maxWidth="max-w-6xl">
      <MobileFilterDrawer title="Showcase Filters">
        <DirectorySidebar
          selectedType={selectedType}
          selectedCategory={selectedCategory}
          onTypeChange={setSelectedType}
          onCategoryChange={setSelectedCategory}
        />
      </MobileFilterDrawer>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="min-w-0 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold font-heading text-foreground">Showcase</h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Discover financial products & professional services
              </p>
            </div>
            <div className="flex items-center gap-2">
              {compareList.length >= 2 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={() => setShowCompare(!showCompare)}
                >
                  <GitCompare className="h-3.5 w-3.5" />
                  Compare ({compareList.length})
                </Button>
              )}
              {canCreate && (
                <Button size="sm" className="gap-1.5 text-xs" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Create Listing
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
              <TabsList className="inline-flex w-max sm:w-auto bg-muted/50">
                <TabsTrigger value="browse" className="gap-1.5 whitespace-nowrap">
                  <LayoutList className="h-3.5 w-3.5" /> Browse
                </TabsTrigger>
                <TabsTrigger value="suggested" className="gap-1.5 whitespace-nowrap">
                  <Sparkles className="h-3.5 w-3.5" /> Suggested
                </TabsTrigger>
                <TabsTrigger value="my-showcase" className="gap-1.5 whitespace-nowrap">
                  <User className="h-3.5 w-3.5" /> My Showcase
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Browse Tab */}
            <TabsContent value="browse" className="mt-4 space-y-4">
              {activeRole === "investor" && (
                <Alert className="border-primary/20 bg-primary/5">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertDescription className="text-xs text-muted-foreground">
                    As an Investor, you can browse, compare, and enquire about listings. To create listings, switch to an Issuer or Intermediary role.
                  </AlertDescription>
                </Alert>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products, services, providers..."
                  className="pl-9 h-10"
                />
              </div>

              {showCompare && compareList.length >= 2 && (
                <ListingComparison
                  listings={compareList}
                  onRemove={(id) => setCompareList((prev) => prev.filter((l) => l.id !== id))}
                  onClose={() => setShowCompare(false)}
                />
              )}

              {renderListingGrid(
                listings,
                isLoading,
                "No listings yet",
                canCreate
                  ? "Be the first to showcase your products or services to the FindOO community."
                  : "Financial products and services from verified professionals will appear here."
              )}
              {canCreate && !isLoading && !listings?.length && (
                <div className="text-center">
                  <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-3.5 w-3.5" /> Create First Listing
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Suggested Tab */}
            <TabsContent value="suggested" className="mt-4 space-y-4">
              <Alert className="border-accent/20 bg-accent/5">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
                <AlertDescription className="text-xs text-muted-foreground">
                  Listings matched to your certifications, specializations, and location.
                </AlertDescription>
              </Alert>

              {renderListingGrid(
                suggestedListings,
                isLoading,
                "No suggestions yet",
                "Complete your profile with certifications and specializations to get personalized recommendations."
              )}
            </TabsContent>

            {/* My Showcase Tab */}
            <TabsContent value="my-showcase" className="mt-4 space-y-4">
              {canCreate ? (
                /* Issuer / Intermediary View */
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">My Listings</h2>
                    <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => setCreateOpen(true)}>
                      <Plus className="h-3.5 w-3.5" /> New Listing
                    </Button>
                  </div>

                  {myListingsLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2].map((i) => <ListingCardSkeleton key={i} />)}
                    </div>
                  ) : myListings?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {myListings.map((listing) => (
                        <div key={listing.id} className="relative">
                          <ListingCard listing={listing} onSelect={handleSelect} onCompare={handleCompare} isComparing={false} />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Badge variant={listing.status === "active" ? "default" : "secondary"} className="text-[10px]">
                              {listing.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-card p-10 text-center">
                      <Package className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium text-card-foreground">No listings created</p>
                      <p className="text-xs text-muted-foreground mt-1">Showcase your products or services to the community.</p>
                      <Button size="sm" className="mt-4 gap-1.5" onClick={() => setCreateOpen(true)}>
                        <Plus className="h-3.5 w-3.5" /> Create Listing
                      </Button>
                    </div>
                  )}

                  {/* Received Enquiries */}
                  {(receivedEnquiries?.length ?? 0) > 0 && (
                    <div className="space-y-3 mt-6">
                      <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        Enquiries Received ({receivedEnquiries?.length})
                      </h2>
                      <div className="space-y-2">
                        {receivedEnquiries?.slice(0, 10).map((eq: any) => (
                          <Card key={eq.id} className="bg-card">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium text-foreground truncate">
                                    {eq.enquirer?.display_name || eq.enquirer?.full_name || "Someone"}
                                    <span className="text-muted-foreground font-normal"> enquired about </span>
                                    {eq.listing_title}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{eq.message}</p>
                                  <p className="text-[10px] text-muted-foreground mt-1">
                                    {new Date(eq.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge variant={eq.status === "pending" ? "secondary" : "outline"} className="text-[10px] shrink-0">
                                  {eq.status}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Investor View — show enquiry history */
                <>
                  <h2 className="text-sm font-semibold text-foreground">My Enquiries</h2>
                  {myEnquiries?.length ? (
                    <div className="space-y-2">
                      {myEnquiries.map((eq: any) => (
                        <Card key={eq.id} className="bg-card">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-medium text-foreground">
                                  {eq.listings?.title || "Listing"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{eq.message}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(eq.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <Badge variant={eq.status === "pending" ? "secondary" : "outline"} className="text-[10px] shrink-0">
                                {eq.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-border bg-card p-10 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm font-medium text-card-foreground">No enquiries yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Browse listings and send enquiries to get started.</p>
                      <Button size="sm" variant="outline" className="mt-4" onClick={() => setActiveTab("browse")}>
                        Browse Showcase
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <MemoizedDirectorySidebar
              selectedType={selectedType}
              selectedCategory={selectedCategory}
              onTypeChange={setSelectedType}
              onCategoryChange={setSelectedCategory}
            />
          </div>
        </aside>
      </div>

      <ListingDetailSheet
        listing={selectedListing}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
      <CreateListingDialog open={createOpen} onOpenChange={setCreateOpen} />
    </AppLayout>
  );
};

export default Directory;
