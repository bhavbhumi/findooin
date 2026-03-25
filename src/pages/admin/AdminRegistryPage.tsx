import { useMemo, useState } from "react";
import { AdminModuleWrapper } from "@/components/admin/AdminModuleWrapper";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import {
  Database, Search, RefreshCw, MoreHorizontal, Send, Mail, ExternalLink, FileUp,
  Clock, CheckCircle2, XCircle, Loader2, Shield, Landmark, Umbrella, PiggyBank,
  ChevronRight, Pause, Play, Trash2, AlertTriangle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

const SEBI_SYNC_MAX_PAGES = 8;
const SEBI_SYNC_MAX_CONTINUATIONS = 40;
const SEBI_TYPE_BY_ID = new Map(SEBI_TYPE_GROUPS.flatMap((group) => group.types.map((type) => [type.intmId, type])));
const getSebiTypeKey = (intmId: number, regCategory: string) => `${intmId}_${regCategory}`;

const parseSyncDetails = (detailsRaw: unknown): Record<string, any> | null => {
  if (!detailsRaw) return null;
  try {
    const parsed = typeof detailsRaw === "string" ? JSON.parse(detailsRaw) : detailsRaw;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, any>) : null;
  } catch {
    return null;
  }
};

const getSebiTypeLabel = (intmId: number, fallback?: string) => {
  return SEBI_TYPE_BY_ID.get(intmId)?.label || fallback || `intm${intmId}`;
};

const formatSebiScopeSummary = (detailsRaw: unknown, maxItems = 3): string | null => {
  const details = parseSyncDetails(detailsRaw);
  const typeResults = details?.types;
  if (!typeResults || typeof typeResults !== "object") return null;

  const parsed = Object.entries(typeResults as Record<string, any>)
    .map(([key, result]) => {
      const separatorIndex = key.indexOf("_");
      const intmId = Number(separatorIndex > -1 ? key.slice(0, separatorIndex) : key);
      const fallbackCategory = separatorIndex > -1 ? key.slice(separatorIndex + 1) : key;
      const found = Number(result?.found || 0);
      return {
        label: getSebiTypeLabel(intmId, fallbackCategory),
        found,
      };
    })
    .filter((entry) => entry.found > 0)
    .sort((a, b) => b.found - a.found);

  if (parsed.length === 0) return null;

  const shown = parsed.slice(0, maxItems).map((entry) => `${entry.label} (${entry.found})`);
  const remaining = parsed.length - shown.length;
  return remaining > 0 ? `${shown.join(", ")} +${remaining} more` : shown.join(", ");
};

const formatSebiTypeIdScope = (typeIdsRaw: unknown, maxItems = 6): string | null => {
  if (!Array.isArray(typeIdsRaw)) return null;
  const labels = typeIdsRaw
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id))
    .map((id) => getSebiTypeLabel(id));

  if (labels.length === 0) return null;
  const shown = labels.slice(0, maxItems);
  const remaining = labels.length - shown.length;
  return remaining > 0 ? `${shown.join(", ")} +${remaining} more` : shown.join(", ");
};

const extractSebiTypeResult = (detailsRaw: unknown, intmId: number, regCategory: string) => {
  const details = parseSyncDetails(detailsRaw);
  if (!details) return null;

  const directKey = `${intmId}_${regCategory}`;
  const collections: Record<string, any>[] = [];
  if (details.types && typeof details.types === "object") {
    collections.push(details.types as Record<string, any>);
  }
  collections.push(details);

  for (const collection of collections) {
    if (collection[directKey]) return collection[directKey];
    const fallbackKey = Object.keys(collection).find((k) => k.startsWith(`${intmId}_`));
    if (fallbackKey) return collection[fallbackKey];
  }

  return null;
};

const extractSebiPartialType = (detailsRaw: unknown, intmId: number) => {
  const details = parseSyncDetails(detailsRaw);
  const partialTypes = details?.partial_types;
  if (!Array.isArray(partialTypes)) return null;
  return partialTypes.find((p: any) => Number(p?.intmId) === intmId) || null;
};

