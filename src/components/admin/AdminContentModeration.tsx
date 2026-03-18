import { useState, useMemo } from "react";
import { useAdminReports, useUpdateReportStatus, useDeletePost } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { ROLE_CONFIG } from "@/lib/role-config";
import {
  Flag, CheckCircle2, XCircle, Trash2, FileText, User, Search, Filter,
  AlertTriangle, ShieldAlert, AlertOctagon, Info, ChevronLeft, ChevronRight,
  BarChart3, Clock, TrendingDown, Users, ShieldCheck, Building2
} from "lucide-react";
import { formatDistanceToNow, isToday, subDays } from "date-fns";
import { FindooLoader } from "@/components/FindooLoader";

const statusColors: Record<string, string> = {
  pending: "bg-status-warning/10 text-status-warning border-status-warning/20",
  reviewed: "bg-accent/10 text-accent border-accent/20",
  dismissed: "bg-muted text-muted-foreground border-border",
  action_taken: "bg-destructive/10 text-destructive border-destructive/20",
};

const severityConfig: Record<string, { label: string; icon: typeof AlertTriangle; className: string; priority: number }> = {
  harassment: { label: "Critical", icon: AlertOctagon, className: "bg-destructive/10 text-destructive border-destructive/20", priority: 1 },
  hate_speech: { label: "Critical", icon: AlertOctagon, className: "bg-destructive/10 text-destructive border-destructive/20", priority: 1 },
  threats: { label: "Critical", icon: AlertOctagon, className: "bg-destructive/10 text-destructive border-destructive/20", priority: 1 },
  misinformation: { label: "High", icon: ShieldAlert, className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", priority: 2 },
  inappropriate: { label: "Medium", icon: AlertTriangle, className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", priority: 3 },
  spam: { label: "Low", icon: Info, className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", priority: 4 },
  other: { label: "Low", icon: Info, className: "bg-muted text-muted-foreground border-border", priority: 5 },
};

function getSeverity(reason: string) {
  const r = reason.toLowerCase();
  if (r.includes("harass")) return severityConfig.harassment;
  if (r.includes("hate")) return severityConfig.hate_speech;
  if (r.includes("threat")) return severityConfig.threats;
  if (r.includes("misinfo") || r.includes("mislead")) return severityConfig.misinformation;
  if (r.includes("inapprop") || r.includes("nsfw")) return severityConfig.inappropriate;
  if (r.includes("spam")) return severityConfig.spam;
  return severityConfig.other;
}

const PAGE_SIZE = 15;

export function AdminContentModeration() {
  const { data: reports, isLoading } = useAdminReports();
  const updateStatus = useUpdateReportStatus();
  const deletePost = useDeletePost();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(1);

  // MIS Stats
  const stats = useMemo(() => {
    if (!reports) return { total: 0, pending: 0, resolvedToday: 0, repeatOffenders: 0 };
    const pending = reports.filter(r => r.status === "pending").length;
    const resolvedToday = reports.filter(r => r.status !== "pending" && isToday(new Date(r.created_at))).length;
    // Repeat offenders: users reported more than once
    const offenderCounts: Record<string, number> = {};
    reports.forEach(r => { if (r.reported_user_id) offenderCounts[r.reported_user_id] = (offenderCounts[r.reported_user_id] || 0) + 1; });
    const repeatOffenders = Object.values(offenderCounts).filter(c => c > 1).length;
    return { total: reports.length, pending, resolvedToday, repeatOffenders };
  }, [reports]);

  // Repeat offender map
  const offenderCounts = useMemo(() => {
    if (!reports) return {};
    const counts: Record<string, number> = {};
    reports.forEach(r => { if (r.reported_user_id) counts[r.reported_user_id] = (counts[r.reported_user_id] || 0) + 1; });
    return counts;
  }, [reports]);

  const filtered = useMemo(() => {
    if (!reports) return [];
    let list = reports.filter(r => {
      if (statusFilter !== "all" && (statusFilter === "pending" ? r.status !== "pending" : r.status === "pending")) return false;
      if (severityFilter !== "all") {
        const sev = getSeverity(r.reason);
        if (sev.label.toLowerCase() !== severityFilter) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return (
          r.reason.toLowerCase().includes(s) ||
          r.description?.toLowerCase().includes(s) ||
          r.reporter?.full_name?.toLowerCase().includes(s) ||
          r.reported_user?.full_name?.toLowerCase().includes(s)
        );
      }
      return true;
    });
    // Sort by severity priority (critical first) then by date
    list.sort((a, b) => {
      const sa = getSeverity(a.reason).priority;
      const sb = getSeverity(b.reason).priority;
      if (sa !== sb) return sa - sb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    return list;
  }, [reports, statusFilter, severityFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <FindooLoader text="Loading reports..." />;

  return (
    <div className="space-y-5">
      {/* MIS Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Open Reports", value: stats.pending, icon: Flag, accent: "text-status-warning" },
          { label: "Resolved Today", value: stats.resolvedToday, icon: CheckCircle2, accent: "text-accent" },
          { label: "Total Reports", value: stats.total, icon: BarChart3, accent: "text-primary" },
          { label: "Repeat Offenders", value: stats.repeatOffenders, icon: Users, accent: stats.repeatOffenders > 0 ? "text-destructive" : "text-muted-foreground" },
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
          <Input placeholder="Search by reason, reporter, user..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={v => { setSeverityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><AlertTriangle className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No reports match your filters</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {paginated.map(report => {
            const severity = getSeverity(report.reason);
            const SevIcon = severity.icon;
            const isRepeat = report.reported_user_id && (offenderCounts[report.reported_user_id] || 0) > 1;
            return (
              <Card key={report.id} className={report.status !== "pending" ? "opacity-70" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${severity.className}`}>
                      <SevIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] ${severity.className}`}>{severity.label}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${statusColors[report.status]}`}>{report.status}</Badge>
                        {isRepeat && (
                          <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                            ⚠ {offenderCounts[report.reported_user_id!]} reports
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{report.reason}</p>
                      {report.description && (
                        <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2 border border-border line-clamp-2">{report.description}</p>
                      )}
                      {/* Reporter & Reported User Cards */}
                      <div className="flex flex-wrap gap-3 text-xs">
                        {/* Reporter */}
                        <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-2.5 py-1.5 border border-border">
                          <AvatarWithFallback
                            src={report.reporter?.avatar_url || undefined}
                            initials={(report.reporter?.full_name || "U").slice(0, 2).toUpperCase()}
                            className="h-6 w-6 text-[9px]"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Reporter:</span>
                              <span className="font-medium text-foreground">{report.reporter?.full_name || "Unknown"}</span>
                            </div>
                            {report.reporter?.roles?.length > 0 && (
                              <div className="flex gap-1 mt-0.5">
                                {report.reporter.roles.map((role: string) => {
                                  const rc = ROLE_CONFIG[role];
                                  return rc ? (
                                    <span key={role} className={`text-[9px] px-1 py-0 rounded-full ${rc.bgColor}`}>{rc.label}</span>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Reported User */}
                        {report.reported_user && (
                          <div className="flex items-center gap-2 bg-destructive/5 rounded-lg px-2.5 py-1.5 border border-destructive/20">
                            <AvatarWithFallback
                              src={report.reported_user.avatar_url || undefined}
                              initials={(report.reported_user.full_name || "U").slice(0, 2).toUpperCase()}
                              className="h-6 w-6 text-[9px]"
                            />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Reported:</span>
                                <span className="font-medium text-foreground">{report.reported_user.full_name}</span>
                                {report.reported_user.verification_status === "verified" && (
                                  <ShieldCheck className="h-3 w-3 text-accent" />
                                )}
                                {report.reported_user.user_type === "entity" ? (
                                  <Building2 className="h-3 w-3 text-muted-foreground" />
                                ) : (
                                  <User className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-0.5">
                                {report.reported_user.organization && (
                                  <span className="text-[9px] text-muted-foreground">{report.reported_user.organization}</span>
                                )}
                                {report.reported_user.roles?.length > 0 && report.reported_user.roles.map((role: string) => {
                                  const rc = ROLE_CONFIG[role];
                                  return rc ? (
                                    <span key={role} className={`text-[9px] px-1 py-0 rounded-full ${rc.bgColor}`}>{rc.label}</span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {report.post_id && (
                          <span className="flex items-center gap-1 text-muted-foreground self-center">
                            <FileText className="h-3 w-3" /> Post reported
                          </span>
                        )}
                      </div>
                      {report.status === "pending" && (
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="outline" className="gap-1 text-xs"
                            onClick={() => updateStatus.mutate({ reportId: report.id, status: "dismissed" })} disabled={updateStatus.isPending}>
                            <XCircle className="h-3 w-3" /> Dismiss
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-xs"
                            onClick={() => updateStatus.mutate({ reportId: report.id, status: "reviewed" })} disabled={updateStatus.isPending}>
                            <CheckCircle2 className="h-3 w-3" /> Mark Reviewed
                          </Button>
                          {report.post_id && (
                            <Button size="sm" variant="destructive" className="gap-1 text-xs"
                              onClick={() => { deletePost.mutate(report.post_id!); updateStatus.mutate({ reportId: report.id, status: "action_taken" }); }}
                              disabled={deletePost.isPending}>
                              <Trash2 className="h-3 w-3" /> Remove Post
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
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