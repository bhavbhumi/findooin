/**
 * CostReport — Dynamic Cost, Scaling & Revenue Projection Report
 * Fetches live platform metrics and projects costs/revenue at scale milestones.
 * Moderate-aggressive adoption model targeting 25K active members in 3 months.
 */
import { useState, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionPlans, formatPrice } from "@/hooks/useSubscriptionPlans";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw, TrendingUp, Users, Server, DollarSign, Target,
  BarChart3, Shield, Zap, Printer, Download,
} from "lucide-react";
import { format } from "date-fns";

// ── Infra Cost Model (₹/mo at scale) ──
const INFRA_COSTS = [
  { users: 100, label: "100", db: 0, auth: 0, storage: 0, edge: 0, cdn: 0, cache: 0, total: 0 },
  { users: 1000, label: "1K", db: 2000, auth: 0, storage: 500, edge: 0, cdn: 0, cache: 0, total: 2500 },
  { users: 5000, label: "5K", db: 4000, auth: 0, storage: 1500, edge: 500, cdn: 0, cache: 2000, total: 8000 },
  { users: 10000, label: "10K", db: 8000, auth: 2000, storage: 3000, edge: 1500, cdn: 1500, cache: 2000, total: 18000 },
  { users: 25000, label: "25K", db: 15000, auth: 3000, storage: 5000, edge: 3000, cdn: 2000, cache: 4000, total: 32000 },
  { users: 50000, label: "50K", db: 40000, auth: 8000, storage: 10000, edge: 8000, cdn: 5000, cache: 8000, total: 79000 },
  { users: 100000, label: "100K", db: 80000, auth: 15000, storage: 20000, edge: 15000, cdn: 10000, cache: 15000, total: 155000 },
  { users: 500000, label: "500K", db: 300000, auth: 40000, storage: 60000, edge: 50000, cdn: 30000, cache: 40000, total: 520000 },
  { users: 1000000, label: "1M", db: 500000, auth: 80000, storage: 100000, edge: 80000, cdn: 50000, cache: 60000, total: 870000 },
];

// ── Adoption Model ──
const ADOPTION = {
  target3mo: 25000,
  proConversionRate: 0.15,
  enterpriseConversionRate: 0.03,
  roleDistribution: { investor: 0.55, intermediary: 0.30, issuer: 0.15 },
  annualAdoptionRate: 0.35,
  churnRateMonthly: 0.04,
  trialConversion: 0.45,
};

const MONTHLY_MILESTONES = [
  { month: 1, users: 3000 },
  { month: 2, users: 10000 },
  { month: 3, users: 25000 },
  { month: 6, users: 60000 },
  { month: 9, users: 100000 },
  { month: 12, users: 180000 },
];

const BREAKPOINTS = [
  { scale: "3K", action: "Connection pooling (PgBouncer/Supavisor)", cost: "₹0 (config)", effort: "1 hour", severity: "low" },
  { scale: "5K", action: "Redis/Upstash cache for feed & profiles", cost: "+₹2K/mo", effort: "1–2 days", severity: "medium" },
  { scale: "10K", action: "Upgrade DB plan + read replica", cost: "+₹6K/mo", effort: "Config", severity: "low" },
  { scale: "10K", action: "CDN for static assets (Cloudflare)", cost: "+₹1.5K/mo", effort: "2 hours", severity: "low" },
  { scale: "25K", action: "Separate realtime from transactional DB", cost: "+₹5K/mo", effort: "1 week", severity: "high" },
  { scale: "50K", action: "Full-text search engine (Typesense)", cost: "+₹3K/mo", effort: "3–5 days", severity: "medium" },
  { scale: "100K", action: "Dedicated database + horizontal scaling", cost: "+₹40K+/mo", effort: "2–4 weeks", severity: "critical" },
  { scale: "500K+", action: "Multi-region deployment + edge caching", cost: "+₹1L+/mo", effort: "1–2 months", severity: "critical" },
];

const BURN_COMPOSITION = [
  { name: "Database", value: 35, color: "#2563eb" },
  { name: "Auth & Identity", value: 10, color: "#7c3aed" },
  { name: "Storage / CDN", value: 15, color: "#0891b2" },
  { name: "Edge Functions", value: 10, color: "#059669" },
  { name: "Caching (Redis)", value: 8, color: "#d97706" },
  { name: "Marketing", value: 22, color: "#dc2626" },
];

