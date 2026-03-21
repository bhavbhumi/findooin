import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Database, Search, RefreshCw, MoreHorizontal, Send, Mail, ExternalLink, FileUp, Globe, Clock, CheckCircle2, XCircle, Loader2, Shield, Landmark, Umbrella, PiggyBank, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateInvitation } from "@/hooks/useInvitations";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";
import { RegistryImportWizard } from "@/components/admin/RegistryImportWizard";

const SOURCES = [
  { id: "amfi", label: "AMFI", icon: Landmark, color: "text-blue-600", desc: "Mutual Fund Distributors", url: "https://www.amfiindia.com/locate-distributor" },
  { id: "sebi", label: "SEBI", icon: Shield, color: "text-emerald-600", desc: "37 Registry Types — 35K+ Entities", url: "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes" },
  { id: "irdai", label: "IRDAI", icon: Umbrella, color: "text-orange-600", desc: "Insurance Brokers", url: "https://irdai.gov.in/list-of-brokers" },
  { id: "pfrda", label: "PFRDA", icon: PiggyBank, color: "text-purple-600", desc: "Points of Presence", url: "https://pfrda.org.in/list-of-pops" },
] as const;

// SEBI sub-types for granular sync — expected_count is reference only, actual comes from DB
const SEBI_TYPE_GROUPS = [
  {
    group: "Issuers",
    types: [
      { intmId: 16, label: "Alternative Investment Funds", regCategory: "Alternative Investment Fund", expected: 1830 },
      { intmId: 20, label: "Infrastructure Investment Trusts", regCategory: "Infrastructure Investment Trust", expected: 28 },
      { intmId: 23, label: "Mutual Funds", regCategory: "Mutual Fund", expected: 56 },
      { intmId: 33, label: "Portfolio Managers", regCategory: "Portfolio Manager", expected: 505 },
      { intmId: 21, label: "Venture Capital Funds", regCategory: "Venture Capital Fund", expected: 149 },
      { intmId: 48, label: "SM REITs", regCategory: "SM REIT", expected: 6 },
      { intmId: 42, label: "Real Estate Investment Trust", regCategory: "REIT", expected: 6 },
    ],
  },
  {
    group: "Intermediaries",
    types: [
      { intmId: 30, label: "Stock Brokers - Equity", regCategory: "Stock Broker - Equity", expected: 4946 },
      { intmId: 31, label: "Stock Brokers - Equity Derivative", regCategory: "Stock Broker - Equity Derivative", expected: 3737 },
      { intmId: 32, label: "Stock Brokers - Currency Derivative", regCategory: "Stock Broker - Currency Derivative", expected: 2730 },
      { intmId: 38, label: "Stock Brokers - Interest Rate Derivative", regCategory: "Stock Broker - Interest Rate Derivative", expected: 1521 },
      { intmId: 37, label: "Stock Brokers - Debt", regCategory: "Stock Broker - Debt", expected: 742 },
      { intmId: 2, label: "Stock Brokers - Commodity Derivative", regCategory: "Stock Broker - Commodity Derivative", expected: 2017 },
      { intmId: 5, label: "Banker to an Issue", regCategory: "Banker to Issue", expected: 60 },
      { intmId: 7, label: "Credit Rating Agency", regCategory: "Credit Rating Agency", expected: 8 },
      { intmId: 6, label: "Debentures Trustee", regCategory: "Debentures Trustee", expected: 26 },
      { intmId: 4, label: "Designated Depository Participants", regCategory: "Designated Depository Participant", expected: 17 },
      { intmId: 15, label: "Qualified Depository Participants", regCategory: "Qualified Depository Participant", expected: 62 },
      { intmId: 18, label: "Depository Participants - CDSL", regCategory: "Depository Participant - CDSL", expected: 736 },
      { intmId: 19, label: "Depository Participants - NSDL", regCategory: "Depository Participant - NSDL", expected: 343 },
      { intmId: 13, label: "Investment Adviser", regCategory: "Investment Adviser", expected: 995 },
      { intmId: 9, label: "Merchant Bankers", regCategory: "Merchant Banker", expected: 241 },
      { intmId: 14, label: "Research Analyst", regCategory: "Research Analyst", expected: 1844 },
    ],
  },
  {
    group: "Enablers",
    types: [
      { intmId: 27, label: "Custodians", regCategory: "Custodian", expected: 17 },
      { intmId: 8, label: "KYC Registration Agency", regCategory: "KYC Registration Agency", expected: 6 },
      { intmId: 10, label: "Registrars & Transfer Agents", regCategory: "Registrar & Transfer Agent", expected: 80 },
      { intmId: 35, label: "SCSB - Syndicate ASBA (equity)", regCategory: "SCSB - Syndicate ASBA Equity", expected: 54 },
      { intmId: 34, label: "SCSB - Direct ASBA (equity)", regCategory: "SCSB - Direct ASBA Equity", expected: 54 },
      { intmId: 47, label: "ESG Rating Providers", regCategory: "ESG Rating Provider", expected: 19 },
      { intmId: 40, label: "SCSB - Issuer Banks UPI", regCategory: "SCSB - Issuer Bank UPI", expected: 54 },
      { intmId: 41, label: "SCSB - Sponsor Banks UPI", regCategory: "SCSB - Sponsor Bank UPI", expected: 8 },
      { intmId: 43, label: "UPI Mobile Applications", regCategory: "UPI Mobile App", expected: 39 },
      { intmId: 44, label: "SCSB - Direct ASBA (debt)", regCategory: "SCSB - Direct ASBA Debt", expected: 38 },
      { intmId: 45, label: "SCSB - Syndicate ASBA (debt)", regCategory: "SCSB - Syndicate ASBA Debt", expected: 44 },
      { intmId: 46, label: "Vault Managers", regCategory: "Vault Manager", expected: 3 },
    ],
  },
  {
    group: "Investors / Participants",
    types: [
      { intmId: 29, label: "FPIs / Deemed FPIs", regCategory: "Foreign Portfolio Investor", expected: 11735 },
      { intmId: 25, label: "Foreign Venture Capital Investors", regCategory: "Foreign Venture Capital Investor", expected: 314 },
    ],
  },
];

