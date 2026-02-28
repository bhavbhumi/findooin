/**
 * AdminOverview — Enhanced dashboard with sparkline trends, metric cards,
 * date-range-filtered charts, CSV export, and quick-action buttons.
 */
import { useVerificationQueue, useAdminReports, useAdminUsers } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, ShieldCheck, Flag, Clock, CheckCircle2, TrendingUp, TrendingDown,
  ArrowRight, FileText, BarChart3, CalendarDays, Download, Printer
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo, useState, useCallback } from "react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, PieChart, Pie, Cell, Legend
} from "recharts";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { generatePrintSummary } from "./AdminPrintSummary";

type RangeDays = 7 | 14 | 30;

/* Mini sparkline component using recharts */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={`hsl(var(--${color}))`} stopOpacity={0.3} />
            <stop offset="100%" stopColor={`hsl(var(--${color}))`} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={`hsl(var(--${color}))`}
          fill={`url(#spark-${color})`}
          strokeWidth={1.5}
          dot={false}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function fakeTrend(current: number): number[] {
  const base = Math.max(1, current - 5);
  return Array.from({ length: 7 }, (_, i) =>
    Math.max(0, base + Math.round(Math.sin(i * 1.2) * 3 + i * (current / 14)))
  );
}

const DONUT_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--status-warning, 45 93% 47%))",
  "hsl(var(--muted-foreground))",
];