export default function AdminRegistryPage() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [syncingSource, setSyncingSource] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "single" | "bulk" | "source" | "category"; ids?: string[]; source?: string; category?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Sync logs — auto-fix stale "running" entries for display
  const { data: syncLogs = [] } = useQuery({
    queryKey: ["admin-sync-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registry_sync_log")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(250);
      if (error) throw error;
      // Mark logs stuck as "running" for over 10 minutes as timed_out in UI display
      return (data || []).map((log: any) => {
        if (log.status === "running" && !log.completed_at) {
          const startedAt = new Date(log.started_at).getTime();
          const elapsed = Date.now() - startedAt;
          if (elapsed > 10 * 60 * 1000) {
            return { ...log, status: "failed", error_message: log.error_message || "Timed out" };
          }
        }
        return log;
      });
    },
    refetchInterval: syncingSource ? 5000 : false,
  });

  const stableSebiFoundByType = useMemo(() => {
    const foundByType: Record<string, number> = {};

    for (const log of syncLogs as any[]) {
      if (log.source !== "sebi") continue;
      const details = parseSyncDetails((log.metadata as any)?.details);
      const typeResults = details?.types;
      if (!typeResults || typeof typeResults !== "object") continue;

      for (const [typeKey, result] of Object.entries(typeResults as Record<string, any>)) {
        const found = Number(result?.found);
        if (!Number.isFinite(found) || found <= 0) continue;
        foundByType[typeKey] = Math.max(foundByType[typeKey] || 0, found);
      }
    }

    return foundByType;
  }, [syncLogs]);

  // Source stats
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

  // Per-category counts — use individual count queries to avoid 1000-row limit
  const { data: categoryCounts = {} } = useQuery({
    queryKey: ["admin-registry-category-counts"],
    queryFn: async () => {
      const allTypes = SEBI_TYPE_GROUPS.flatMap(g => g.types);
      const counts: Record<string, { total: number; primary: number }> = {};
      
      // Fetch counts in parallel batches
      const results = await Promise.all(
        allTypes.map(async (t) => {
          const [totalResult, primaryResult] = await Promise.all([
            supabase
              .from("registry_entities")
              .select("*", { count: "exact", head: true })
              .eq("source", "sebi")
              .eq("registration_category", t.regCategory),
            supabase
              .from("registry_entities")
              .select("*", { count: "exact", head: true })
              .eq("source", "sebi")
              .eq("registration_category", t.regCategory)
              .eq("is_primary_record", true),
          ]);

          return {
            category: t.regCategory,
            total: totalResult.error ? 0 : (totalResult.count || 0),
            primary: primaryResult.error ? 0 : (primaryResult.count || 0),
          };
        })
      );
      
      for (const r of results) {
        counts[r.category] = { total: r.total, primary: r.primary };
      }
      return counts;
    },
  });

  // ─── Pause/Resume Config ───
  const { data: pauseConfig = [] } = useQuery({
    queryKey: ["admin-registry-pause-config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("registry_sync_config").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const isSourcePaused = (source: string) =>
    pauseConfig.some((c: any) => c.source === source && !c.sebi_intm_id && c.is_paused);

  const isSebiTypePaused = (intmId: number) =>
    pauseConfig.some((c: any) => c.source === "sebi" && c.sebi_intm_id === intmId && c.is_paused);

  const togglePauseMutation = useMutation({
    mutationFn: async ({ source, sebiIntmId, pause }: { source: string; sebiIntmId?: number; pause: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upsert config row
      const matchFilter: Record<string, unknown> = { source };
      if (sebiIntmId) matchFilter.sebi_intm_id = sebiIntmId;

      const { data: existing } = await supabase
        .from("registry_sync_config")
        .select("id")
        .match(matchFilter)
        .maybeSingle();

      if (existing) {
        await supabase.from("registry_sync_config").update({
          is_paused: pause,
          paused_by: pause ? user.id : null,
          paused_at: pause ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }).eq("id", existing.id);
      } else {
        await supabase.from("registry_sync_config").insert({
          source,
          sebi_intm_id: sebiIntmId || null,
          is_paused: pause,
          paused_by: pause ? user.id : null,
          paused_at: pause ? new Date().toISOString() : null,
        });
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["admin-registry-pause-config"] });
      toast.success(vars.pause ? "Sync paused" : "Sync resumed");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update pause state"),
  });

  // ─── Delete ───
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      if (deleteConfirm.type === "single" || deleteConfirm.type === "bulk") {
        const ids = deleteConfirm.ids || [];
        // Delete in batches of 50
        for (let i = 0; i < ids.length; i += 50) {
          const batch = ids.slice(i, i + 50);
          const { error } = await supabase.from("registry_entities").delete().in("id", batch);
          if (error) throw error;
        }
        toast.success(`Deleted ${ids.length} record${ids.length > 1 ? "s" : ""}`);
      } else if (deleteConfirm.type === "source" && deleteConfirm.source) {
        const { error } = await supabase.from("registry_entities").delete().eq("source", deleteConfirm.source);
        if (error) throw error;
        toast.success(`Deleted all ${deleteConfirm.source.toUpperCase()} records`);
      } else if (deleteConfirm.type === "category" && deleteConfirm.category) {
        const { error } = await supabase.from("registry_entities").delete().eq("registration_category", deleteConfirm.category);
        if (error) throw error;
        toast.success(`Deleted all "${deleteConfirm.category}" records`);
      }
      setSelectedIds(new Set());
      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-registry-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-registry-category-counts"] });
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const triggerSync = async (sources: string[], sebiTypeIds?: number[], startPage?: number) => {
    const label = sebiTypeIds
      ? `SEBI (${sebiTypeIds.length} type${sebiTypeIds.length > 1 ? "s" : ""})`
      : sources.length === 1 ? sources[0].toUpperCase() : "All Sources";
    const resumeLabel = typeof startPage === "number" ? ` (resuming from page ${startPage + 1})` : "";
    setSyncingSource(sources[0] || "all");
    toast.info(`Syncing ${label}${resumeLabel}... This may take a few minutes.`);

    try {
      const isSingleSebiTypeSync =
        sources.length === 1 && sources[0] === "sebi" && !!sebiTypeIds && sebiTypeIds.length === 1;

      const invokeRegistrySync = async (overrides?: Record<string, unknown>) => {
        const body: Record<string, unknown> = {
          sources,
          sync_type: "manual",
          ...(sebiTypeIds ? { sebi_type_ids: sebiTypeIds } : {}),
          ...(sources.includes("sebi") ? { max_pages: SEBI_SYNC_MAX_PAGES } : {}),
          ...(typeof startPage === "number" ? { start_page: startPage } : {}),
          ...(overrides || {}),
        };

        const { data, error } = await supabase.functions.invoke("registry-sync", { body });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || "Sync failed");
        return data;
      };

      if (isSingleSebiTypeSync && sebiTypeIds) {
        const intmId = sebiTypeIds[0];
        const currentType = SEBI_TYPE_GROUPS.flatMap((g) => g.types).find((t) => t.intmId === intmId);
        const regCategory = currentType?.regCategory || "";

        let nextPage = typeof startPage === "number" ? startPage : 0;
        let continueSync = true;
        let loops = 0;
        let totalFound = 0;
        let totalInserted = 0;
        let totalUpdated = 0;

        while (continueSync && loops < SEBI_SYNC_MAX_CONTINUATIONS) {
          loops += 1;
          const data = await invokeRegistrySync({ start_page: nextPage });
          const sebiResult = data?.results?.sebi || {};

          totalFound += Number(sebiResult.found || 0);
          totalInserted += Number(sebiResult.inserted || 0);
          totalUpdated += Number(sebiResult.updated || 0);

          const typeResult = extractSebiTypeResult(sebiResult.details, intmId, regCategory);
          const partialType = extractSebiPartialType(sebiResult.details, intmId);
          const nextFromTypeResult = getNextPageFromTypeResult(typeResult);
          const nextFromPartialType = Number.isFinite(partialType?.nextPage) ? Number(partialType.nextPage) : null;
          const computedNextPage = nextFromTypeResult ?? nextFromPartialType;

          if (Number.isFinite(computedNextPage) && computedNextPage !== null) {
            nextPage = computedNextPage;
            toast.info(`Continuing ${currentType?.label || `SEBI type ${intmId}`} from page ${nextPage + 1}...`);
          } else {
            continueSync = false;
          }
        }

        if (continueSync) {
          toast.warning("Large sync reached safety limit. Click Continue once more to finish remaining pages.");
        }

        toast.success(`${currentType?.label || label}: ${totalFound} found, ${totalInserted} new, ${totalUpdated} updated`);
      } else {
        const data = await invokeRegistrySync();
        const results = data.results || {};
        const summaries = Object.entries(results).map(([src, r]: [string, any]) =>
          {
            const base = `${src.toUpperCase()}: ${r.found} found, ${r.inserted} new, ${r.updated} updated`;
            if (src !== "sebi") return base;
            const scope = formatSebiScopeSummary(r?.details, 6);
            return scope ? `${base} — ${scope}` : base;
          }
        );

        for (const [, r] of Object.entries(results) as [string, any][]) {
          const details = parseSyncDetails(r?.details);
          if (details?.partial_types?.length > 0) {
            const partialInfo = details.partial_types
              .map((p: any) => `${getSebiTypeLabel(Number(p.intmId))}: page ${p.nextPage}/${p.totalPages}`)
              .join(", ");
            toast.info(`Partial sync — more pages available: ${partialInfo}.`, { duration: 10000 });
          }
          if (details?.deferred_type_ids?.length > 0) {
            const deferredLabels = details.deferred_type_ids
              .map((id: number) => getSebiTypeLabel(Number(id)))
              .join(", ");
            toast.info(`Deferred SEBI types for next run: ${deferredLabels}`, { duration: 10000 });
          }
        }

        toast.success(summaries.join(" | ") || "Sync complete");
      }

      refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-sync-logs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-registry-stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin-registry-category-counts"] });
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

  const getLastSync = (source: string) => syncLogs.find((l: any) => l.source === source);

  const getLastSebiTypeSync = (intmId: number, regCategory: string) => {
    const targetKey = getSebiTypeKey(intmId, regCategory);
    return syncLogs.find((l: any) => {
      if (l.source !== "sebi") return false;
      const meta = l.metadata as any;
      if (!meta) return false;

      if (Array.isArray(meta.sebi_type_ids) && meta.sebi_type_ids.includes(intmId)) return true;

      const details = parseSyncDetails(meta.details);
      return !!details?.types?.[targetKey];
    });
  };

  const getTypeResultFromLog = (log: any, intmId: number, regCategory: string) => {
    const meta = log?.metadata as any;
    const details = parseSyncDetails(meta?.details);
    const targetKey = getSebiTypeKey(intmId, regCategory);
    if (details?.types?.[targetKey]) return details.types[targetKey];
    return extractSebiTypeResult(meta?.details, intmId, regCategory);
  };

  const getNextPageFromTypeResult = (typeResult: any): number | null => {
    if (!typeResult) return null;
    if (typeResult.partial && Number.isFinite(typeResult.lastPage)) {
      return Number(typeResult.lastPage) + 1;
    }
    if (Number.isFinite(typeResult.nextPage)) {
      return Number(typeResult.nextPage);
    }
    return null;
  };

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="h-3.5 w-3.5 text-primary" />;
    if (status === "failed") return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    if (status === "running") return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />;
    return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === entities.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(entities.map((e) => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <AdminModuleWrapper moduleKey="registry">
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
              const paused = isSourcePaused(src.id);

              return (
                <Card key={src.id} className={paused ? "opacity-60 border-dashed" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-lg bg-muted flex items-center justify-center ${src.color}`}>
                          <src.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm flex items-center gap-1.5">
                            {src.label}
                            {paused && <Badge variant="outline" className="text-[8px] text-destructive border-destructive/30">PAUSED</Badge>}
                          </CardTitle>
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
                        disabled={!!syncingSource || paused}
                        className="flex-1"
                      >
                        <RefreshCw className={`h-3 w-3 mr-1.5 ${isSyncing ? "animate-spin" : ""}`} />
                        {isSyncing ? "Syncing..." : "Sync Now"}
                      </Button>
                      <Button
                        size="sm"
                        variant={paused ? "default" : "outline"}
                        onClick={() => togglePauseMutation.mutate({ source: src.id, pause: !paused })}
                        disabled={togglePauseMutation.isPending}
                        title={paused ? "Resume sync" : "Pause sync"}
                      >
                        {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={src.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-2" /> View Source
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteConfirm({ type: "source", source: src.id })}
                          >
                            <Trash2 className="h-3 w-3 mr-2" /> Delete All {src.label} Records
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                    37 categories across 4 Findoo buckets. Pause individual types or delete by category.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => triggerSync(["sebi"])}
                  disabled={!!syncingSource || isSourcePaused("sebi")}
                >
                  <RefreshCw className={`h-3 w-3 mr-1.5 ${syncingSource === "sebi" ? "animate-spin" : ""}`} />
                  Sync All SEBI
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {SEBI_TYPE_GROUPS.map((group) => {
                const groupDbCount = group.types.reduce((s, t) => s + (((categoryCounts as any)[t.regCategory]?.total) || 0), 0);
                const groupFoundCount = group.types.reduce((sum, type) => {
                  const stableFound = Number(stableSebiFoundByType[getSebiTypeKey(type.intmId, type.regCategory)] || type.expected);
                  return sum + stableFound;
                }, 0);
                const allGroupPaused = group.types.every(t => isSebiTypePaused(t.intmId));
                const someGroupPaused = group.types.some(t => isSebiTypePaused(t.intmId));

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
                          {groupDbCount.toLocaleString()} / {groupFoundCount.toLocaleString()} in DB/found
                        </span>
                        {someGroupPaused && (
                          <Badge variant="outline" className="text-[8px] text-destructive border-destructive/30">
                            {allGroupPaused ? "ALL PAUSED" : "SOME PAUSED"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle pause for all types in group
                            const newPauseState = !allGroupPaused;
                            group.types.forEach(t => {
                              togglePauseMutation.mutate({ source: "sebi", sebiIntmId: t.intmId, pause: newPauseState });
                            });
                          }}
                          disabled={togglePauseMutation.isPending}
                          title={allGroupPaused ? "Resume all in group" : "Pause all in group"}
                        >
                          {allGroupPaused ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
                          {allGroupPaused ? "Resume" : "Pause"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-[10px] px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerSync(["sebi"], group.types.map(t => t.intmId));
                          }}
                          disabled={!!syncingSource || allGroupPaused}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" /> Sync
                        </Button>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 mt-1 space-y-1">
                        {group.types.map((type) => {
                          const counts = (categoryCounts as any)[type.regCategory] || { total: 0, primary: 0 };
                          const dbCount = Number(counts.total || 0);
                          const primaryCount = Number(counts.primary || 0);
                          const lastTypeSync = getLastSebiTypeSync(type.intmId, type.regCategory);
                          const typeResult = lastTypeSync ? getTypeResultFromLog(lastTypeSync, type.intmId, type.regCategory) : null;
                          const foundCount = Number(stableSebiFoundByType[getSebiTypeKey(type.intmId, type.regCategory)] || type.expected);
                          const pct = foundCount > 0 ? Math.round((dbCount / foundCount) * 100) : 0;
                          const nextPageFromLog = getNextPageFromTypeResult(typeResult);
                          const typePaused = isSebiTypePaused(type.intmId);

                          return (
                            <div
                              key={type.intmId}
                              className={`flex items-center justify-between py-1.5 px-2 text-xs rounded hover:bg-muted/30 ${typePaused ? "opacity-50" : ""}`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-muted-foreground font-mono w-6 text-right shrink-0">{type.intmId}</span>
                                <span className="truncate">{type.label}</span>
                                {typePaused && <Pause className="h-2.5 w-2.5 text-destructive shrink-0" />}
                                <Badge
                                  variant={pct >= 90 ? "default" : pct > 0 ? "secondary" : "outline"}
                                  className="text-[8px] font-mono shrink-0"
                                >
                                  {dbCount.toLocaleString()} / {foundCount.toLocaleString()}
                                  {pct > 0 && pct < 100 && ` (${pct}%)`}
                                </Badge>
                                {primaryCount !== dbCount && (
                                  <Badge variant="outline" className="text-[8px] font-mono shrink-0">
                                    {primaryCount.toLocaleString()} unique
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {lastTypeSync && (
                                  <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                                    {statusIcon(lastTypeSync.status)}
                                    {typeResult
                                      ? `last: ${typeResult.found} found${Number(typeResult.updated || 0) > 0 ? `, ${typeResult.updated} updated` : ""}`
                                      : formatDistanceToNow(new Date(lastTypeSync.started_at), { addSuffix: true })}
                                  </span>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 text-[9px] px-1.5"
                                  onClick={() => togglePauseMutation.mutate({ source: "sebi", sebiIntmId: type.intmId, pause: !typePaused })}
                                  disabled={togglePauseMutation.isPending}
                                  title={typePaused ? "Resume" : "Pause"}
                                >
                                  {typePaused ? <Play className="h-2.5 w-2.5" /> : <Pause className="h-2.5 w-2.5" />}
                                </Button>
                                {(nextPageFromLog !== null || (foundCount > 0 && dbCount > 0 && dbCount < foundCount && pct < 98)) && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 text-[9px] px-1.5 text-amber-600 hover:text-amber-700"
                                    onClick={() => {
                                      const fallbackPage = Math.floor(dbCount / 25);
                                      const startAtPage = nextPageFromLog ?? fallbackPage;
                                      triggerSync(["sebi"], [type.intmId], startAtPage);
                                    }}
                                    disabled={!!syncingSource || typePaused}
                                    title={`Continue sync from page ${((nextPageFromLog ?? Math.floor(dbCount / 25)) + 1).toLocaleString()}`}
                                  >
                                    <ChevronRight className="h-2.5 w-2.5 mr-0.5" /> Continue
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 text-[9px] px-1.5"
                                  onClick={() => triggerSync(["sebi"], [type.intmId])}
                                  disabled={!!syncingSource || typePaused}
                                >
                                  <RefreshCw className="h-2.5 w-2.5 mr-1" /> Sync
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 text-[9px] px-1.5 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteConfirm({ type: "category", category: type.regCategory })}
                                  title={`Delete all ${type.label} records`}
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
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
                <p className="text-2xl font-bold">{pauseConfig.filter((c: any) => c.is_paused).length}</p>
                <p className="text-[10px] text-muted-foreground">Paused Items</p>
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

          {/* Bulk actions bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-md border">
              <span className="text-xs font-medium">{selectedIds.size} selected</span>
              <Button
                size="sm"
                variant="destructive"
                className="h-7 text-xs"
                onClick={() => setDeleteConfirm({ type: "bulk", ids: Array.from(selectedIds) })}
              >
                <Trash2 className="h-3 w-3 mr-1.5" /> Delete Selected
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </div>
          )}

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
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === entities.length && entities.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
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
                    <TableRow key={entity.id} className={selectedIds.has(entity.id) ? "bg-muted/30" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(entity.id)}
                          onCheckedChange={() => toggleSelect(entity.id)}
                        />
                      </TableCell>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!entity.matched_user_id && (
                              <>
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
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteConfirm({ type: "single", ids: [entity.id] })}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete Record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                        const scopeFromIds = log.source === "sebi" ? formatSebiTypeIdScope(meta?.sebi_type_ids, 6) : null;
                        const parsedScope = log.source === "sebi" ? formatSebiScopeSummary(meta?.details, 4) : null;
                        const scopeLabel = scopeFromIds || subSource || parsedScope;

                        return (
                          <TableRow key={log.id}>
                            <TableCell>
                              <Badge variant="outline" className="text-[9px] uppercase">{log.source}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs capitalize">{log.sync_type}</span>
                              {scopeLabel && (
                                <p className="text-[9px] text-muted-foreground truncate max-w-[260px]" title={scopeLabel}>
                                  {scopeLabel}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === "single" && "This will permanently delete this registry record. This cannot be undone."}
              {deleteConfirm?.type === "bulk" && `This will permanently delete ${deleteConfirm.ids?.length || 0} selected registry records. This cannot be undone.`}
              {deleteConfirm?.type === "source" && `This will permanently delete ALL records from ${deleteConfirm.source?.toUpperCase()}. This cannot be undone.`}
              {deleteConfirm?.type === "category" && `This will permanently delete ALL records with category "${deleteConfirm.category}". This cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
