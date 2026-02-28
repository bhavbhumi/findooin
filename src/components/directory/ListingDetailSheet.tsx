import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, MapPin, BadgeCheck, TrendingUp, Package, Wrench, Send, CheckCircle, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Listing } from "@/hooks/useListings";
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, useListingReviews, useSubmitReview, useSubmitEnquiry } from "@/hooks/useListings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ListingDetailSheetProps {
  listing: Listing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ListingDetailSheet = ({ listing, open, onOpenChange }: ListingDetailSheetProps) => {
  const [enquiryMsg, setEnquiryMsg] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const { data: reviews } = useListingReviews(listing?.id ?? null);
  const submitReview = useSubmitReview();
  const submitEnquiry = useSubmitEnquiry();

  if (!listing) return null;

  const categoryLabel =
    listing.listing_type === "product"
      ? PRODUCT_CATEGORIES.find((c) => c.value === listing.product_category)?.label
      : SERVICE_CATEGORIES.find((c) => c.value === listing.service_category)?.label;

  const ownerName = listing.owner?.display_name || listing.owner?.full_name || "Unknown";

  const handleEnquiry = () => {
    if (!enquiryMsg.trim()) { toast.error("Please enter a message"); return; }
    submitEnquiry.mutate(
      { listing_id: listing.id, message: enquiryMsg.trim() },
      {
        onSuccess: () => { toast.success("Enquiry sent!"); setEnquiryMsg(""); setShowEnquiry(false); },
        onError: (err: any) => toast.error(err.message || "Failed to send enquiry"),
      }
    );
  };

  const handleReview = () => {
    submitReview.mutate(
      { listing_id: listing.id, rating: reviewRating, review_text: reviewText.trim() },
      {
        onSuccess: () => { toast.success("Review submitted!"); setReviewText(""); setShowReview(false); },
        onError: (err: any) => toast.error(err.message || "Failed to submit review"),
      }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-[10px] gap-1">
              {listing.listing_type === "product" ? <Package className="h-2.5 w-2.5" /> : <Wrench className="h-2.5 w-2.5" />}
              {categoryLabel}
            </Badge>
            {listing.risk_level && <Badge variant="outline" className="text-[10px]">{listing.risk_level} risk</Badge>}
          </div>
          <SheetTitle className="text-lg font-heading text-left">{listing.title}</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Owner */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
            <Avatar className="h-10 w-10">
              <AvatarImage src={listing.owner?.avatar_url || undefined} />
              <AvatarFallback className="text-xs">{ownerName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-card-foreground flex items-center gap-1">
                {ownerName}
                {listing.owner?.verification_status === "verified" && <BadgeCheck className="h-3.5 w-3.5 text-accent" />}
              </p>
              {listing.owner?.organization && <p className="text-xs text-muted-foreground">{listing.owner.organization}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-card-foreground uppercase tracking-wider mb-2">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-3 gap-2">
            {listing.min_investment != null && (
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Min Investment</p>
                <p className="text-sm font-bold text-card-foreground">₹{listing.min_investment.toLocaleString("en-IN")}</p>
              </div>
            )}
            {listing.returns_info && (
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Returns</p>
                <p className="text-sm font-bold text-card-foreground">{listing.returns_info}</p>
              </div>
            )}
            {listing.tenure && (
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Tenure</p>
                <p className="text-sm font-bold text-card-foreground">{listing.tenure}</p>
              </div>
            )}
          </div>

          {/* Highlights */}
          {listing.highlights && listing.highlights.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-card-foreground uppercase tracking-wider mb-2">Highlights</h4>
              <ul className="space-y-1.5">
                {listing.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Location + Tags */}
          <div className="flex flex-wrap gap-2">
            {listing.location && (
              <Badge variant="outline" className="text-[10px] gap-1">
                <MapPin className="h-2.5 w-2.5" /> {listing.location}
              </Badge>
            )}
            {listing.tags?.map((t) => (
              <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
            ))}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setShowEnquiry(!showEnquiry)} className="gap-1.5">
              <Send className="h-3.5 w-3.5" /> Request Quote
            </Button>
            <Button variant="outline" onClick={() => setShowReview(!showReview)} className="gap-1.5">
              <Star className="h-3.5 w-3.5" /> Write Review
            </Button>
          </div>

          {/* Enquiry form */}
          {showEnquiry && (
            <div className="space-y-2 p-3 rounded-xl border border-border bg-muted/20">
              <p className="text-xs font-medium text-card-foreground">Send Enquiry</p>
              <Textarea
                value={enquiryMsg}
                onChange={(e) => setEnquiryMsg(e.target.value)}
                placeholder="I'm interested in this listing..."
                rows={3}
                maxLength={500}
              />
              <Button size="sm" onClick={handleEnquiry} disabled={submitEnquiry.isPending}>
                {submitEnquiry.isPending ? "Sending..." : "Send"}
              </Button>
            </div>
          )}

          {/* Review form */}
          {showReview && (
            <div className="space-y-2 p-3 rounded-xl border border-border bg-muted/20">
              <p className="text-xs font-medium text-card-foreground">Your Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={`h-5 w-5 ${s <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Write your review..."
                rows={3}
                maxLength={500}
              />
              <Button size="sm" onClick={handleReview} disabled={submitReview.isPending}>
                {submitReview.isPending ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          )}

          {/* Reviews list */}
          <div>
            <h4 className="text-xs font-semibold text-card-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageCircle className="h-3.5 w-3.5" />
              Reviews ({reviews?.length || 0})
            </h4>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={r.reviewer?.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px]">{(r.reviewer?.display_name || r.reviewer?.full_name || "?")[0]}</AvatarFallback>
                      </Avatar>
                      <p className="text-xs font-medium text-card-foreground">{r.reviewer?.display_name || r.reviewer?.full_name}</p>
                      <div className="flex gap-0.5 ml-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                        ))}
                      </div>
                    </div>
                    {r.review_text && <p className="text-xs text-muted-foreground">{r.review_text}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(r.created_at), "dd MMM yyyy")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
