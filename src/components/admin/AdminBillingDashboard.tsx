/**
 * AdminBillingDashboard — Full billing management for admin panel.
 * MRR/ARR metrics, subscriber breakdown, plan management, payment logs.
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  IndianRupee, Users, TrendingUp, CreditCard, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Search, RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  trialing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  past_due: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  expired: "bg-muted text-muted-foreground",
  paused: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  captured: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  created: "bg-muted text-muted-foreground",
  authorized: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

export default function AdminBillingDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch all subscriptions with plans
  const { data: subscriptions, isLoading: subsLoading, refetch: refetchSubs } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_plans(name, tier, target_role, price_amount, billing_interval)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch all plans
  const { data: plans, isLoading: plansLoading, refetch: refetchPlans } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch payment history
  const { data: payments, isLoading: paymentsLoading, refetch: refetchPayments } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch subscription events
  const { data: events } = useQuery({
    queryKey: ["admin-sub-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_events")
        .select("*, subscription_plans!subscription_events_to_plan_id_fkey(name, tier)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  // Compute MRR metrics
  const activeSubscriptions = subscriptions?.filter(
    (s) => s.status === "active" || s.status === "trialing"
  ) || [];

  const mrr = activeSubscriptions.reduce((sum, s) => {
    const plan = s.subscription_plans as any;
    if (!plan) return sum;
    const amount = plan.price_amount || 0;
    return sum + (plan.billing_interval === "annual" ? Math.round(amount / 12) : amount);
  }, 0);

  const arr = mrr * 12;

  const trialingCount = subscriptions?.filter((s) => s.status === "trialing").length || 0;
  const activeCount = subscriptions?.filter((s) => s.status === "active").length || 0;
  const pastDueCount = subscriptions?.filter((s) => s.status === "past_due").length || 0;
  const cancelledCount = subscriptions?.filter((s) => s.status === "cancelled").length || 0;

  const totalRevenue = payments
    ?.filter((p) => p.status === "captured")
    .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

  const failedPayments = payments?.filter((p) => p.status === "failed").length || 0;

  // Filter subscriptions
  const filteredSubs = subscriptions?.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  }) || [];

  // Filter payments
  const filteredPayments = payments?.filter((p) => {
    if (!paymentSearch) return true;
    const search = paymentSearch.toLowerCase();
    return (
      p.razorpay_payment_id?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search) ||
      p.status?.toLowerCase().includes(search)
    );
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing & Subscriptions</h2>
          <p className="text-muted-foreground text-sm">
            Revenue metrics, subscriber management, and payment logs.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => { refetchSubs(); refetchPlans(); refetchPayments(); }}
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <IndianRupee className="h-3.5 w-3.5" /> MRR
            </div>
            <p className="text-2xl font-bold">{formatINR(mrr)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ARR: {formatINR(arr)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <Users className="h-3.5 w-3.5" /> Active Subscribers
            </div>
            <p className="text-2xl font-bold">{activeCount + trialingCount}</p>
            <div className="flex gap-2 mt-0.5">
              <span className="text-xs text-blue-600 dark:text-blue-400">{trialingCount} trial</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">{activeCount} paid</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <TrendingUp className="h-3.5 w-3.5" /> Total Revenue
            </div>
            <p className="text-2xl font-bold">{formatINR(totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              From {payments?.filter(p => p.status === "captured").length || 0} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-1">
              <AlertTriangle className="h-3.5 w-3.5" /> Attention
            </div>
            <p className="text-2xl font-bold">{pastDueCount + failedPayments}</p>
            <div className="flex gap-2 mt-0.5">
              <span className="text-xs text-amber-600">{pastDueCount} past due</span>
              <span className="text-xs text-red-600">{failedPayments} failed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Subscribers</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* SUBSCRIBERS TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trialing</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline">{filteredSubs.length} subscriptions</Badge>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Interval</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                ) : filteredSubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubs.map((sub) => {
                    const plan = sub.subscription_plans as any;
                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-mono text-xs max-w-[120px] truncate">
                          {sub.user_id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium text-sm">
                          {plan?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">
                            {plan?.tier || "free"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm capitalize">
                          {sub.billing_interval}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[sub.status] || ""}`}>
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(sub.created_at), "dd MMM yyyy")}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* PLANS TAB */}
        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Plans</CardTitle>
              <CardDescription>All configured plans across roles and tiers.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Interval</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Trial</TableHead>
                    <TableHead>Razorpay ID</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plansLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Loading plans...
                      </TableCell>
                    </TableRow>
                  ) : (
                    plans?.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium text-sm">{plan.name}</TableCell>
                        <TableCell className="capitalize text-sm">{plan.target_role}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize text-xs">{plan.tier}</Badge>
                        </TableCell>
                        <TableCell className="text-sm capitalize">{plan.billing_interval}</TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {plan.price_amount === 0 ? "Free" : formatINR(plan.price_amount)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {plan.trial_days > 0 ? `${plan.trial_days}d` : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-mono max-w-[100px] truncate">
                          {plan.razorpay_plan_id || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={plan.status === "active" ? "default" : "secondary"} className="text-xs capitalize">
                            {plan.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by payment ID or description..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Badge variant="outline">{filteredPayments.length} payments</Badge>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Razorpay ID</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(p.created_at), "dd MMM yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[140px] truncate">
                        {p.razorpay_payment_id || "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">
                        {formatINR(p.amount)}
                      </TableCell>
                      <TableCell className="text-sm capitalize">
                        {p.payment_method || "—"}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PAYMENT_STATUS_COLORS[p.status] || ""}`}>
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {p.description || "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ACTIVITY LOG TAB */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Activity</CardTitle>
              <CardDescription>Upgrades, downgrades, cancellations, and payment events.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No subscription events yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    events?.map((evt) => {
                      const plan = (evt as any).subscription_plans;
                      return (
                        <TableRow key={evt.id}>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {format(new Date(evt.created_at), "dd MMM yyyy HH:mm")}
                          </TableCell>
                          <TableCell className="font-mono text-xs max-w-[100px] truncate">
                            {evt.user_id?.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize text-xs">
                              {evt.event_type?.replace(/_/g, " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {plan?.name || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {evt.metadata ? JSON.stringify(evt.metadata) : "—"}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