export default function AdminRegistryPage() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [syncingSource, setSyncingSource] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const createInvite = useCreateInvitation();

  // Registry entities
  const { data: entities = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-registry", search, sourceFilter],
    queryFn: async () => {
      let query = supabase
        .from("registry_entities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (sourceFilter !== "all") query = query.eq("source", sourceFilter);
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

  // Sync logs
  const { data: syncLogs = [] } = useQuery({
    queryKey: ["admin-sync-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registry_sync_log")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    refetchInterval: syncingSource ? 5000 : false,
  });

  // Source stats — total per source
  const { data: sourceStats = {} } = useQuery({
    queryKey: ["admin-registry-stats"],
    queryFn: async () => {
      const stats: Record<string, number> = {};
      for (const s of SOURCES) {
        const { count } = await supabase
          .from("registry_entities")
          .select("*", { count: "exact", head: true })
          .eq("source", s.id);
        stats[s.id] = count || 0;
      }
      const { count: totalMatched } = await supabase
        .from("registry_entities")
        .select("*", { count: "exact", head: true })
        .not("matched_user_id", "is", null);
      stats.matched = totalMatched || 0;
      const { count: total } = await supabase
        .from("registry_entities")
        .select("*", { count: "exact", head: true });
      stats.total = total || 0;
      return stats;
    },
  });

  // Per-category counts from DB (for SEBI granular display)
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ["admin-registry-category-counts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registry_entities")
        .select("registration_category")
        .eq("source", "sebi");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data || []) {
        const cat = row.registration_category || "Unknown";
        counts[cat] = (counts[cat] || 0) + 1;
      }
      return counts;
    },
  });

  const triggerSync = async (sources: string[], sebiTypeIds?: number[]) => {
    const label = sebiTypeIds
      ? `SEBI (${sebiTypeIds.length} type${sebiTypeIds.length > 1 ? "s" : ""})`
      : sources.length === 1 ? sources[0].toUpperCase() : "All Sources";
    setSyncingSource(sources[0] || "all");
    toast.info(`Syncing ${label}... This may take a few minutes.`);

    try {
      const body: Record<string, unknown> = { sources, sync_type: "manual" };
      if (sebiTypeIds) body.sebi_type_ids = sebiTypeIds;

      const { data, error } = await supabase.functions.invoke("registry-sync", { body });

      if (error) throw error;
      if (data?.success) {
        const results = data.results || {};
        const summaries = Object.entries(results).map(([src, r]: [string, any]) =>
          `${src.toUpperCase()}: ${r.found} found, ${r.inserted} new, ${r.updated} updated`
        );
        toast.success(summaries.join(" | ") || "Sync complete");
        refetch();
        queryClient.invalidateQueries({ queryKey: ["admin-sync-logs"] });
        queryClient.invalidateQueries({ queryKey: ["admin-registry-stats"] });
        queryClient.invalidateQueries({ queryKey: ["admin-registry-category-counts"] });
      } else {
        toast.error(data?.error || "Sync failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to sync");
    } finally {
      setSyncingSource(null);
    }
  };

  const handleCreateInvite = (entity: any, role: string) => {
    if (!entity.contact_email) {
      toast.error("No email on this entity");
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

  const getLastSync = (source: string) => {
    return syncLogs.find((l: any) => l.source === source);
  };

  // Find last sync for a specific SEBI type by checking metadata.sebi_type_ids or metadata.sub_source
  const getLastSebiTypeSync = (intmId: number, regCategory: string) => {
    return syncLogs.find((l: any) => {
      if (l.source !== "sebi") return false;
      const meta = l.metadata as any;
      if (!meta) return false;
      // Check if this log was for this specific type
      if (meta.sebi_type_ids && Array.isArray(meta.sebi_type_ids)) {
        return meta.sebi_type_ids.includes(intmId);
      }
      if (meta.sub_source && typeof meta.sub_source === "string") {
        return meta.sub_source.includes(regCategory);
      }
      // Full SEBI sync — check details for this type's results
      if (meta.details) {
        try {
          const details = typeof meta.details === "string" ? JSON.parse(meta.details) : meta.details;
          return !!details[`${intmId}_${regCategory}`];
        } catch { return false; }
      }
      return false;
    });
  };

  // Extract per-type result from a sync log's metadata.details
  const getTypeResultFromLog = (log: any, intmId: number, regCategory: string) => {
    const meta = log?.metadata as any;
    if (!meta?.details) return null;
    try {
      const details = typeof meta.details === "string" ? JSON.parse(meta.details) : meta.details;
      return details[`${intmId}_${regCategory}`] || null;
    } catch { return null; }
  };

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-3.5 w-3.5 text-primary" />;
    if (status === "failed") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />;
    return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Sync Dashboard</TabsTrigger>
          <TabsTrigger value="entities">Registry Entities</TabsTrigger>
          <TabsTrigger value="logs">Sync Logs</TabsTrigger>
        </TabsList>

        {/* ─── Dashboard Tab ─── */}
        <TabsContent value="dashboard" className="space-y-4 mt-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => triggerSync(SOURCES.map(s => s.id))}
              disabled={!!syncingSource}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncingSource ? "animate-spin" : ""}`} />
              Sync All Sources
            </Button>
            <Button variant="outline" onClick={() => setWizardOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" /> Import from File
            </Button>
          </div>

          {/* Source cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOURCES.map((src) => {
              const lastSync = getLastSync(src.id);
              const count = (sourceStats as any)[src.id] || 0;
              const isSyncing = syncingSource === src.id;

              return (
                <Card key={src.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center ${src.color}`}>
                          <src.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{src.label}</CardTitle>
                          <CardDescription className="text-[10px]">{src.desc}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs font-mono">{count.toLocaleString()}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {lastSync ? (
                        <>
                          {statusIcon(lastSync.status)}
                          <span>
                            Last sync {formatDistanceToNow(new Date(lastSync.started_at), { addSuffix: true })}
                            {lastSync.status === "completed" && ` — ${lastSync.records_found} found, ${lastSync.records_inserted} new, ${lastSync.records_updated} updated`}
                            {lastSync.status === "failed" && ` — ${lastSync.error_message || "Error"}`}
                            {lastSync.status === "no_data" && " — No data returned"}
                          </span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3.5 w-3.5" />
                          <span>Never synced</span>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => triggerSync([src.id])}
                        disabled={!!syncingSource}
                        className="flex-1"
                      >
                        <RefreshCw className={`h-3 w-3 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={src.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* SEBI Granular Sync */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    SEBI Registry Types — Granular Sync
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    37 categories across 4 Findoo buckets. Now with session-based pagination for full data capture.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => triggerSync(["sebi"])}
                  disabled={!!syncingSource}
                >
                  <RefreshCw className={`h-3 w-3 mr-1.5 ${syncingSource === "sebi" ? "animate-spin" : ""}`} />
                  Sync All SEBI
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {SEBI_TYPE_GROUPS.map((group) => {
                const groupDbCount = group.types.reduce((s, t) => s + ((categoryCounts as any)[t.regCategory] || 0), 0);
                const groupExpected = group.types.reduce((s, t) => s + t.expected, 0);

                return (
                  <Collapsible key={group.group}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                        <span className="text-xs font-medium">{group.group}</span>
                        <Badge variant="secondary" className="text-[9px]">
                          {group.types.length} types
                        </Badge>
                        <span className="text-[9px] text-muted-foreground font-mono">
                          {groupDbCount.toLocaleString()} / {groupExpected.toLocaleString()} scraped
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 text-[10px] px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerSync(["sebi"], group.types.map(t => t.intmId));
                        }}
                        disabled={!!syncingSource}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Sync Group
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-1 space-y-1">
                        {group.types.map((type) => {
                          const dbCount = (categoryCounts as any)[type.regCategory] || 0;
                          const pct = type.expected > 0 ? Math.round((dbCount / type.expected) * 100) : 0;
                          const lastTypeSync = getLastSebiTypeSync(type.intmId, type.regCategory);
                          const typeResult = lastTypeSync ? getTypeResultFromLog(lastTypeSync, type.intmId, type.regCategory) : null;

                          return (
                            <div key={type.intmId} className="flex items-center justify-between py-1.5 px-2 text-xs rounded hover:bg-muted/30">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-muted-foreground font-mono w-6 text-right shrink-0">{type.intmId}</span>
                                <span className="truncate">{type.label}</span>
                                <Badge
                                  variant={pct >= 90 ? "default" : pct > 0 ? "secondary" : "outline"}
                                  className="text-[8px] font-mono shrink-0"
                                >
                                  {dbCount.toLocaleString()} / {type.expected.toLocaleString()}
                                  {pct > 0 && pct < 100 && ` (${pct}%)`}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Last sync status for this type */}
                                {lastTypeSync && (
                                  <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                    {statusIcon(lastTypeSync.status)}
                                    {typeResult
                                      ? `${typeResult.found} found`
                                      : formatDistanceToNow(new Date(lastTypeSync.started_at), { addSuffix: true })}
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 text-[9px] px-1.5"
                                  onClick={() => triggerSync(["sebi"], [type.intmId])}
                                  disabled={!!syncingSource}
                                >
                                  <RefreshCw className="h-2.5 w-2.5 mr-1" /> Sync
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{((sourceStats as any).total || 0).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Total Entities</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{((sourceStats as any).matched || 0).toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Claimed Profiles</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{syncLogs.filter((l: any) => l.status === "completed").length}</p>
                <p className="text-[10px] text-muted-foreground">Successful Syncs</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{syncLogs.filter((l: any) => l.status === "failed").length}</p>
                <p className="text-[10px] text-muted-foreground">Failed Syncs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ─── Entities Tab ─── */}
        <TabsContent value="entities" className="space-y-4 mt-4">
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
                {SOURCES.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
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
                      </TableCell>
                      <TableCell>
                        <p className="text-xs truncate max-w-[150px]">{entity.contact_email || "—"}</p>
                        {entity.contact_phone && <p className="text-[10px] text-muted-foreground">{entity.contact_phone}</p>}
                      </TableCell>
                      <TableCell>
                        {entity.last_synced_at ? (
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(entity.last_synced_at), { addSuffix: true })}
                          </p>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={entity.matched_user_id ? "default" : entity.status === "active" ? "secondary" : "outline"}
                          className="text-[9px]"
                        >
                          {entity.matched_user_id ? "Claimed" : entity.status}
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
        </TabsContent>

        {/* ─── Sync Logs Tab ─── */}
        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" /> Sync History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {syncLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sync runs yet</p>
              ) : (
                <div className="border rounded-md overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Source</TableHead>
                        <TableHead className="text-xs">Type / Scope</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Found</TableHead>
                        <TableHead className="text-xs">New</TableHead>
                        <TableHead className="text-xs">Updated</TableHead>
                        <TableHead className="text-xs">Started</TableHead>
                        <TableHead className="text-xs">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {syncLogs.map((log: any) => {
                        const meta = log.metadata as any;
                        const subSource = meta?.sub_source;

                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge variant="outline" className="text-[9px] uppercase">{log.source}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs capitalize">{log.sync_type}</span>
                              {subSource && (
                                <p className="text-[9px] text-muted-foreground truncate max-w-[150px]" title={subSource}>
                                  {subSource}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5">
                                {statusIcon(log.status)}
                                <span className="text-xs capitalize">{log.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs font-mono">{log.records_found}</TableCell>
                            <TableCell className="text-xs font-mono text-primary">{log.records_inserted}</TableCell>
                            <TableCell className="text-xs font-mono text-accent-foreground">{log.records_updated}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {format(new Date(log.started_at), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {log.completed_at
                                ? `${Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)}s`
                                : "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RegistryImportWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onImportComplete={() => {
          refetch();
          queryClient.invalidateQueries({ queryKey: ["admin-registry-stats"] });
          queryClient.invalidateQueries({ queryKey: ["admin-registry-category-counts"] });
        }}
      />
    </div>
  );
}
