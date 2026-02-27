import { X, Star, MapPin, BadgeCheck, Package, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Listing } from "@/hooks/useListings";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES } from "@/hooks/useListings";

interface ListingComparisonProps {
  listings: Listing[];
  onRemove: (id: string) => void;
  onClose: () => void;
}

export const ListingComparison = ({ listings, onRemove, onClose }: ListingComparisonProps) => {
  if (listings.length < 2) return null;

  const fields: { label: string; render: (l: Listing) => React.ReactNode }[] = [
    {
      label: "Type",
      render: (l) => (
        <Badge variant="secondary" className="text-[10px] gap-1">
          {l.listing_type === "product" ? <Package className="h-2.5 w-2.5" /> : <Wrench className="h-2.5 w-2.5" />}
          {l.listing_type === "product"
            ? PRODUCT_CATEGORIES.find((c) => c.value === l.product_category)?.label
            : SERVICE_CATEGORIES.find((c) => c.value === l.service_category)?.label}
        </Badge>
      ),
    },
    {
      label: "Provider",
      render: (l) => (
        <span className="text-xs font-medium flex items-center gap-1">
          {l.owner?.display_name || l.owner?.full_name}
          {l.owner?.verification_status === "verified" && <BadgeCheck className="h-3 w-3 text-accent" />}
        </span>
      ),
    },
    {
      label: "Rating",
      render: (l) => (
        <span className="flex items-center gap-1 text-xs">
          <Star className={`h-3 w-3 ${l.average_rating > 0 ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
          {l.average_rating > 0 ? `${l.average_rating} (${l.review_count})` : "No reviews"}
        </span>
      ),
    },
    {
      label: "Min Investment",
      render: (l) => (
        <span className="text-xs font-medium">
          {l.min_investment ? `₹${l.min_investment.toLocaleString("en-IN")}` : "—"}
        </span>
      ),
    },
    {
      label: "Returns",
      render: (l) => <span className="text-xs">{l.returns_info || "—"}</span>,
    },
    {
      label: "Risk",
      render: (l) => <span className="text-xs capitalize">{l.risk_level || "—"}</span>,
    },
    {
      label: "Tenure",
      render: (l) => <span className="text-xs">{l.tenure || "—"}</span>,
    },
    {
      label: "Location",
      render: (l) => (
        <span className="text-xs flex items-center gap-0.5">
          {l.location ? <><MapPin className="h-2.5 w-2.5" /> {l.location}</> : "—"}
        </span>
      ),
    },
    {
      label: "Enquiries",
      render: (l) => <span className="text-xs">{l.enquiry_count}</span>,
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold font-heading text-card-foreground">Compare ({listings.length})</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="p-3 text-left text-muted-foreground font-medium min-w-[100px]">Field</th>
              {listings.map((l) => (
                <th key={l.id} className="p-3 text-left min-w-[180px]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-card-foreground line-clamp-1">{l.title}</span>
                    <button onClick={() => onRemove(l.id)} className="text-muted-foreground hover:text-destructive ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.label} className="border-b border-border last:border-0">
                <td className="p-3 text-muted-foreground font-medium">{f.label}</td>
                {listings.map((l) => (
                  <td key={l.id} className="p-3">{f.render(l)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
