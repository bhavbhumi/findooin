import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Database, Search, RefreshCw, Download, MapPin, Building2, Hash, MoreHorizontal, Send, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateInvitation } from "@/hooks/useInvitations";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function AdminRegistryPage() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [syncing, setSyncing] = useState(false);
  const createInvite = useCreateInvitation();

  const handleCreateInvite = (entity: any, role: string) => {
    if (!entity.contact_email) {
      toast.error("This entity has no email — cannot create invitation");
      return;
    }
    createInvite.mutate({
      target_name: entity.entity_name,
      target_email: entity.contact_email.toLowerCase(),
      target_phone: entity.contact_phone || null,
      target_role: role,
      registry_entity_id: entity.id,
      notes: `From registry: ${entity.source.toUpperCase()} ${entity.registration_number || ""}`.trim(),
    });
  };

  const { data: entities = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-registry", search, sourceFilter],
    queryFn: async () => {
      let query = supabase
        .from("registry_entities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (sourceFilter !== "all") {
        query = query.eq("source", sourceFilter);
      }
      if (search) {
        query = query.or(
          `entity_name.ilike.%${search}%,registration_number.ilike.%${search}%,contact_email.ilike.%${search}%,city.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleAmfiSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("scrape-amfi", {
        body: { max_cities: 5 },
      });

      if (error) throw error;
      if (data?.success) {
        if (data.api_accessible === false && data.summary.total_found === 0) {
          toast.warning(
            "AMFI's website API is not accessible from server. Use 'Bulk Import' on the Invitations page with a CSV downloaded from AMFI's 'Locate Distributor' page instead.",
            { duration: 8000 }
          );
        } else {
          toast.success(
            `Synced ${data.summary.cities_processed} cities: ${data.summary.total_inserted} new, ${data.summary.total_updated} updated`
          );
        }
        refetch();
      } else {
        toast.error(data?.error || "Sync failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync AMFI data");
    } finally {
      setSyncing(false);
    }
  };

  const stats = {
    total: entities.length,
    amfi: entities.filter((e) => e.source === "amfi").length,
    sebi: entities.filter((e) => e.source === "sebi").length,
    manual: entities.filter((e) => e.source === "manual").length,
    matched: entities.filter((e) => e.matched_user_id).length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Entities", value: stats.total, icon: Database },
          { label: "AMFI", value: stats.amfi, icon: Building2 },
          { label: "SEBI", value: stats.sebi, icon: Building2 },
          { label: "Manual", value: stats.manual, icon: Hash },
          { label: "Matched Users", value: stats.matched, icon: MapPin },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sync Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4" /> Registry Sync
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Scrape distributor data from AMFI and regulatory sources into the registry
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAmfiSync} disabled={syncing}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
                {syncing ? "Syncing AMFI..." : "Sync AMFI (5 cities)"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Registry Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" /> Registry Entities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, registration number, email, or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="amfi">AMFI</SelectItem>
                <SelectItem value="sebi">SEBI</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : entities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Database className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No registry entities found</p>
              <p className="text-xs mt-1">Use the Sync button above to import from AMFI</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Entity</TableHead>
                    <TableHead className="text-xs">Reg. Number</TableHead>
                    <TableHead className="text-xs">Source</TableHead>
                    <TableHead className="text-xs">Location</TableHead>
                    <TableHead className="text-xs">Contact</TableHead>
                    <TableHead className="text-xs">Synced</TableHead>
                     <TableHead className="text-xs">Status</TableHead>
                     <TableHead className="text-xs w-[50px]"></TableHead>
                   </TableRow>
                 </TableHeader>
                <TableBody>
                  {entities.map((entity) => (
                    <TableRow key={entity.id}>
                      <TableCell>
                        <p className="text-sm font-medium truncate max-w-[200px]">{entity.entity_name}</p>
                        {entity.entity_type && (
                          <p className="text-[10px] text-muted-foreground capitalize">{entity.entity_type}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {entity.registration_number ? (
                          <span className="font-mono text-xs">{entity.registration_number}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {entity.registration_category && (
                          <p className="text-[10px] text-muted-foreground">{entity.registration_category}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[9px] uppercase">{entity.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs">{entity.city || "—"}</p>
                        {entity.state && <p className="text-[10px] text-muted-foreground">{entity.state}</p>}
                        {entity.pincode && <p className="text-[10px] text-muted-foreground font-mono">{entity.pincode}</p>}
                      </TableCell>
                      <TableCell>
                        <p className="text-xs truncate max-w-[150px]">{entity.contact_email || "—"}</p>
                        {entity.contact_phone && (
                          <p className="text-[10px] text-muted-foreground">{entity.contact_phone}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {entity.last_synced_at ? (
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(entity.last_synced_at), { addSuffix: true })}
                          </p>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={entity.matched_user_id ? "default" : entity.status === "active" ? "secondary" : "outline"}
                          className="text-[9px]"
                        >
                          {entity.matched_user_id ? "Matched" : entity.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {!entity.matched_user_id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleCreateInvite(entity, "intermediary")}
                                disabled={!entity.contact_email || createInvite.isPending}
                              >
                                <Send className="h-3.5 w-3.5 mr-2" /> Invite as Intermediary
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleCreateInvite(entity, "issuer")}
                                disabled={!entity.contact_email || createInvite.isPending}
                              >
                                <Mail className="h-3.5 w-3.5 mr-2" /> Invite as Issuer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