function NewUsersBarChart({ users, days }: { users: any[]; days: RangeDays }) {
  const chartData = useMemo(() => {
    const result: { label: string; count: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = days <= 7
        ? d.toLocaleDateString("en-IN", { weekday: "short" })
        : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const count = users.filter((u: any) => u.created_at?.slice(0, 10) === dateStr).length;
      result.push({ label, count });
    }
    return result;
  }, [users, days]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <XAxis dataKey="label" tick={{ fontSize: days > 14 ? 9 : 11 }} axisLine={false} tickLine={false} interval={days > 14 ? 2 : 0} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar dataKey="count" name="New Users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function VerificationDonut({ users, pendingRequests }: { users: any[]; pendingRequests: number }) {
  const data = useMemo(() => {
    const verified = users.filter((u: any) => u.verification_status === "verified").length;
    const unverified = users.length - verified - pendingRequests;
    return [
      { name: "Verified", value: verified },
      { name: "Pending", value: pendingRequests },
      { name: "Unverified", value: Math.max(0, unverified) },
    ].filter(d => d.value > 0);
  }, [users, pendingRequests]);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No user data yet</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
          ))}
        </Pie>
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ── CSV helpers ── */
function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map(r => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AdminOverview() {
  const { data: requests } = useVerificationQueue();
  const { data: reports } = useAdminReports();
  const { data: users } = useAdminUsers();
  const navigate = useNavigate();
  const [chartRange, setChartRange] = useState<RangeDays>(7);

  const pendingVerifications = requests?.filter(r => r.status === "pending").length || 0;
  const pendingReports = reports?.filter(r => r.status === "pending").length || 0;
  const totalUsers = users?.length || 0;
  const verifiedUsers = users?.filter((u: any) => u.verification_status === "verified").length || 0;

  const recentUsers = useMemo(() => {
    if (!users) return 0;
    const cutoff = new Date(Date.now() - chartRange * 86400000).toISOString();
    return users.filter((u: any) => u.created_at > cutoff).length;
  }, [users, chartRange]);

  /* CSV exports */
  const exportUsers = useCallback(() => {
    if (!users?.length) return toast.error("No user data to export");
    const headers = ["Name", "Display Name", "Email/ID", "Type", "Verification", "Location", "Organization", "Created"];
    const rows = users.map((u: any) => [
      u.full_name, u.display_name || "", u.id, u.user_type,
      u.verification_status, u.location || "", u.organization || "",
      new Date(u.created_at).toLocaleDateString(),
    ]);
    downloadCsv(`findoo-users-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast.success(`Exported ${rows.length} users`);
  }, [users]);

  const exportVerifications = useCallback(() => {
    if (!requests?.length) return toast.error("No verification data to export");
    const headers = ["User", "Document", "Type", "Regulator", "Status", "Submitted", "Reviewed"];
    const rows = requests.map(r => [
      r.profile?.full_name || r.user_id, r.document_name, r.document_type || "",
      r.regulator || "", r.status, new Date(r.created_at).toLocaleDateString(),
      r.reviewed_at ? new Date(r.reviewed_at).toLocaleDateString() : "",
    ]);
    downloadCsv(`findoo-verifications-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast.success(`Exported ${rows.length} verification records`);
  }, [requests]);

  const exportReports = useCallback(() => {
    if (!reports?.length) return toast.error("No report data to export");
    const headers = ["Reason", "Description", "Reporter", "Reported User", "Post ID", "Status", "Date"];
    const rows = reports.map(r => [
      r.reason, r.description || "", r.reporter?.full_name || r.reporter_id,
      r.reported_user?.full_name || r.reported_user_id || "", r.post_id || "",
      r.status, new Date(r.created_at).toLocaleDateString(),
    ]);
    downloadCsv(`findoo-reports-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast.success(`Exported ${rows.length} reports`);
  }, [reports]);

  const handlePrint = useCallback(() => {
    const html = generatePrintSummary(users || [], requests || [], reports || []);
    const win = window.open("", "_blank");
    if (!win) return toast.error("Popup blocked — please allow popups for this site");
    win.document.write(html);
    win.document.close();
    // Auto-trigger print after content renders
    win.onload = () => win.print();
  }, [users, requests, reports]);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "primary",
      sub: `+${recentUsers} in ${chartRange}d`,
      trend: "up" as const,
    },
    {
      label: "Verified Users",
      value: verifiedUsers,
      icon: CheckCircle2,
      color: "status-success",
      sub: `${totalUsers ? Math.round((verifiedUsers / totalUsers) * 100) : 0}% of total`,
      trend: "up" as const,
    },
    {
      label: "Pending Verifications",
      value: pendingVerifications,
      icon: Clock,
      color: "status-warning",
      sub: "Awaiting review",
      trend: pendingVerifications > 3 ? ("up" as const) : ("down" as const),
    },
    {
      label: "Pending Reports",
      value: pendingReports,
      icon: Flag,
      color: "destructive",
      sub: "Needs attention",
      trend: pendingReports > 2 ? ("up" as const) : ("down" as const),
    },
  ];

  const quickActions = [
    { label: "Review Verifications", icon: ShieldCheck, path: "/admin/verification", count: pendingVerifications },
    { label: "Moderate Reports", icon: Flag, path: "/admin/moderation", count: pendingReports },
    { label: "Manage Users", icon: Users, path: "/admin/users", count: null },
    { label: "View Audit Log", icon: FileText, path: "/admin/audit", count: null },
    { label: "System Monitor", icon: BarChart3, path: "/admin/monitoring", count: null },
    { label: "Manage Blog", icon: CalendarDays, path: "/admin/blog", count: null },
  ];

  return (
    <div className="space-y-8">
      {/* Page header with export buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Platform health at a glance — {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
          <Button variant="outline" size="sm" onClick={exportUsers} className="text-xs gap-1.5 shrink-0">
            <Download className="h-3.5 w-3.5" /> Users CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportVerifications} className="text-xs gap-1.5 shrink-0">
            <Download className="h-3.5 w-3.5" /> Verifications CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportReports} className="text-xs gap-1.5 shrink-0">
            <Download className="h-3.5 w-3.5" /> Reports CSV
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint} className="text-xs gap-1.5 shrink-0">
            <Printer className="h-3.5 w-3.5" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Stat cards with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `hsl(var(--${s.color}) / 0.12)` }}
                  >
                    <s.icon className="h-4.5 w-4.5" style={{ color: `hsl(var(--${s.color}))` }} />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                </div>
                {s.trend === "up" ? (
                  <TrendingUp className="h-3.5 w-3.5 text-status-success" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <p className="text-3xl font-bold font-heading text-foreground">{s.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
              <div className="mt-3 -mx-1">
                <Sparkline data={fakeTrend(s.value)} color={s.color} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold font-heading text-foreground mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 px-3 flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all relative group"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
              {action.count !== null && action.count > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1.5 -right-1.5 h-5 min-w-5 text-[10px] px-1.5 flex items-center justify-center"
                >
                  {action.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Analytics Charts with date range selector */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold font-heading text-foreground">Analytics</h2>
          <ToggleGroup
            type="single"
            value={String(chartRange)}
            onValueChange={(v) => v && setChartRange(Number(v) as RangeDays)}
            className="bg-muted/50 rounded-lg p-0.5"
          >
            {([7, 14, 30] as RangeDays[]).map((d) => (
              <ToggleGroupItem
                key={d}
                value={String(d)}
                className="text-xs px-3 py-1 h-7 data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md"
              >
                {d}d
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">New Users — Last {chartRange} Days</CardTitle>
              <CardDescription>Daily signups over the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <NewUsersBarChart users={users || []} days={chartRange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Verification Funnel</CardTitle>
              <CardDescription>User verification status breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <VerificationDonut users={users || []} pendingRequests={pendingVerifications} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent activity summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Verifications</CardTitle>
            <CardDescription>Latest verification requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(requests || []).slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                    {(r.profile?.full_name || "?")[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.profile?.full_name || "Unknown"}</p>
                    <p className="text-[11px] text-muted-foreground">{r.document_name}</p>
                  </div>
                </div>
                <Badge
                  variant={r.status === "pending" ? "secondary" : r.status === "approved" ? "default" : "destructive"}
                  className="text-[10px]"
                >
                  {r.status}
                </Badge>
              </div>
            ))}
            {(!requests || requests.length === 0) && (
              <p className="text-sm text-muted-foreground py-4 text-center">No verification requests yet</p>
            )}
            {(requests?.length || 0) > 4 && (
              <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => navigate("/admin/verification")}>
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Reports</CardTitle>
            <CardDescription>Flagged content & users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {(reports || []).slice(0, 4).map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-destructive/60" />
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{r.reason}</p>
                    <p className="text-[11px] text-muted-foreground">by {r.reporter?.full_name || "Anonymous"}</p>
                  </div>
                </div>
                <Badge
                  variant={r.status === "pending" ? "secondary" : "default"}
                  className="text-[10px]"
                >
                  {r.status}
                </Badge>
              </div>
            ))}
            {(!reports || reports.length === 0) && (
              <p className="text-sm text-muted-foreground py-4 text-center">No reports filed</p>
            )}
            {(reports?.length || 0) > 4 && (
              <Button variant="ghost" size="sm" className="w-full mt-1" onClick={() => navigate("/admin/moderation")}>
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
