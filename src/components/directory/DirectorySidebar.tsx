import { Package, Wrench, Star, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, type ListingType } from "@/hooks/useListings";

interface DirectorySidebarProps {
  selectedType: ListingType | null;
  selectedCategory: string | null;
  onTypeChange: (type: ListingType | null) => void;
  onCategoryChange: (cat: string | null) => void;
}

export const DirectorySidebar = ({
  selectedType,
  selectedCategory,
  onTypeChange,
  onCategoryChange,
}: DirectorySidebarProps) => {
  const categories = selectedType === "service" ? SERVICE_CATEGORIES : PRODUCT_CATEGORIES;

  return (
    <div className="space-y-4">
      {/* Type Filter */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">Type</h3>
        </div>
        <div className="p-3 space-y-1">
          <button
            onClick={() => { onTypeChange(null); onCategoryChange(null); }}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
              !selectedType ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            All Listings
          </button>
          <button
            onClick={() => { onTypeChange("product"); onCategoryChange(null); }}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              selectedType === "product" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Package className="h-3.5 w-3.5" /> Products
          </button>
          <button
            onClick={() => { onTypeChange("service"); onCategoryChange(null); }}
            className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              selectedType === "service" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" /> Services
          </button>
        </div>
      </div>

      {/* Category Filter */}
      {selectedType && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">
              {selectedType === "product" ? "Product" : "Service"} Category
            </h3>
          </div>
          <div className="p-3 space-y-0.5 max-h-[300px] overflow-y-auto">
            <button
              onClick={() => onCategoryChange(null)}
              className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                !selectedCategory ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.value}
                onClick={() => onCategoryChange(c.value)}
                className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-colors ${
                  selectedCategory === c.value ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
          <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">Popular</h3>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-[10px] text-muted-foreground">Top categories by listings and reviews will appear here as the directory grows.</p>
        </div>
      </div>
    </div>
  );
};
