import { useState, memo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Plus, Package, LayoutGrid, GitCompare, Info } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { useListings, type Listing, type ListingType } from "@/hooks/useListings";
import { ListingCard } from "@/components/directory/ListingCard";
import { ListingCardSkeleton } from "@/components/skeletons/ListingCardSkeleton";
import { DirectorySidebar } from "@/components/directory/DirectorySidebar";
import { ListingDetailSheet } from "@/components/directory/ListingDetailSheet";
import { CreateListingDialog } from "@/components/directory/CreateListingDialog";
import { ListingComparison } from "@/components/directory/ListingComparison";
import { useRole } from "@/contexts/RoleContext";

const MemoizedDirectorySidebar = memo(DirectorySidebar);

const Directory = () => {
  usePageMeta({ title: "Showcase" });
  const { activeRole } = useRole();

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

  return (
    <AppLayout maxWidth="max-w-6xl">
      {/* Mobile filter drawer */}
      <MobileFilterDrawer title="Showcase Filters">
        <DirectorySidebar
          selectedType={selectedType}
          selectedCategory={selectedCategory}
          onTypeChange={setSelectedType}
          onCategoryChange={setSelectedCategory}
        />
      </MobileFilterDrawer>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
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

          {/* Investor info banner */}
          {activeRole === "investor" && (
            <Alert className="border-primary/20 bg-primary/5">
              <Info className="h-4 w-4 text-primary" />
              <AlertDescription className="text-xs text-muted-foreground">
                As an Investor, you can browse, compare, and enquire about listings. To create listings, switch to an Issuer or Intermediary role from your profile.
              </AlertDescription>
            </Alert>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, services, providers..."
              className="pl-9 h-10"
            />
          </div>

          {/* Comparison panel */}
          {showCompare && compareList.length >= 2 && (
            <ListingComparison
              listings={compareList}
              onRemove={(id) => setCompareList((prev) => prev.filter((l) => l.id !== id))}
              onClose={() => setShowCompare(false)}
            />
          )}

          {/* Listings grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <ListingCardSkeleton key={i} />)}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSelect={handleSelect}
                  onCompare={handleCompare}
                  isComparing={!!compareList.find((l) => l.id === listing.id)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-card-foreground mb-1">No listings yet</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                {canCreate
                  ? "Be the first to showcase your products or services to the FindOO community."
                  : "Financial products and services from verified professionals will appear here."}
              </p>
              {canCreate && (
                <Button size="sm" className="mt-4 gap-1.5" onClick={() => setCreateOpen(true)}>
                  <Plus className="h-3.5 w-3.5" /> Create First Listing
                </Button>
              )}
            </div>
          )}
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

      {/* Detail sheet */}
      <ListingDetailSheet
        listing={selectedListing}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Create dialog */}
      <CreateListingDialog open={createOpen} onOpenChange={setCreateOpen} />
    </AppLayout>
  );
};

export default Directory;
