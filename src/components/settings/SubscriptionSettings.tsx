/**
 * SubscriptionSettings — Displays current subscription,
 * upgrade/downgrade options, and billing history within Settings page.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription, type PlanTier } from "@/hooks/useSubscription";
import { useSubscriptionPlans, formatPrice, getMonthlyEquivalent } from "@/hooks/useSubscriptionPlans";
import { useRole } from "@/contexts/RoleContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Crown, Sparkles, Zap, CreditCard, Calendar, AlertTriangle,
  ArrowUpRight, ExternalLink, Check, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const TIER_ICONS: Record<PlanTier, typeof Zap> = {
  free: Zap,
  pro: Sparkles,
  enterprise: Crown,
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  trialing: { label: "Trial", variant: "secondary" },
  past_due: { label: "Past Due", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "destructive" },
  expired: { label: "Expired", variant: "outline" },
  paused: { label: "Paused", variant: "secondary" },
};

export function SubscriptionSettings() {
  const navigate = useNavigate();
  const { activeRole } = useRole();
  const { subscription, tier, status, isTrialing, trialDaysLeft, isLoading, refetch } = useSubscription();
  const [cancelling, setCancelling] = useState(false);

  // Billing history
  const { data: payments } = useQuery({
    queryKey: ["my-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payment_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("manage-subscription", {
        body: { action: "cancel", cancel_at_period_end: true },
      });

      if (error) throw error;
      toast.success("Subscription will cancel at the end of your billing period.");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const TierIcon = TIER_ICONS[tier];
  const statusInfo = status ? STATUS_LABELS[status] : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TierIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {subscription?.plan?.name || `${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`}
                </CardTitle>
                <CardDescription>
                  {subscription
                    ? `${subscription.billing_interval === "annual" ? "Annual" : "Monthly"} billing`
                    : "No active subscription"}
                </CardDescription>
              </div>
            </div>
            {statusInfo && (
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Trial Banner */}
          {isTrialing && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-800 dark:text-blue-300">
                <strong>{trialDaysLeft} days</strong> left in your free trial.
                {trialDaysLeft <= 3 && " Add a payment method to avoid interruption."}
              </span>
            </div>
          )}

          {/* Cancel-at-period-end warning */}
          {subscription?.cancel_at_period_end && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm text-amber-800 dark:text-amber-300">
                Your subscription will end on{" "}
                <strong>
                  {subscription.current_period_end
                    ? format(new Date(subscription.current_period_end), "dd MMM yyyy")
                    : "the end of this period"}
                </strong>.
              </span>
            </div>
          )}

          {/* Plan details */}
          {subscription?.plan && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Price</span>
                <p className="font-medium">
                  {subscription.plan.price_amount === 0
                    ? "Free"
                    : subscription.billing_interval === "annual"
                    ? `${getMonthlyEquivalent(subscription.plan.price_amount)} (billed annually)`
                    : formatPrice(subscription.plan.price_amount)}
                </p>
              </div>
              {subscription.current_period_end && (
                <div>
                  <span className="text-muted-foreground">Next billing</span>
                  <p className="font-medium">
                    {format(new Date(subscription.current_period_end), "dd MMM yyyy")}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Features list */}
          {subscription?.plan?.features && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Included features</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {(subscription.plan.features as string[]).map((f, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-sm">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/pricing")} variant={tier === "free" ? "default" : "outline"}>
              <ArrowUpRight className="h-4 w-4 mr-1.5" />
              {tier === "free" ? "Upgrade Plan" : "Change Plan"}
            </Button>

            {tier !== "free" && !subscription?.cancel_at_period_end && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="text-destructive hover:text-destructive">
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your subscription will remain active until the end of your current billing period.
                      You won't be charged again after that.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancel}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={cancelling}
                    >
                      {cancelling ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No payment history yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm">
                      {format(new Date(p.created_at), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatPrice(p.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.status === "captured" ? "default" : p.status === "failed" ? "destructive" : "secondary"}
                        className="text-xs capitalize"
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm capitalize text-muted-foreground">
                      {p.payment_method || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
