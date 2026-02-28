/**
 * AdminOverview — Enhanced dashboard with sparkline trends, metric cards,
 * and quick-action buttons for common admin tasks.
 */
import { useVerificationQueue, useAdminReports, useAdminUsers } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users, ShieldCheck, Flag, Clock, CheckCircle2, TrendingUp, TrendingDown,
  ArrowRight, UserPlus, FileText, Eye, BarChart3, Briefcase, CalendarDays
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

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

/* Fake 7-day trend data generator seeded by current value */
function fakeTrend(current: number): number[] {
  const base = Math.max(1, current - 5);
  return Array.from({ length: 7 }, (_, i) =>
    Math.max(0, base + Math.round(Math.sin(i * 1.2) * 3 + i * (current / 14)))
  );
}

export function AdminOverview() {
  const { data: requests } = useVerificationQueue();
  const { data: reports } = useAdminReports();
  const { data: users } = useAdminUsers();
  const navigate = useNavigate();

  const pendingVerifications = requests?.filter(r => r.status === "pending").length || 0;
  const pendingReports = reports?.filter(r => r.status === "pending").length || 0;
  const totalUsers = users?.length || 0;
  const verifiedUsers = users?.filter((u: any) => u.verification_status === "verified").length || 0;

  const recentUsers = useMemo(() => {
    if (!users) return 0;
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    return users.filter((u: any) => u.created_at > weekAgo).length;
  }, [users]);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "primary",
      sub: `+${recentUsers} this week`,
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
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold font-heading text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform health at a glance — {new Date().toLocaleDateString("en-IN", { weekday: "long", month: "long", day: "numeric" })}
        </p>
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
