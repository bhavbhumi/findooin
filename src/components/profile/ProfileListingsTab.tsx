import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRole, type AppRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FindooLoader } from "@/components/FindooLoader";
import {
  Store, Star, Eye, MessageSquare, ExternalLink, Package, Briefcase,
  BarChart3, Landmark, UserCheck, ArrowRight,
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Listing = Tables<"listings">;
type Enquiry = Tables<"listing_enquiries"> & { listing?: Listing };

interface Props {
  profileId: string;
  isOwnProfile: boolean;
  roles: { role: string; sub_type?: string | null }[];
}

const ROLE_ICON: Record<string, any> = {
  issuer: Landmark,
  intermediary: UserCheck,
  investor: BarChart3,
};

export function ProfileListingsTab({ profileId, isOwnProfile, roles }: Props) {
  const { activeRole } = useRole();
  const [listings, setListings] = useState<Listing[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const userRoleNames = roles.map((r) => r.role);
  const isProvider = userRoleNames.includes("issuer") || userRoleNames.includes("intermediary");
  const isInvestor = userRoleNames.includes("investor");

  // For own profile use activeRole to decide view; for others infer from their roles
  const showProviderView = isOwnProfile
    ? activeRole === "issuer" || activeRole === "intermediary"
    : isProvider;

  useEffect(() => {
    loadData();
  }, [profileId, showProviderView]);

  const loadData = async () => {
    setLoading(true);
    if (showProviderView) {
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", profileId)
        .order("created_at", { ascending: false });
      setListings(data ?? []);
    } else if (isOwnProfile && isInvestor) {
      const { data } = await supabase
        .from("listing_enquiries")
        .select("*, listing:listings(*)")
        .eq("enquirer_id", profileId)
        .order("created_at", { ascending: false });
      setEnquiries((data as any) ?? []);
    }
    setLoading(false);
  };

  if (loading) return <FindooLoader size="sm" text="Loading showcase..." />;

  // ─── Provider View: My Listings ───
  if (showProviderView) {
    const active = listings.filter((l) => l.status === "active");
    const draft = listings.filter((l) => l.status === "draft");
    const paused = listings.filter((l) => l.status === "paused" || l.status === "archived");

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">
              {isOwnProfile ? "My Listings" : "Listings"}
            </h3>
            <Badge variant="secondary" className="text-[10px]">{listings.length} total</Badge>
          </div>
          {isOwnProfile && (
            <Link to="/showcase">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-3 w-3 mr-1.5" /> Go to Showcase
              </Button>
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Active" value={active.length} icon={Package} color="text-status-success" />
          <StatCard label="Draft" value={draft.length} icon={Store} color="text-muted-foreground" />
          <StatCard label="Paused" value={paused.length} icon={Store} color="text-status-warning" />
        </div>

        {listings.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <Store className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {isOwnProfile ? "You haven't created any listings yet" : "No listings yet"}
              </p>
              {isOwnProfile && (
              <Link to="/showcase">
                  <Button size="sm" className="mt-3">
                    <ArrowRight className="h-3 w-3 mr-1" /> Create Your First Listing
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {listings.slice(0, 5).map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {listings.length > 5 && (
          <Link to="/showcase">
            <Button variant="outline" className="w-full" size="sm">
              <ExternalLink className="h-3 w-3 mr-1.5" /> View All ({listings.length} listings)
            </Button>
          </Link>
        )}
      </div>
    );
  }

  // ─── Investor View: My Enquiries ───
  if (isOwnProfile && isInvestor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">My Enquiries</h3>
            <Badge variant="secondary" className="text-[10px]">{enquiries.length}</Badge>
          </div>
          <Link to="/showcase">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3 w-3 mr-1.5" /> Browse Showcase
            </Button>
          </Link>
        </div>

        {enquiries.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No enquiries yet</p>
              <p className="text-xs text-muted-foreground mt-1">Browse the showcase and send enquiries to providers.</p>
              <Link to="/showcase">
                <Button size="sm" className="mt-3">
                  <ArrowRight className="h-3 w-3 mr-1" /> Explore Showcase
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {enquiries.slice(0, 5).map((enq) => (
              <Card key={enq.id} className="border-border">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{(enq.listing as any)?.title ?? "Listing"}</p>
                    <p className="text-xs text-muted-foreground truncate">{enq.message}</p>
                  </div>
                  <Badge
                    variant={enq.status === "replied" ? "default" : "secondary"}
                    className="text-[10px] ml-2 shrink-0"
                  >
                    {enq.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Visitor viewing non-provider profile ───
  return null;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <Card className="border-border">
      <CardContent className="p-3 text-center">
        <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
        <p className="text-lg font-bold">{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function ListingRow({ listing }: { listing: Listing }) {
  const statusColor: Record<string, string> = {
    active: "bg-status-success/10 text-status-success",
    draft: "bg-muted text-muted-foreground",
    paused: "bg-status-warning/10 text-status-warning",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="border-border hover:border-primary/30 transition-colors">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {listing.listing_type === "product" ? (
            <Package className="h-4 w-4 text-primary" />
          ) : (
            <Briefcase className="h-4 w-4 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{listing.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground capitalize">{listing.listing_type}</span>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Eye className="h-2.5 w-2.5" /> {listing.view_count}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Star className="h-2.5 w-2.5" /> {listing.average_rating?.toFixed(1) ?? "0.0"}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MessageSquare className="h-2.5 w-2.5" /> {listing.enquiry_count}
            </span>
          </div>
        </div>
        <Badge className={`text-[10px] ${statusColor[listing.status] ?? ""}`}>
          {listing.status}
        </Badge>
      </CardContent>
    </Card>
  );
}
