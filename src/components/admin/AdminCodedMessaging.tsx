/**
 * AdminCodedMessaging — SEBI 2026 Coded Messaging Moderation Panel
 *
 * Displays auto-flagged content with severity, matched patterns,
 * and allows admins to review, dismiss, or take action.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  ShieldAlert, AlertTriangle, CheckCircle2, Eye, XCircle,
  Loader2, MessageSquare, FileText, Users, Newspaper
} from "lucide-react";
import { FindooLoader } from "@/components/FindooLoader";
import { getCategoryLabel } from "@/lib/coded-messaging-detector";

const severityConfig: Record<string, { label: string; className: string; priority: number }> = {
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20", priority: 1 },
  high: { label: "High", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", priority: 2 },
  medium: { label: "Medium", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20", priority: 3 },
  low: { label: "Low", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", priority: 4 },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-status-warning/10 text-status-warning border-status-warning/20" },
  reviewed: { label: "Reviewed", className: "bg-accent/10 text-accent border-accent/20" },
  dismissed: { label: "Dismissed", className: "bg-muted text-muted-foreground border-border" },
  action_taken: { label: "Action Taken", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const resourceIcons: Record<string, React.ReactNode> = {
  post: <Newspaper className="h-4 w-4" />,
  opinion: <Users className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
  message: <FileText className="h-4 w-4" />,
};

interface ModerationFlag {
  id: string;
  resource_type: string;
  resource_id: string;
  author_id: string;
  content_excerpt: string;
  detection_summary: string;
  matched_patterns: Array<{
    pattern: string;
    category: string;
    severity: string;
    matched: string;
  }>;
  severity: string;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  created_at: string;
  author_profile?: { full_name: string; display_name: string | null };
}

export default function AdminCodedMessaging() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [reviewDialog, setReviewDialog] = useState<ModerationFlag | null>(null);

  const { data: flags, isLoading } = useQuery({
    queryKey: ["moderation-flags", statusFilter, severityFilter, resourceFilter],
    queryFn: async () => {
      let q = supabase.from("moderation_flags" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      if (severityFilter !== "all") q = q.eq("severity", severityFilter);
      if (resourceFilter !== "all") q = q.eq("resource_type", resourceFilter);
      const { data, error } = await q;
      if (error) throw error;

      // Enrich with author profiles
      const authorIds = [...new Set((data as any[]).map((f: any) => f.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name")
        .in("id", authorIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      return (data as any[]).map((f: any) => ({
        ...f,
        matched_patterns: f.matched_patterns || [],
        author_profile: profileMap.get(f.author_id) || { full_name: "Unknown", display_name: null },
      })) as ModerationFlag[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("moderation_flags" as any)
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          reviewer_notes: notes || null,
        } as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation-flags"] });
      toast.success("Flag updated");
      setReviewDialog(null);
    },
    onError: () => toast.error("Failed to update flag"),
  });

  // Stats
  const stats = useMemo(() => {
    if (!flags) return { total: 0, pending: 0, critical: 0, high: 0 };
    return {
      total: flags.length,
      pending: flags.filter(f => f.status === "pending").length,
      critical: flags.filter(f => f.severity === "critical").length,
      high: flags.filter(f => f.severity === "high").length,
    };
  }, [flags]);

  if (isLoading) return <FindooLoader />;

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Flags</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-status-warning">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending Review</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-destructive">{stats.critical}</p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.high}</p>
          <p className="text-xs text-muted-foreground">High Severity</p>
        </CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
            <SelectItem value="action_taken">Action Taken</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content</SelectItem>
            <SelectItem value="post">Posts</SelectItem>
            <SelectItem value="opinion">Opinions</SelectItem>
            <SelectItem value="comment">Comments</SelectItem>
            <SelectItem value="message">Messages</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flags table */}
      {!flags?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldAlert className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No coded messaging flags found</p>
            <p className="text-xs text-muted-foreground mt-1">Content is clean — no SEBI compliance violations detected</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Patterns</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>When</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => {
                const sev = severityConfig[flag.severity] || severityConfig.low;
                const st = statusConfig[flag.status] || statusConfig.pending;
                return (
                  <TableRow key={flag.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {resourceIcons[flag.resource_type]}
                        <span className="text-xs capitalize">{flag.resource_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {flag.author_profile?.display_name || flag.author_profile?.full_name || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <p className="text-xs text-muted-foreground truncate">{flag.content_excerpt}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${sev.className}`}>{sev.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {flag.matched_patterns.slice(0, 2).map((m, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {getCategoryLabel(m.category as any)}
                          </Badge>
                        ))}
                        {flag.matched_patterns.length > 2 && (
                          <Badge variant="outline" className="text-[10px]">+{flag.matched_patterns.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${st.className}`}>{st.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(flag.created_at), { addSuffix: true })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Review"
                          onClick={() => setReviewDialog(flag)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {flag.status === "pending" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-green-600"
                              title="Dismiss"
                              onClick={() => updateMutation.mutate({ id: flag.id, status: "dismissed" })}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              title="Take Action"
                              onClick={() => updateMutation.mutate({ id: flag.id, status: "action_taken" })}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Review Dialog */}
      {reviewDialog && (
        <Dialog open={!!reviewDialog} onOpenChange={() => setReviewDialog(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                Review Coded Messaging Flag
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {resourceIcons[reviewDialog.resource_type]}
                  <span className="text-sm capitalize font-medium">{reviewDialog.resource_type}</span>
                </div>
                <Badge variant="outline" className={severityConfig[reviewDialog.severity]?.className}>
                  {severityConfig[reviewDialog.severity]?.label}
                </Badge>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Author</Label>
                <p className="text-sm font-medium">
                  {reviewDialog.author_profile?.display_name || reviewDialog.author_profile?.full_name}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Content Excerpt</Label>
                <p className="text-sm bg-muted/50 p-3 rounded-md mt-1">{reviewDialog.content_excerpt}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Matched Patterns</Label>
                <div className="space-y-2 mt-1">
                  {reviewDialog.matched_patterns.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm bg-muted/30 p-2 rounded">
                      <AlertTriangle className="h-4 w-4 mt-0.5 text-status-warning shrink-0" />
                      <div>
                        <p className="font-medium">{m.pattern}</p>
                        <p className="text-xs text-muted-foreground">
                          Category: {getCategoryLabel(m.category as any)} · Matched: "{m.matched}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  updateMutation.mutate({
                    id: reviewDialog.id,
                    status: fd.get("action") as string,
                    notes: fd.get("notes") as string,
                  });
                }}
                className="space-y-3 border-t pt-3"
              >
                <div>
                  <Label>Action</Label>
                  <select
                    name="action"
                    defaultValue="reviewed"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="reviewed">Mark as Reviewed</option>
                    <option value="dismissed">Dismiss (False Positive)</option>
                    <option value="action_taken">Take Action (Violation)</option>
                  </select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea name="notes" rows={2} placeholder="Optional review notes..." />
                </div>
                <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  Submit Review
                </Button>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
