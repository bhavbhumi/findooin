import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Activity, Eye, FileText, Shield, User, Search, Download, Clock,
  ChevronLeft, ChevronRight, Filter, BarChart3, Users, Archive
} from "lucide-react";
import { useState, useMemo } from "react";
import { format, subDays, isToday } from "date-fns";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  profile?: { full_name: string; avatar_url: string | null; display_name: string | null };
}

const actionIcons: Record<string, typeof Activity> = {
  view_docs: Eye,
  admin_action: Shield,
  default: Activity,
};

const actionColors: Record<string, string> = {
  view_docs: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  admin_action: "bg-destructive/10 text-destructive",
  login: "bg-green-500/10 text-green-600 dark:text-green-400",
};

const PAGE_SIZE = 25;

export function AdminAuditLog() {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [filterResource, setFilterResource] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [page, setPage] = useState(1);

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async (): Promise<AuditLog[]> => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;

      const userIds = [...new Set((data || []).map((l: any) => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, display_name")
        .in("id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      return (data || []).map((l: any) => ({ ...l, profile: profileMap[l.user_id] || null }));
    },
    staleTime: 15_000,
  });

  const actionTypes = useMemo(() => logs ? [...new Set(logs.map(l => l.action))] : [], [logs]);
  const resourceTypes = useMemo(() => logs ? [...new Set(logs.map(l => l.resource_type))] : [], [logs]);

  // MIS Stats
  const stats = useMemo(() => {
    if (!logs) return { total: 0, today: 0, uniqueAdmins: 0, topAction: "-", peakHour: "-" };
    const today = logs.filter(l => isToday(new Date(l.created_at)));
    const uniqueAdmins = new Set(logs.map(l => l.user_id)).size;
    // Top action
    const actionCounts: Record<string, number> = {};
    logs.forEach(l => { actionCounts[l.action] = (actionCounts[l.action] || 0) + 1; });
    const topAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace(/_/g, " ") || "-";
    // Peak hour
    const hourCounts: Record<number, number> = {};
    today.forEach(l => { const h = new Date(l.created_at).getHours(); hourCounts[h] = (hourCounts[h] || 0) + 1; });
    const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      total: logs.length,
      today: today.length,
      uniqueAdmins,
      topAction,
      peakHour: peakHour ? `${peakHour[0].padStart(2, "0")}:00` : "-",
    };
  }, [logs]);

  const filtered = useMemo(() => {
    if (!logs) return [];
    return logs.filter(l => {
      if (filterAction !== "all" && l.action !== filterAction) return false;
      if (filterResource !== "all" && l.resource_type !== filterResource) return false;
      if (filterDate !== "all") {
        const d = new Date(l.created_at);
        const now = new Date();
        if (filterDate === "today" && !isToday(d)) return false;
        if (filterDate === "7d" && d < subDays(now, 7)) return false;
        if (filterDate === "30d" && d < subDays(now, 30)) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return (
          l.profile?.full_name?.toLowerCase().includes(s) ||
          l.action.toLowerCase().includes(s) ||
          l.resource_type.toLowerCase().includes(s) ||
          JSON.stringify(l.metadata).toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [logs, filterAction, filterResource, filterDate, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    const headers = ["Date", "User", "Action", "Resource Type", "Resource ID", "Metadata"];
    const rows = filtered.map(l => [
      format(new Date(l.created_at), "yyyy-MM-dd HH:mm:ss"),
      l.profile?.full_name || l.user_id,
      l.action,
      l.resource_type,
      l.resource_id || "",
      JSON.stringify(l.metadata),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* MIS Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Events", value: stats.total, icon: Activity, accent: "text-primary" },
          { label: "Today", value: stats.today, icon: Clock, accent: "text-accent" },
          { label: "Active Admins", value: stats.uniqueAdmins, icon: Users, accent: "text-primary" },
          { label: "Top Action", value: stats.topAction, icon: BarChart3, accent: "text-muted-foreground", small: true },
          { label: "Peak Hour", value: stats.peakHour, icon: Activity, accent: "text-status-warning" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className={`h-4 w-4 ${s.accent}`} />
                </div>
                <div className="min-w-0">
                  <p className={`font-bold font-heading truncate ${(s as any).small ? "text-sm" : "text-lg"}`}>{s.value}</p>
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
          <Input placeholder="Search logs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={filterAction} onValueChange={v => { setFilterAction(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionTypes.map(a => <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterResource} onValueChange={v => { setFilterResource(v); setPage(1); }}>
          <SelectTrigger className="w-[150px]"><SelectValue placeholder="Resource" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            {resourceTypes.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDate} onValueChange={v => { setFilterDate(v); setPage(1); }}>
          <SelectTrigger className="w-[120px]"><Clock className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCSV} disabled={filtered.length === 0}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {/* Log entries */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Activity Log ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading audit logs...</div>
          ) : paginated.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">No audit logs found</div>
          ) : (
            <div className="divide-y divide-border">
              {paginated.map(log => {
                const Icon = actionIcons[log.action] || actionIcons.default;
                const colorClass = actionColors[log.action] || "bg-muted text-muted-foreground";
                return (
                  <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AvatarWithFallback
                          src={log.profile?.avatar_url || undefined}
                          initials={(log.profile?.full_name || "U").slice(0, 2).toUpperCase()}
                          className="h-5 w-5 text-[8px]"
                        />
                        <span className="text-sm font-medium text-foreground truncate">
                          {log.profile?.display_name || log.profile?.full_name || "Unknown"}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {log.resource_type}
                        </Badge>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                          {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                      {format(new Date(log.created_at), "MMM d, HH:mm")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
              return (
                <Button key={p} variant={p === page ? "default" : "outline"} size="sm" className="h-8 w-8 p-0" onClick={() => setPage(p)}>
                  {p}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}