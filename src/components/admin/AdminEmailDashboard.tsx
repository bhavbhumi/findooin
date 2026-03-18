/**
 * AdminEmailDashboard — Email monitoring with stats, filters, log table,
 * suppression list management, and template overview.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, CheckCircle2, XCircle, Ban, Clock, RefreshCw, Shield, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type TimeRange = "24h" | "7d" | "30d";
type StatusFilter = "all" | "sent" | "dlq" | "suppressed" | "pending";

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "24h", label: "Last 24h" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

function getStartDate(range: TimeRange): string {
  const now = new Date();
  switch (range) {
    case "24h": now.setHours(now.getHours() - 24); break;
    case "7d": now.setDate(now.getDate() - 7); break;
    case "30d": now.setDate(now.getDate() - 30); break;
  }
  return now.toISOString();
}

const STATUS_BADGE: Record<string, { variant: "default" | "destructive" | "secondary" | "outline"; icon: React.ReactNode }> = {
  sent: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  failed: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  dlq: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
  suppressed: { variant: "outline", icon: <Ban className="h-3 w-3" /> },
};

export function AdminEmailDashboard() {
  const [tab, setTab] = useState("delivery");
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 50;
  const qc = useQueryClient();

  const startDate = useMemo(() => getStartDate(timeRange), [timeRange]);

  const { data: rawLogs, isLoading, refetch } = useQuery({
    queryKey: ["email-logs", timeRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_send_log")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data || [];
    },
  });

  const logs = useMemo(() => {
    if (!rawLogs) return [];
    const seen = new Map<string, typeof rawLogs[0]>();
    for (const row of rawLogs) {
      const key = row.message_id || row.id;
      if (!seen.has(key) || new Date(row.created_at) > new Date(seen.get(key)!.created_at)) {
        seen.set(key, row);
      }
    }
    return Array.from(seen.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [rawLogs]);

  const templateNames = useMemo(() => {
    const names = new Set(logs.map((l) => l.template_name));
    return Array.from(names).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (templateFilter !== "all" && l.template_name !== templateFilter) return false;
      return true;
    });
  }, [logs, statusFilter, templateFilter]);

  const stats = useMemo(() => {
    const s = { total: logs.length, sent: 0, failed: 0, suppressed: 0, pending: 0 };
    for (const l of logs) {
      if (l.status === "sent") s.sent++;
      else if (l.status === "dlq" || l.status === "failed") s.failed++;
      else if (l.status === "suppressed") s.suppressed++;
      else if (l.status === "pending") s.pending++;
    }
    return s;
  }, [logs]);

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  // Suppression list
  const { data: suppressions = [], isLoading: suppressionsLoading } = useQuery({
    queryKey: ["email-suppressions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_unsubscribe_tokens")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
    enabled: tab === "suppressions",
  });

  const statCards = [
    { label: "Total Emails", value: stats.total, icon: Mail, color: "text-primary" },
    { label: "Sent", value: stats.sent, icon: CheckCircle2, color: "text-status-success" },
    { label: "Failed", value: stats.failed, icon: XCircle, color: "text-destructive" },
    { label: "Suppressed", value: stats.suppressed, icon: Ban, color: "text-muted-foreground" },
  ];

  // Auth email templates overview
  const templates = [
    { name: "signup", label: "Signup Confirmation", description: "Email verification for new accounts" },
    { name: "recovery", label: "Password Reset", description: "Password recovery link" },
    { name: "magic-link", label: "Magic Link", description: "Passwordless sign-in" },
    { name: "invite", label: "Invite", description: "Platform invitation email" },
    { name: "email-change", label: "Email Change", description: "Email address change confirmation" },
    { name: "reauthentication", label: "Reauthentication", description: "OTP for sensitive actions" },
    { name: "welcome", label: "Welcome", description: "Post-signup welcome email" },
    { name: "contact-confirmation", label: "Contact Confirmation", description: "Contact form acknowledgment" },
    { name: "connection-accepted", label: "Connection Accepted", description: "Connection acceptance notification" },
    { name: "event-registration", label: "Event Registration", description: "Event registration confirmation" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-heading">Email Dashboard</h2>
          <p className="text-sm text-muted-foreground">Monitor delivery, manage templates, and view suppressions</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              {isLoading ? <Skeleton className="h-7 w-16" /> : <p className="text-2xl font-bold">{s.value}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="delivery">Delivery Log</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="suppressions">Suppressions</TabsTrigger>
        </TabsList>

        {/* Delivery Log Tab */}
        <TabsContent value="delivery" className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1">
              {TIME_RANGES.map((r) => (
                <Button key={r.value} variant={timeRange === r.value ? "default" : "outline"} size="sm"
                  onClick={() => { setTimeRange(r.value); setPage(0); }}>
                  {r.label}
                </Button>
              ))}
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as StatusFilter); setPage(0); }}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="dlq">Failed</SelectItem>
                <SelectItem value="suppressed">Suppressed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateFilter} onValueChange={(v) => { setTemplateFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Template" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Templates</SelectItem>
                {templateNames.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Template</TableHead>
                    <TableHead className="text-xs">Recipient</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Time</TableHead>
                    <TableHead className="text-xs">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>
                    ))
                  ) : paginated.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">No emails found</TableCell></TableRow>
                  ) : (
                    paginated.map((log) => {
                      const badge = STATUS_BADGE[log.status] || STATUS_BADGE.pending;
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs font-medium">{log.template_name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{log.recipient_email}</TableCell>
                          <TableCell><Badge variant={badge.variant} className="text-[10px] gap-1">{badge.icon}{log.status}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</TableCell>
                          <TableCell className="text-xs text-destructive max-w-[200px] truncate">{log.error_message || "—"}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Email Templates</CardTitle>
              <CardDescription className="text-xs">
                All templates are sent via <strong>go.notify.findoo.in</strong>. Auth templates are managed by the auth-email-hook edge function.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {templates.map((t) => (
                  <div key={t.name} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground">{t.description}</p>
                    </div>
                    <Badge variant="default" className="text-[9px] shrink-0 ml-auto">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suppressions Tab */}
        <TabsContent value="suppressions" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Suppression List</CardTitle>
              <CardDescription className="text-xs">
                Emails that have unsubscribed or been suppressed. Transactional emails are blocked to these addresses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppressionsLoading ? (
                <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : suppressions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No suppressed emails</p>
                  <p className="text-xs mt-1">Users who unsubscribe will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">Token</TableHead>
                      <TableHead className="text-xs">Unsubscribed</TableHead>
                      <TableHead className="text-xs">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppressions.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-medium">{s.email}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{s.token.slice(0, 12)}...</TableCell>
                        <TableCell>
                          {s.used_at ? (
                            <Badge variant="destructive" className="text-[10px]">Unsubscribed</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">Token issued</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(s.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