const INR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const CostReport = () => {
  usePageMeta({ title: "Cost & Scaling Report", description: "FindOO dynamic cost, scaling & revenue projection.", path: "/cost-report" });

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const { data: metrics, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["platform-metrics", lastRefresh.toISOString()],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_platform_metrics");
      if (error) throw error;
      return data as Record<string, any>;
    },
    staleTime: 0,
  });

  const { data: plans } = useSubscriptionPlans();

  const handleRefresh = useCallback(() => {
    setLastRefresh(new Date());
    refetch();
  }, [refetch]);

  // ── Revenue projections ──
  const computeRevenue = (totalUsers: number) => {
    const proUsers = Math.round(totalUsers * ADOPTION.proConversionRate);
    const entUsers = Math.round(totalUsers * ADOPTION.enterpriseConversionRate);
    const rd = ADOPTION.roleDistribution;

    // Get plan prices (paise → rupees)
    const getPlanPrice = (slug: string) => {
      const p = (plans || []).find((pl) => pl.slug === slug);
      return p ? p.price_amount / 100 : 0;
    };

    const proRevenue =
      Math.round(proUsers * rd.investor) * getPlanPrice("investor-pro-monthly") +
      Math.round(proUsers * rd.intermediary) * getPlanPrice("intermediary-pro-monthly") +
      Math.round(proUsers * rd.issuer) * getPlanPrice("issuer-pro-monthly");

    const entRevenue =
      Math.round(entUsers * rd.investor) * getPlanPrice("investor-enterprise-monthly") +
      Math.round(entUsers * rd.intermediary) * getPlanPrice("intermediary-enterprise-monthly") +
      Math.round(entUsers * rd.issuer) * getPlanPrice("issuer-enterprise-monthly");

    return { proUsers, entUsers, proRevenue, entRevenue, total: proRevenue + entRevenue };
  };

  const revenueProjections = MONTHLY_MILESTONES.map((m) => {
    const rev = computeRevenue(m.users);
    const infra = INFRA_COSTS.reduce((prev, cur) => (cur.users <= m.users ? cur : prev)).total;
    return {
      month: `M${m.month}`,
      users: m.users,
      revenue: Math.round(rev.total),
      infra,
      profit: Math.round(rev.total) - infra,
      proUsers: rev.proUsers,
      entUsers: rev.entUsers,
    };
  });

  const chartRevenue = revenueProjections.map((r) => ({
    ...r,
    revenueK: Math.round(r.revenue / 1000),
    infraK: Math.round(r.infra / 1000),
    profitK: Math.round(r.profit / 1000),
  }));

  const currentInfra = INFRA_COSTS.reduce(
    (prev, cur) => (cur.users <= (metrics?.total_users || 0) ? cur : prev),
    INFRA_COSTS[0]
  );

  const currentRev = computeRevenue(metrics?.total_users || 0);
  const targetRev = computeRevenue(ADOPTION.target3mo);

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 bg-background text-foreground print:bg-white print:text-gray-900 print:p-0">
      {/* Action Bar */}
      <div className="print:hidden mb-6 flex flex-wrap items-center gap-3">
        <Button onClick={handleRefresh} disabled={isFetching} size="sm" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> Print / PDF
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">
          Last refreshed: {format(lastRefresh, "dd MMM yyyy, hh:mm a")}
        </span>
      </div>

      {/* Header */}
      <div className="text-center mb-10 border-b-2 border-foreground/20 pb-6">
        <h1 className="text-3xl font-bold mb-2">FindOO – Cost, Scaling & Revenue Report</h1>
        <p className="text-muted-foreground text-sm">Dynamic Report · Generated: {format(new Date(), "MMMM yyyy")}</p>
        <p className="text-muted-foreground text-sm">Adoption Model: Moderate-Aggressive · Target: 25K active in 3 months</p>
      </div>

      {/* ── Live Platform Snapshot ── */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-border pb-1 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> 1. Live Platform Snapshot
        </h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading metrics…</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Users", value: metrics?.total_users, icon: Users },
              { label: "Investors", value: metrics?.investors, icon: BarChart3 },
              { label: "Intermediaries", value: metrics?.intermediaries, icon: Users },
              { label: "Issuers", value: metrics?.issuers, icon: Server },
              { label: "Posts", value: metrics?.total_posts, icon: TrendingUp },
              { label: "Connections", value: metrics?.total_connections, icon: Users },
              { label: "Events", value: metrics?.total_events, icon: Target },
              { label: "Active Subs", value: metrics?.active_subscriptions, icon: DollarSign },
            ].map((m) => (
              <Card key={m.label} className="border">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{(m.value ?? 0).toLocaleString("en-IN")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ── Pricing Strategy ── */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-border pb-1 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" /> 2. Subscription Pricing (Revised March 2026)
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Prices calibrated for moderate-aggressive adoption at 25K users. Annual plans offer ~17% savings.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2 text-left">Role</th>
                <th className="border border-border px-3 py-2 text-left">Free</th>
                <th className="border border-border px-3 py-2 text-left">Pro /mo</th>
                <th className="border border-border px-3 py-2 text-left">Pro /yr</th>
                <th className="border border-border px-3 py-2 text-left">Enterprise /mo</th>
                <th className="border border-border px-3 py-2 text-left">Enterprise /yr</th>
              </tr>
            </thead>
            <tbody>
              {["investor", "intermediary", "issuer"].map((role) => {
                const get = (tier: string, bi: string) =>
                  (plans || []).find((p) => p.target_role === role && p.tier === tier && p.billing_interval === bi);
                return (
                  <tr key={role} className="even:bg-muted/30">
                    <td className="border border-border px-3 py-2 font-medium capitalize">{role}</td>
                    <td className="border border-border px-3 py-2 text-green-600 font-semibold">Free</td>
                    <td className="border border-border px-3 py-2 font-semibold">{formatPrice(get("pro", "monthly")?.price_amount || 0)}</td>
                    <td className="border border-border px-3 py-2">{formatPrice(get("pro", "annual")?.price_amount || 0, "annual")}</td>
                    <td className="border border-border px-3 py-2 font-semibold">{formatPrice(get("enterprise", "monthly")?.price_amount || 0)}</td>
                    <td className="border border-border px-3 py-2">{formatPrice(get("enterprise", "annual")?.price_amount || 0, "annual")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-muted/30 p-3 rounded-lg border">
            <strong>Investor Pro (₹399/mo)</strong>: TrustCircle IQ, Portfolio watchlists, 5GB vault. Lower price drives mass adoption among retail segment.
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border">
            <strong>Intermediary Pro (₹799/mo)</strong>: Lead capture, content analytics, 10 listings, 10GB vault. Higher price justified by direct revenue-generating tools.
          </div>
          <div className="bg-muted/30 p-3 rounded-lg border">
            <strong>Issuer Pro (₹1,499/mo)</strong>: Events, 5 jobs/mo, IR portal, 20GB vault. Highest value for B2B entities with corporate needs.
          </div>
        </div>
      </section>

      {/* ── Revenue Projections ── */}
      <section className="mb-8 break-before-page">
        <h2 className="text-xl font-bold border-b border-border pb-1 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> 3. Revenue vs Infra Cost Projections
        </h2>
        <p className="text-sm text-muted-foreground mb-2">
          Assumptions: {(ADOPTION.proConversionRate * 100).toFixed(0)}% Pro conversion, {(ADOPTION.enterpriseConversionRate * 100).toFixed(0)}% Enterprise, {(ADOPTION.churnRateMonthly * 100).toFixed(0)}% monthly churn, {(ADOPTION.roleDistribution.investor * 100).toFixed(0)}/{(ADOPTION.roleDistribution.intermediary * 100).toFixed(0)}/{(ADOPTION.roleDistribution.issuer * 100).toFixed(0)} Investor/Intermediary/Issuer split.
        </p>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2">Month</th>
                <th className="border border-border px-3 py-2">Users</th>
                <th className="border border-border px-3 py-2">Pro</th>
                <th className="border border-border px-3 py-2">Enterprise</th>
                <th className="border border-border px-3 py-2">Revenue/mo</th>
                <th className="border border-border px-3 py-2">Infra/mo</th>
                <th className="border border-border px-3 py-2">Net Margin</th>
              </tr>
            </thead>
            <tbody>
              {revenueProjections.map((r) => (
                <tr key={r.month} className="even:bg-muted/30">
                  <td className="border border-border px-3 py-2 font-medium">{r.month}</td>
                  <td className="border border-border px-3 py-2">{r.users.toLocaleString("en-IN")}</td>
                  <td className="border border-border px-3 py-2">{r.proUsers.toLocaleString("en-IN")}</td>
                  <td className="border border-border px-3 py-2">{r.entUsers.toLocaleString("en-IN")}</td>
                  <td className="border border-border px-3 py-2 font-semibold text-green-600">{INR(r.revenue)}</td>
                  <td className="border border-border px-3 py-2">{INR(r.infra)}</td>
                  <td className={`border border-border px-3 py-2 font-bold ${r.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {INR(r.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print:hidden">
          <h3 className="font-semibold text-sm mb-3">Revenue vs Infrastructure Cost (₹ in Thousands)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis label={{ value: "₹K", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(v: number) => [`₹${v}K`, ""]} />
              <Legend />
              <Bar dataKey="revenueK" fill="#059669" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="infraK" fill="#dc2626" name="Infra Cost" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Infrastructure Costs ── */}
      <section className="mb-8 break-before-page">
        <h2 className="text-xl font-bold border-b border-border pb-1 mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" /> 4. Infrastructure Cost Breakdown
        </h2>
        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2 text-left">Scale</th>
                <th className="border border-border px-3 py-2">Database</th>
                <th className="border border-border px-3 py-2">Auth</th>
                <th className="border border-border px-3 py-2">Storage</th>
                <th className="border border-border px-3 py-2">Edge Fn</th>
                <th className="border border-border px-3 py-2">CDN</th>
                <th className="border border-border px-3 py-2">Cache</th>
                <th className="border border-border px-3 py-2 font-bold">Total/mo</th>
              </tr>
            </thead>
            <tbody>
              {INFRA_COSTS.filter((c) => c.users >= 1000).map((c) => (
                <tr key={c.label} className="even:bg-muted/30">
                  <td className="border border-border px-3 py-2 font-medium">{c.label}</td>
                  <td className="border border-border px-3 py-2">{INR(c.db)}</td>
                  <td className="border border-border px-3 py-2">{INR(c.auth)}</td>
                  <td className="border border-border px-3 py-2">{INR(c.storage)}</td>
                  <td className="border border-border px-3 py-2">{INR(c.edge)}</td>
                  <td className="border border-border px-3 py-2">{INR(c.cdn)}</td>
                  <td className="border border-border px-3 py-2">{INR(c.cache)}</td>
                  <td className="border border-border px-3 py-2 font-bold">{INR(c.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-sm mb-3">Total Monthly Burn by Scale</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={INFRA_COSTS.filter((c) => c.users >= 1000)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => [INR(v), ""]} />
                <Area type="monotone" dataKey="total" stroke="#dc2626" fill="#fecaca" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3">Cost Composition at 100K Users</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={BURN_COMPOSITION} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {BURN_COMPOSITION.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Scaling Breakpoints ── */}
      <section className="mb-8 break-before-page">
        <h2 className="text-xl font-bold border-b border-border pb-1 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" /> 5. Scaling Breakpoints & Upgrade Roadmap
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2 text-left">Scale</th>
                <th className="border border-border px-3 py-2 text-left">Action Required</th>
                <th className="border border-border px-3 py-2">Cost Impact</th>
                <th className="border border-border px-3 py-2">Effort</th>
                <th className="border border-border px-3 py-2">Priority</th>
              </tr>
            </thead>
            <tbody>
              {BREAKPOINTS.map((bp, i) => (
                <tr key={i} className="even:bg-muted/30">
                  <td className="border border-border px-3 py-2 font-medium">{bp.scale}</td>
                  <td className="border border-border px-3 py-2">{bp.action}</td>
                  <td className="border border-border px-3 py-2 text-center">{bp.cost}</td>
                  <td className="border border-border px-3 py-2 text-center">{bp.effort}</td>
                  <td className="border border-border px-3 py-2 text-center">
                    <Badge variant={bp.severity === "critical" ? "destructive" : bp.severity === "high" ? "default" : "secondary"} className="text-xs">
                      {bp.severity}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Unit Economics ── */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-border pb-1 mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" /> 6. Unit Economics & Growth Metrics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">At Current Scale ({metrics?.total_users || 0} users)</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>Infra cost: <strong>{INR(currentInfra.total)}/mo</strong></p>
              <p>Projected revenue: <strong>{INR(currentRev.total)}/mo</strong></p>
              <p>Cost per user: <strong>{INR(currentInfra.total / Math.max(metrics?.total_users || 1, 1))}/mo</strong></p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">At 25K Target (Month 3)</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>Infra cost: <strong>{INR(32000)}/mo</strong></p>
              <p>Projected revenue: <strong>{INR(targetRev.total)}/mo</strong></p>
              <p>Net margin: <strong className="text-green-600">{INR(targetRev.total - 32000)}/mo</strong></p>
              <p>Cost per user: <strong>{INR(32000 / 25000)}/mo</strong></p>
            </CardContent>
          </Card>
          <Card className="border">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Growth KPIs</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-1">
              <p>CAC target: <strong>₹150–400</strong></p>
              <p>LTV:CAC ratio: <strong>≥ 3:1</strong></p>
              <p>Payback period: <strong>3–6 months</strong></p>
              <p>Monthly churn: <strong>{(ADOPTION.churnRateMonthly * 100).toFixed(0)}%</strong></p>
              <p>Trial → Paid: <strong>{(ADOPTION.trialConversion * 100).toFixed(0)}%</strong></p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Marketing Budget ── */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-border pb-1 mb-4">7. Marketing Budget Framework</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-border text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border px-3 py-2 text-left">Phase</th>
                <th className="border border-border px-3 py-2">Target</th>
                <th className="border border-border px-3 py-2">Monthly Budget</th>
                <th className="border border-border px-3 py-2 text-left">Key Channels</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-border px-3 py-2 font-medium">🌱 Seed</td><td className="border border-border px-3 py-2">0 → 1K</td><td className="border border-border px-3 py-2">₹25K–50K</td><td className="border border-border px-3 py-2 text-xs">LinkedIn ads, WhatsApp groups, AMFI events, referral program</td></tr>
              <tr className="bg-muted/30"><td className="border border-border px-3 py-2 font-medium">🚀 Growth</td><td className="border border-border px-3 py-2">1K → 10K</td><td className="border border-border px-3 py-2">₹1–2L</td><td className="border border-border px-3 py-2 text-xs">Google Ads, content marketing, webinars, fin-influencers</td></tr>
              <tr><td className="border border-border px-3 py-2 font-medium">📈 Scale</td><td className="border border-border px-3 py-2">10K → 50K</td><td className="border border-border px-3 py-2">₹3–5L</td><td className="border border-border px-3 py-2 text-xs">Performance marketing, AMC partnerships, registry import</td></tr>
              <tr className="bg-muted/30"><td className="border border-border px-3 py-2 font-medium">👑 Dominance</td><td className="border border-border px-3 py-2">50K → 1L+</td><td className="border border-border px-3 py-2">₹8–15L</td><td className="border border-border px-3 py-2 text-xs">Brand campaigns, sponsorships, PR, app store</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Key Takeaway ── */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b border-border pb-1 mb-4">8. Key Takeaway</h2>
        <div className="bg-primary/5 border-l-4 border-primary p-4 text-sm leading-relaxed">
          <p className="mb-2"><strong>With the revised pricing and server upgrade, FindOO is financially sustainable from Month 1.</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>At 25K users (Month 3): revenue of <strong>{INR(targetRev.total)}/mo</strong> vs infra cost of <strong>₹32K/mo</strong></li>
            <li>Net margin of <strong>{INR(targetRev.total - 32000)}/mo</strong> — covers marketing + operations comfortably</li>
            <li>Investor Pro at ₹399/mo drives mass adoption; Issuer Enterprise at ₹4,999/mo captures B2B value</li>
            <li>Premium features (IR portals, campaign manager, portfolio watchlists) justify tier differentiation</li>
            <li>Break-even possible with as low as <strong>~5% conversion rate</strong></li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t-2 border-foreground/20 pt-4 mt-10 text-center text-xs text-muted-foreground">
        <p>FindOO – Confidential Cost & Scaling Report | {format(new Date(), "MMMM yyyy")}</p>
        <p>Dynamic report · Data refreshed on demand</p>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          button { display: none !important; }
          @page { margin: 1.5cm; }
        }
      `}</style>
    </div>
  );
};

export default CostReport;
