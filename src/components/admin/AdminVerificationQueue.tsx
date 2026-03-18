import { useState, useMemo } from "react";
import { useVerificationQueue, useReviewVerification } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CheckCircle2, XCircle, Clock, FileText, ExternalLink, ShieldCheck,
  Building2, User, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter,
  AlertTriangle, Timer, TrendingUp, BarChart3, ChevronLeft, ChevronRight, Archive
} from "lucide-react";
import { formatDistanceToNow, differenceInHours, subDays } from "date-fns";
import { FindooLoader } from "@/components/FindooLoader";
import { ROLE_CONFIG } from "@/lib/role-config";

const statusColors: Record<string, string> = {
  pending: "bg-status-warning/10 text-status-warning border-status-warning/20",
  approved: "bg-accent/10 text-accent border-accent/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function getSLABadge(createdAt: string) {
  const hours = differenceInHours(new Date(), new Date(createdAt));
  if (hours < 24) return { label: `${hours}h`, className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" };
  if (hours < 72) return { label: `${Math.floor(hours / 24)}d`, className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" };
  return { label: `${Math.floor(hours / 24)}d`, className: "bg-destructive/10 text-destructive border-destructive/20" };
}

const PAGE_SIZE = 15;

export function AdminVerificationQueue() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: requests, isLoading } = useVerificationQueue(showArchived);
  const review = useReviewVerification();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);

  // Filters & sort
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  // Bulk
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selected = requests?.find(r => r.id === selectedId);

  // MIS Stats
  const stats = useMemo(() => {
    if (!requests) return { total: 0, pending: 0, approved: 0, rejected: 0, approvalRate: 0, thisWeek: 0, avgWaitHours: 0 };
    const pending = requests.filter(r => r.status === "pending");
    const approved = requests.filter(r => r.status === "approved");
    const rejected = requests.filter(r => r.status === "rejected");
    const weekAgo = subDays(new Date(), 7);
    const thisWeek = requests.filter(r => new Date(r.created_at) >= weekAgo).length;
    const reviewed = approved.length + rejected.length;
    const approvalRate = reviewed > 0 ? Math.round((approved.length / reviewed) * 100) : 0;
    const avgWaitHours = pending.length > 0
      ? Math.round(pending.reduce((sum, r) => sum + differenceInHours(new Date(), new Date(r.created_at)), 0) / pending.length)
      : 0;
    return { total: requests.length, pending: pending.length, approved: approved.length, rejected: rejected.length, approvalRate, thisWeek, avgWaitHours };
  }, [requests]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    if (!requests) return [];
    let list = requests.filter(r => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        const name = (r.profile?.full_name || "").toLowerCase();
        const org = (r.profile?.organization || "").toLowerCase();
        if (!name.includes(s) && !org.includes(s) && !r.registration_number?.toLowerCase().includes(s)) return false;
      }
      return true;
    });
    list.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "date") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else cmp = (a.profile?.full_name || "").localeCompare(b.profile?.full_name || "");
      return sortDir === "desc" ? -cmp : cmp;
    });
    return list;
  }, [requests, statusFilter, search, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleReview = () => {
    if (!selected || !action) return;
    review.mutate({ requestId: selected.id, status: action, adminNotes, userId: selected.user_id }, {
      onSuccess: () => { setSelectedId(null); setAdminNotes(""); setAction(null); },
    });
  };

  const handleBulkAction = (bulkAction: "approved" | "rejected") => {
    selectedIds.forEach(id => {
      const req = requests?.find(r => r.id === id);
      if (req && req.status === "pending") {
        review.mutate({ requestId: id, status: bulkAction, adminNotes: `Bulk ${bulkAction}`, userId: req.user_id });
      }
    });
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pendingOnPage = paginated.filter(r => r.status === "pending");
    if (pendingOnPage.every(r => selectedIds.has(r.id))) {
      setSelectedIds(prev => { const next = new Set(prev); pendingOnPage.forEach(r => next.delete(r.id)); return next; });
    } else {
      setSelectedIds(prev => { const next = new Set(prev); pendingOnPage.forEach(r => next.add(r.id)); return next; });
    }
  };

  if (isLoading) return <FindooLoader text="Loading queue..." />;

  const SortIcon = sortDir === "desc" ? ArrowDown : ArrowUp;

  return (
    <div className="space-y-5">
      {/* MIS Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Pending", value: stats.pending, icon: Clock, accent: "text-status-warning" },
          { label: "Approval Rate", value: `${stats.approvalRate}%`, icon: TrendingUp, accent: "text-accent" },
          { label: "This Week", value: stats.thisWeek, icon: BarChart3, accent: "text-primary" },
          { label: "Avg Wait", value: `${stats.avgWaitHours}h`, icon: Timer, accent: stats.avgWaitHours > 72 ? "text-destructive" : "text-muted-foreground" },
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

      {/* Role Distribution Bar */}
      {requests && requests.length > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground font-medium">Status:</span>
              <span className="text-accent font-semibold">✓ {stats.approved} approved</span>
              <span className="text-destructive font-semibold">✗ {stats.rejected} rejected</span>
              <span className="text-status-warning font-semibold">⏳ {stats.pending} pending</span>
              <span className="ml-auto text-muted-foreground">Total: {stats.total}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, org, reg #..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setSortBy(prev => prev === "date" ? "name" : "date"); }}>
          <ArrowUpDown className="h-3.5 w-3.5" /> {sortBy === "date" ? "Date" : "Name"}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setSortDir(prev => prev === "asc" ? "desc" : "asc")}>
          <SortIcon className="h-3.5 w-3.5" />
        </Button>
        <div className="flex items-center gap-2">
          <Switch id="verif-archive" checked={showArchived} onCheckedChange={v => { setShowArchived(v); setPage(1); }} />
          <Label htmlFor="verif-archive" className="text-xs text-muted-foreground cursor-pointer flex items-center gap-1">
            <Archive className="h-3 w-3" /> Show archived
          </Label>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="py-3 flex items-center gap-3">
            <span className="text-sm font-medium">{selectedIds.size} selected</span>
            <Button size="sm" className="gap-1" onClick={() => handleBulkAction("approved")} disabled={review.isPending}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve All
            </Button>
            <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleBulkAction("rejected")} disabled={review.isPending}>
              <XCircle className="h-3.5 w-3.5" /> Reject All
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Clear</Button>
          </CardContent>
        </Card>
      )}

      {/* Select All for pending */}
      {statusFilter === "pending" && paginated.some(r => r.status === "pending") && (
        <div className="flex items-center gap-2 px-1">
          <Checkbox
            checked={paginated.filter(r => r.status === "pending").every(r => selectedIds.has(r.id))}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-xs text-muted-foreground">Select all on page</span>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No verification requests match your filters</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {paginated.map(req => {
            const sla = getSLABadge(req.created_at);
            return (
              <Card key={req.id} className={`hover:shadow-md transition-shadow ${req.status !== "pending" ? "opacity-70" : ""}`}>
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    {req.status === "pending" && (
                      <Checkbox
                        checked={selectedIds.has(req.id)}
                        onCheckedChange={() => toggleSelect(req.id)}
                        onClick={e => e.stopPropagation()}
                      />
                    )}
                    <div
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedId(req.id)}
                    >
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground shrink-0">
                        {req.profile?.full_name?.slice(0, 2).toUpperCase() || "??"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm truncate">{req.profile?.organization || req.profile?.full_name || "Unknown"}</span>
                          {req.roles?.map(r => {
                            const rc = ROLE_CONFIG[r.role];
                            return rc ? (
                              <span key={r.role} className={`text-[10px] px-1.5 py-0.5 rounded-full ${rc.bgColor}`}>{rc.label}</span>
                            ) : null;
                          })}
                          <Badge variant="outline" className={`text-[10px] ${statusColors[req.status]}`}>{req.status}</Badge>
                          {req.status === "pending" && (
                            <Badge variant="outline" className={`text-[10px] ${sla.className}`}>
                              <Timer className="h-2.5 w-2.5 mr-0.5" />{sla.label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {req.regulator && `${req.regulator} · `}
                          {req.registration_number && `Reg: ${req.registration_number} · `}
                          {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {req.status === "pending" && (
                        <>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-accent" title="Quick Approve"
                            onClick={e => { e.stopPropagation(); review.mutate({ requestId: req.id, status: "approved", adminNotes: "", userId: req.user_id }); }}>
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" title="Quick Reject"
                            onClick={e => { e.stopPropagation(); review.mutate({ requestId: req.id, status: "rejected", adminNotes: "", userId: req.user_id }); }}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <FileText className="h-4 w-4 text-muted-foreground" />
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

      {/* Review Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(o) => { if (!o) { setSelectedId(null); setAction(null); setAdminNotes(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
            <DialogDescription>Review the submitted documents and approve or reject this request.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                  {selected.profile?.full_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{selected.profile?.organization || selected.profile?.full_name}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {selected.profile?.user_type === "entity" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {selected.profile?.user_type}
                    </span>
                    {selected.roles?.map(r => <span key={r.role} className="capitalize">{r.role}{r.sub_type ? ` (${r.sub_type})` : ""}</span>)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Document</p>
                <a href={selected.document_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  {selected.document_name}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {selected.regulator && <p className="text-xs"><span className="text-muted-foreground">Regulator:</span> {selected.regulator}</p>}
                {selected.registration_number && <p className="text-xs"><span className="text-muted-foreground">Reg #:</span> {selected.registration_number}</p>}
                {selected.notes && <p className="text-xs"><span className="text-muted-foreground">Notes:</span> {selected.notes}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Admin Notes (optional)</label>
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add notes about your decision..." rows={3} />
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 gap-1.5" variant="default" onClick={() => setAction("approved")} disabled={review.isPending}>
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button className="flex-1 gap-1.5" variant="destructive" onClick={() => setAction("rejected")} disabled={review.isPending}>
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>

              {action && (
                <div className="rounded-lg border border-border p-3 bg-muted/50">
                  <p className="text-sm font-medium mb-2">
                    Confirm <span className={action === "approved" ? "text-accent" : "text-destructive"}>{action}</span>?
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleReview} disabled={review.isPending}>
                      {review.isPending ? "Processing..." : "Confirm"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAction(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}