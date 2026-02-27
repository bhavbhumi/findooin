import { Star, Eye, MessageCircle, MapPin, BadgeCheck, TrendingUp, Shield, Package, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/hooks/useListings";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES } from "@/hooks/useListings";

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  onCompare?: (listing: Listing) => void;
  isComparing?: boolean;
}

export const ListingCard = ({ listing, onSelect, onCompare, isComparing }: ListingCardProps) => {
  const categoryLabel =
    listing.listing_type === "product"
      ? PRODUCT_CATEGORIES.find((c) => c.value === listing.product_category)?.label
      : SERVICE_CATEGORIES.find((c) => c.value === listing.service_category)?.label;

  const ownerName = listing.owner?.display_name || listing.owner?.full_name || "Unknown";
  const isVerified = listing.owner?.verification_status === "verified";

  return (
    <div
      className={`rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all cursor-pointer group ${
        isComparing ? "border-primary ring-2 ring-primary/20" : "border-border"
      }`}
      onClick={() => onSelect(listing)}
    >
      {/* Header stripe */}
      <div className={`h-1.5 ${listing.listing_type === "product" ? "bg-primary" : "bg-accent"}`} />

      <div className="p-4 space-y-3">
        {/* Type + Category */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] gap-1">
            {listing.listing_type === "product" ? (
              <Package className="h-2.5 w-2.5" />
            ) : (
              <Wrench className="h-2.5 w-2.5" />
            )}
            {categoryLabel || listing.listing_type}
          </Badge>
          {listing.risk_level && (
            <Badge variant="outline" className="text-[10px]">
              {listing.risk_level} risk
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2">{listing.description}</p>

        {/* Key metrics */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {listing.average_rating > 0 && (
            <span className="flex items-center gap-0.5 text-amber-500 font-medium">
              <Star className="h-3 w-3 fill-current" />
              {listing.average_rating} ({listing.review_count})
            </span>
          )}
          <span className="flex items-center gap-0.5">
            <Eye className="h-3 w-3" /> {listing.view_count}
          </span>
          <span className="flex items-center gap-0.5">
            <MessageCircle className="h-3 w-3" /> {listing.enquiry_count}
          </span>
        </div>

        {/* Min investment / pricing */}
        {listing.min_investment && (
          <div className="flex items-center gap-1 text-xs font-medium text-card-foreground">
            <TrendingUp className="h-3 w-3 text-primary" />
            Min ₹{listing.min_investment.toLocaleString("en-IN")}
          </div>
        )}

        {/* Owner */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground overflow-hidden">
              {listing.owner?.avatar_url ? (
                <img src={listing.owner.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                ownerName[0]?.toUpperCase()
              )}
            </div>
            <div>
              <p className="text-[10px] font-medium text-card-foreground flex items-center gap-1">
                {ownerName}
                {isVerified && <BadgeCheck className="h-3 w-3 text-accent" />}
              </p>
              {listing.owner?.organization && (
                <p className="text-[9px] text-muted-foreground">{listing.owner.organization}</p>
              )}
            </div>
          </div>
          {listing.location && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" /> {listing.location}
            </span>
          )}
        </div>

        {/* Compare button */}
        {onCompare && (
          <Button
            variant={isComparing ? "default" : "outline"}
            size="sm"
            className="w-full text-xs h-7"
            onClick={(e) => {
              e.stopPropagation();
              onCompare(listing);
            }}
          >
            {isComparing ? "Remove from Compare" : "Add to Compare"}
          </Button>
        )}
      </div>
    </div>
  );
};
