import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateListing, PRODUCT_CATEGORIES, SERVICE_CATEGORIES, type ListingType } from "@/hooks/useListings";
import { Package, Wrench, Plus, X } from "lucide-react";
import { z } from "zod";
import { useRole } from "@/contexts/RoleContext";

const listingSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
  listing_type: z.enum(["product", "service"]),
});

interface CreateListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateListingDialog = ({ open, onOpenChange }: CreateListingDialogProps) => {
  const { activeRole } = useRole();
  const canCreateProduct = activeRole !== "intermediary"; // Intermediary can't create Product
  const canCreateService = activeRole !== "issuer"; // Issuer can't create Service
  const defaultType: ListingType = canCreateProduct ? "product" : "service";

  const [listingType, setListingType] = useState<ListingType>(defaultType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [minInvestment, setMinInvestment] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [tenure, setTenure] = useState("");
  const [returnsInfo, setReturnsInfo] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [newHighlight, setNewHighlight] = useState("");
  const [tags, setTags] = useState("");

  const createListing = useCreateListing();

  const categories = listingType === "product" ? PRODUCT_CATEGORIES : SERVICE_CATEGORIES;

  const handleSubmit = () => {
    const validation = listingSchema.safeParse({ title, description, listing_type: listingType });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }

    const payload: any = {
      listing_type: listingType,
      title: title.trim(),
      description: description.trim(),
      highlights,
      location: location.trim() || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status: "active",
    };

    if (listingType === "product") {
      payload.product_category = category;
      payload.min_investment = minInvestment ? Number(minInvestment) : null;
      payload.risk_level = riskLevel || null;
      payload.tenure = tenure || null;
      payload.returns_info = returnsInfo.trim() || null;
    } else {
      payload.service_category = category;
    }

    createListing.mutate(payload, {
      onSuccess: () => {
        toast.success("Listing created successfully!");
        onOpenChange(false);
        resetForm();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to create listing");
      },
    });
  };

  const resetForm = () => {
    setTitle(""); setDescription(""); setCategory(""); setLocation("");
    setMinInvestment(""); setRiskLevel(""); setTenure(""); setReturnsInfo("");
    setHighlights([]); setNewHighlight(""); setTags("");
  };

  const addHighlight = () => {
    const h = newHighlight.trim();
    if (h && highlights.length < 6) {
      setHighlights([...highlights, h]);
      setNewHighlight("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-heading">Create Listing</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Type selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { setListingType("product"); setCategory(""); }}
              disabled={!canCreateProduct}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                !canCreateProduct
                  ? "border-border text-muted-foreground/40 cursor-not-allowed opacity-50"
                  : listingType === "product"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
              title={!canCreateProduct ? "Intermediaries cannot create products" : undefined}
            >
              <Package className="h-4 w-4" /> Product
            </button>
            <button
              onClick={() => { setListingType("service"); setCategory(""); }}
              disabled={!canCreateService}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                !canCreateService
                  ? "border-border text-muted-foreground/40 cursor-not-allowed opacity-50"
                  : listingType === "service"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted/50"
              }`}
              title={!canCreateService ? "Issuers cannot create services" : undefined}
            >
              <Wrench className="h-4 w-4" /> Service
            </button>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-xs">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label className="text-xs">Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. SBI Bluechip Fund – Direct Growth"
              maxLength={150}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product or service in detail..."
              rows={4}
              maxLength={2000}
            />
          </div>

          {/* Product-specific fields */}
          {listingType === "product" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Min Investment (₹)</Label>
                <Input
                  type="number"
                  value={minInvestment}
                  onChange={(e) => setMinInvestment(e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Risk Level</Label>
                <Select value={riskLevel} onValueChange={setRiskLevel}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="very_high">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tenure</Label>
                <Input
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                  placeholder="e.g. 3-5 years"
                  maxLength={50}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Returns Info</Label>
                <Input
                  value={returnsInfo}
                  onChange={(e) => setReturnsInfo(e.target.value)}
                  placeholder="e.g. 12% CAGR (5Y)"
                  maxLength={100}
                />
              </div>
            </div>
          )}

          {/* Location */}
          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mumbai, Pan India"
              maxLength={100}
            />
          </div>

          {/* Highlights */}
          <div className="space-y-1.5">
            <Label className="text-xs">Key Highlights (max 6)</Label>
            <div className="flex gap-2">
              <Input
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Add a highlight"
                maxLength={100}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
              />
              <Button type="button" size="icon" variant="outline" onClick={addHighlight} disabled={highlights.length >= 6}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {highlights.map((h, i) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-muted px-2 py-1 rounded-full">
                    {h}
                    <button onClick={() => setHighlights(highlights.filter((_, j) => j !== i))}>
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs">Tags (comma-separated)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="equity, large-cap, growth"
              maxLength={200}
            />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={createListing.isPending}>
            {createListing.isPending ? "Creating..." : "Publish Listing"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
