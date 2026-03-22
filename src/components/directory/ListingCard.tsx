import { memo, useState } from "react";
import { Star, Eye, MessageCircle, MapPin, BadgeCheck, TrendingUp, Package, Wrench, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
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

export const ListingCard = memo(({ listing, onSelect, onCompare, isComparing }: ListingCardProps) => {
  const [hovered, setHovered] = useState(false);
  const categoryLabel =
    listing.listing_type === "product"
      ? PRODUCT_CATEGORIES.find((c) => c.value === listing.product_category)?.label
      : SERVICE_CATEGORIES.find((c) => c.value === listing.service_category)?.label;

  const ownerName = listing.owner?.display_name || listing.owner?.full_name || "Unknown";
  const isVerified = listing.owner?.verification_status === "verified";

  return (
    <Card
      className={`group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border hover:border-primary/25 hover:bg-card/80 hover:backdrop-blur-sm relative overflow-hidden ${
        isComparing ? "ring-2 ring-primary/20 border-primary" : ""
      }`}
      onClick={() => onSelect(listing)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(listing); } }}
    >
      {/* Hover glow accent */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <CardContent className="p-4 space-y-3 relative z-10">
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

        {/* Description — expands on hover */}
        <p className={`text-xs text-muted-foreground transition-all duration-300 ${hovered ? "line-clamp-3" : "line-clamp-2"}`}>
          {listing.description}
        </p>

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

        {/* Certifications preview on hover */}
        <AnimatePresence>
          {hovered && listing.certifications && listing.certifications.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-1"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {listing.certifications.slice(0, 3).map((cert) => (
                <Badge key={cert} variant="outline" className="text-[9px] px-1.5 py-0 border-accent/30 text-accent">
                  {cert}
                </Badge>
              ))}
              {listing.certifications.length > 3 && (
                <span className="text-[9px] text-muted-foreground">+{listing.certifications.length - 3}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Hover CTA bar */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              className="flex items-center gap-2 pt-2"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="default"
                size="sm"
                className="flex-1 text-xs h-7 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(listing);
                }}
              >
                View Details <ArrowRight className="h-3 w-3" />
              </Button>
              {onCompare && (
                <Button
                  variant={isComparing ? "secondary" : "outline"}
                  size="sm"
                  className="text-xs h-7 gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompare(listing);
                  }}
                >
                  {isComparing ? "Remove" : "Compare"}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare button - always visible when not hovered */}
        {!hovered && onCompare && (
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
      </CardContent>
    </Card>
  );
});