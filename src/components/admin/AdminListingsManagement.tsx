/**
 * AdminListingsManagement — Admin view for managing all marketplace listings.
 * Provides stats, filtering, and moderation (approve, suspend, delete).
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import {
  ShoppingBag, Search, ChevronLeft, ChevronRight, Eye, Star,
  Trash2, CheckCircle2, Pause, Play, MessageSquare, Clock, BarChart3
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  suspended: "bg-destructive/10 text-destructive border-destructive/20",
  archived: "bg-accent/10 text-accent border-accent/20",
};

const PAGE_SIZE = 15;

export function AdminListingsManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: listings, isLoading } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("listings")
        .select("*, profiles:user_id(full_name, display_name, avatar_url)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateListing = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("listings").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listing status updated");
    },
  });

  const deleteListing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("listings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Listing deleted");
    },
  });

  const filtered = useMemo(() => {
    if (!listings) return [];
    return listings.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (typeFilter !== "all" && l.listing_type !== typeFilter) return false;
      if (search) {
        return l.title.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });
  }, [listings, search, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    if (!listings) return { total: 0, active: 0, draft: 0, totalEnquiries: 0, avgRating: 0 };
    const rated = listings.filter((l) => l.review_count > 0);
    return {
      total: listings.length,
      active: listings.filter((l) => l.status === "active").length,
      draft: listings.filter((l) => l.status === "draft").length,
      totalEnquiries: listings.reduce((s, l) => s + (l.enquiry_count || 0), 0),
      avgRating: rated.length > 0 ? (rated.reduce((s, l) => s + l.average_rating, 0) / rated.length).toFixed(1) : "—",
    };
  }, [listings]);

  if (isLoading) return <FindooLoader text="Loading listings..." />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Listings", value: stats.total, icon: ShoppingBag },
          { label: "Active", value: stats.active, icon: Play },
          { label: "Drafts", value: stats.draft, icon: Clock },
          { label: "Enquiries", value: stats.totalEnquiries, icon: MessageSquare },
          { label: "Avg Rating", value: stats.avgRating, icon: Star },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search listings..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="product">Products</SelectItem>
            <SelectItem value="service">Services</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</p>

      {/* Listing list */}
      <div className="space-y-2">
        {paged.map((listing) => {
          const owner = listing.profiles as any;
          return (
            <Card key={listing.id} className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold truncate">{listing.title}</h3>
                      <Badge variant="outline" className={`text-[9px] ${statusColors[listing.status] || ""}`}>
                        {listing.status}
                      </Badge>
                      <Badge variant="outline" className="text-[9px]">{listing.listing_type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{listing.view_count} views</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{listing.enquiry_count} enquiries</span>
                      {listing.review_count > 0 && (
                        <span className="flex items-center gap-1"><Star className="h-3 w-3" />{listing.average_rating.toFixed(1)} ({listing.review_count})</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
                    </div>
                    {owner && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Owner: {owner.display_name || owner.full_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {listing.status === "draft" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateListing.mutate({ id: listing.id, status: "active" })}>
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </Button>
                    )}
                    {listing.status === "active" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateListing.mutate({ id: listing.id, status: "suspended" })}>
                        <Pause className="h-3 w-3" /> Suspend
                      </Button>
                    )}
                    {listing.status === "suspended" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateListing.mutate({ id: listing.id, status: "active" })}>
                        <Play className="h-3 w-3" /> Reactivate
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => deleteListing.mutate(listing.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {paged.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No listings found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
