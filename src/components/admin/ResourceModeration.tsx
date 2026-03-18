/**
 * ResourceModeration — Reusable admin moderation component filtered by resource_type.
 * Used in Jobs, Events, Listings, and Messages admin tabs.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import {
  Flag, CheckCircle2, XCircle, Eye, Search, Filter,
  AlertTriangle, ShieldAlert, AlertOctagon, Info, ChevronLeft, ChevronRight,
  BarChart3, Users, Archive
} from "lucide-react";
import { formatDistanceToNow, isToday, subDays } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-status-warning/10 text-status-warning border-status-warning/20",
  reviewed: "bg-accent/10 text-accent border-accent/20",
  dismissed: "bg-muted text-muted-foreground border-border",
  action_taken: "bg-destructive/10 text-destructive border-destructive/20",
};

const severityConfig: Record<string, { label: string; icon: typeof AlertTriangle; className: string; priority: number }> = {
  harassment: { label: "Critical", icon: AlertOctagon, className: "bg-destructive/10 text-destructive border-destructive/20", priority: 1 },
  threats: { label: "Critical", icon: AlertOctagon, className: "bg-destructive/10 text-destructive border-destructive/20", priority: 1 },
  misinformation: { label: "High", icon: ShieldAlert, className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", priority: 2 },
  inappropriate: { label: "Medium", icon: AlertTriangle, className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", priority: 3 },
  spam: { label: "Low", icon: Info, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", priority: 4 },
  other: { label: "Low", icon: Info, className: "bg-muted text-muted-foreground border-border", priority: 5 },
};

function getSeverity(reason: string) {
  const r = reason.toLowerCase();
  if (r.includes("harass") || r.includes("threat") || r.includes("intimidat")) return severityConfig.harassment;
  if (r.includes("misinfo") || r.includes("mislead") || r.includes("fraudul") || r.includes("fake")) return severityConfig.misinformation;
  if (r.includes("inapprop")) return severityConfig.inappropriate;
  if (r.includes("spam") || r.includes("scam")) return severityConfig.spam;
  return severityConfig.other;
}

const PAGE_SIZE = 15;

const RESOURCE_LABELS: Record<string, string> = {
  job: "Job",
  event: "Event",
  listing: "Listing",
  message: "Message",
};

interface ResourceModerationProps {
  resourceType: string;
}

interface ResourceReport {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  resource_type: string;
  resource_id: string | null;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter?: { full_name: string; avatar_url: string | null };
  reported_user?: { full_name: string; avatar_url: string | null; organization?: string | null };
  resource_title?: string;
}

export function ResourceModeration({ resourceType }: ResourceModerationProps) {
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [page, setPage] = useState(1);

  const label = RESOURCE_LABELS[resourceType] || resourceType;

  const { data: reports, isLoading } = useQuery({
    queryKey: ["admin-resource-reports", resourceType, showArchived],
    queryFn: async (): Promise<ResourceReport[]> => {
      let query = supabase
        .from("reports")
        .select("id, reporter_id, reported_user_id, resource_type, resource_id, reason, description, status, created_at")
        .eq("resource_type", resourceType)
        .order("created_at", { ascending: false });

      if (!showArchived) {
        const cutoff = subDays(new Date(), 90).toISOString();
        query = query.or(`status.eq.pending,created_at.gte.${cutoff}`);
      }
      query = query.limit(500);

      const { data, error } = await query;
      if (error) throw error;
      if (!data?.length) return [];

      // Fetch user profiles
      const userIds = [...new Set([
        ...data.map((r: any) => r.reporter_id),
        ...data.filter((r: any) => r.reported_user_id).map((r: any) => r.reported_user_id),
      ])];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, organization")
        .in("id", userIds);
      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));

      // Fetch resource titles for context
      const resourceIds = [...new Set(data.filter((r: any) => r.resource_id).map((r: any) => r.resource_id))];
      let resourceTitleMap: Record<string, string> = {};

      if (resourceIds.length > 0) {
        if (resourceType === "job") {
          const { data: jobs } = await supabase.from("jobs").select("id, title").in("id", resourceIds);
          resourceTitleMap = Object.fromEntries((jobs || []).map(j => [j.id, j.title]));
        } else if (resourceType === "event") {
          const { data: events } = await supabase.from("events").select("id, title").in("id", resourceIds);
          resourceTitleMap = Object.fromEntries((events || []).map(e => [e.id, e.title]));
        } else if (resourceType === "listing") {
          const { data: listings } = await supabase.from("listings").select("id, title").in("id", resourceIds);
          resourceTitleMap = Object.fromEntries((listings || []).map(l => [l.id, l.title]));
        } else if (resourceType === "message") {
          const { data: messages } = await supabase.from("messages").select("id, content").in("id", resourceIds);
          resourceTitleMap = Object.fromEntries((messages || []).map(m => [m.id, m.content.substring(0, 80)]));
        }
      }

      return data.map((r: any) => ({
        ...r,
        reporter: profileMap[r.reporter_id] || null,
        reported_user: r.reported_user_id ? profileMap[r.reported_user_id] || null : null,
        resource_title: r.resource_id ? resourceTitleMap[r.resource_id] || null : null,
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string; status: string }) => {
      const { error } = await supabase.from("reports").update({ status }).eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report updated");
      queryClient.invalidateQueries({ queryKey: ["admin-resource-reports", resourceType] });
    },
  });

  // Stats
  const stats = useMemo(() => {
    if (!reports) return { total: 0, pending: 0, resolvedToday: 0 };
    return {
      total: reports.length,
      pending: reports.filter(r => r.status === "pending").length,
      resolvedToday: reports.filter(r => r.status !== "pending" && isToday(new Date(r.created_at))).length,
    };
  }, [reports]);

  const filtered = useMemo(() => {
    if (!reports) return [];
    return reports.filter(r => {
      if (statusFilter !== "all" && (statusFilter === "pending" ? r.status !== "pending" : r.status === "pending")) return false;
      if (search) {
        const s = search.toLowerCase();
        return r.reason.toLowerCase().includes(s) ||
          r.description?.toLowerCase().includes(s) ||
          r.reporter?.full_name?.toLowerCase().includes(s) ||
          r.reported_user?.full_name?.toLowerCase().includes(s) ||
          r.resource_title?.toLowerCase().includes(s);
      }
      return true;
    }).sort((a, b) => {
      const sa = getSeverity(a.reason).priority;
      const sb = getSeverity(b.reason).priority;
      if (sa !== sb) return sa - sb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [reports, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <FindooLoader text={`Loading ${label.toLowerCase()} reports...`} />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Open Reports", value: stats.pending, icon: Flag, accent: "text-status-warning" },
          { label: "Resolved Today", value: stats.resolvedToday, icon: CheckCircle2, accent: "text-accent" },
          { label: `Total ${label} Reports`, value: stats.total, icon: BarChart3, accent: "text-primary" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className={`h-4 w-4 ${s.accent}`} />
                </div>
                <div>
                  <p className="text-lg font-bold font-heading">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={`Search ${label.toLowerCase()} reports...`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch id={`mod-archive-${resourceType}`} checked={showArchived} onCheckedChange={v => { setShowArchived(v); setPage(1); }} />
          <Label htmlFor={`mod-archive-${resourceType}`} className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
            <Archive className="h-3 w-3" /> Archived
          </Label>
        </div>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No {label.toLowerCase()} reports found</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {paginated.map(report => {
            const severity = getSeverity(report.reason);
            const SevIcon = severity.icon;

            return (
              <Card key={report.id} className={`overflow-hidden ${report.status !== "pending" ? "opacity-60" : ""} ${severity.priority <= 2 && report.status === "pending" ? "border-l-2 border-l-destructive" : ""}`}>
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 px-4 pt-3 pb-2 flex-wrap">
                    <div className={`h-6 w-6 rounded flex items-center justify-center shrink-0 ${severity.className}`}>
                      <SevIcon className="h-3.5 w-3.5" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${severity.className}`}>{severity.label}</Badge>
                    <span className="text-sm font-semibold text-foreground">{report.reason}</span>
                    <Badge variant="outline" className={`text-[10px] ml-auto ${statusColors[report.status]}`}>{report.status}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                  </div>

                  {/* Resource context */}
                  {report.resource_title && (
                    <div className="px-4 py-2 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[9px]">{label}</Badge>
                        <span className="text-sm font-medium text-foreground truncate">{report.resource_title}</span>
                      </div>
                    </div>
                  )}

                  {/* Reported user */}
                  {report.reported_user && (
                    <div className="flex items-center gap-2.5 px-4 py-2">
                      <AvatarWithFallback
                        src={report.reported_user.avatar_url || undefined}
                        initials={(report.reported_user.full_name || "U").slice(0, 2).toUpperCase()}
                        className="h-7 w-7 text-[10px]"
                      />
                      <div>
                        <span className="text-xs font-medium text-foreground">{report.reported_user.full_name}</span>
                        {report.reported_user.organization && (
                          <span className="text-[10px] text-muted-foreground ml-1.5">• {report.reported_user.organization}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Complaint */}
                  {report.description && (
                    <div className="px-4 py-1.5">
                      <div className="flex items-start gap-2 text-xs">
                        <Flag className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                        <span className="text-foreground">{report.description}</span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border bg-muted/20">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground flex-1 min-w-0">
                      <AvatarWithFallback
                        src={report.reporter?.avatar_url || undefined}
                        initials={(report.reporter?.full_name || "U").slice(0, 2).toUpperCase()}
                        className="h-5 w-5 text-[8px]"
                      />
                      <span>Reported by <span className="font-medium text-foreground">{report.reporter?.full_name || "Unknown"}</span></span>
                    </div>

                    {report.status === "pending" && (
                      <div className="flex gap-1.5 shrink-0">
                        <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() => updateStatus.mutate({ reportId: report.id, status: "dismissed" })} disabled={updateStatus.isPending}>
                          <XCircle className="h-3.5 w-3.5" /> Dismiss
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                          onClick={() => updateStatus.mutate({ reportId: report.id, status: "reviewed" })} disabled={updateStatus.isPending}>
                          <Eye className="h-3.5 w-3.5" /> Reviewed
                        </Button>
                        <Button size="sm" variant="destructive" className="h-7 gap-1 text-xs"
                          onClick={() => updateStatus.mutate({ reportId: report.id, status: "action_taken" })} disabled={updateStatus.isPending}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Action
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
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
