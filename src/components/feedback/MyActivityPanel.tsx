import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Lightbulb, ArrowUp, MessageSquare, Ban, CheckCircle2, Clock, Merge } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

// ─── Types ───
interface MyFeature {
  id: string;
  title: string;
  status: string;
  priority_score: number;
  inv_votes: number;
  int_votes: number;
  iss_votes: number;
  enb_votes: number;
  comment_count: number;
  rejection_reason: string | null;
  merged_into_id: string | null;
  created_at: string;
}

interface MyVote {
  id: string;
  created_at: string;
  role_at_vote: string;
  feature: {
    id: string;
    title: string;
    status: string;
    priority_score: number;
  } | null;
}

interface MyComment {
  id: string;
  content: string;
  upvote_count: number;
  created_at: string;
  feature: {
    id: string;
    title: string;
    status: string;
  } | null;
}

// ─── Hooks ───
function useMyFeatures() {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["my-features", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("feature_requests")
        .select("id, title, status, priority_score, inv_votes, int_votes, iss_votes, enb_votes, comment_count, rejection_reason, merged_into_id, created_at")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as MyFeature[];
    },
    enabled: !!userId,
  });
}

function useMyVotes() {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["my-votes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("feature_votes")
        .select("id, created_at, role_at_vote, feature_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch feature details
      const featureIds = [...new Set((data || []).map((v: any) => v.feature_id))];
      const { data: features } = featureIds.length
        ? await supabase.from("feature_requests").select("id, title, status, priority_score").in("id", featureIds)
        : { data: [] };
      const featureMap = new Map((features || []).map((f: any) => [f.id, f]));

      return (data || []).map((v: any) => ({
        ...v,
        feature: featureMap.get(v.feature_id) || null,
      })) as MyVote[];
    },
    enabled: !!userId,
  });
}

function useMyComments() {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["my-comments", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("feature_comments")
        .select("id, content, upvote_count, created_at, feature_id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const featureIds = [...new Set((data || []).map((c: any) => c.feature_id))];
      const { data: features } = featureIds.length
        ? await supabase.from("feature_requests").select("id, title, status").in("id", featureIds)
        : { data: [] };
      const featureMap = new Map((features || []).map((f: any) => [f.id, f]));

      return (data || []).map((c: any) => ({
        ...c,
        feature: featureMap.get(c.feature_id) || null,
      })) as MyComment[];
    },
    enabled: !!userId,
  });
}

// ─── Status helpers ───
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Clock }> = {
  under_review: { label: "Under Review", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30", icon: Clock },
  planned: { label: "Planned", className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30", icon: CheckCircle2 },
  in_progress: { label: "In Progress", className: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30", icon: Clock },
  beta: { label: "Beta", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", icon: CheckCircle2 },
  released: { label: "Released", className: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30", icon: CheckCircle2 },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive border-destructive/30", icon: Ban },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || { label: status, className: "bg-muted text-muted-foreground", icon: Clock };
  return (
    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", config.className)}>
      {config.label}
    </Badge>
  );
}

// ─── Sub-components ───
function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function EmptyBlock({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <span className="text-xl">{emoji}</span>
      </div>
      <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs">{subtitle}</p>
    </div>
  );
}

// ─── Tab Panels ───
function MySubmissions() {
  const { data, isLoading, isError, error } = useMyFeatures();

  if (isLoading) return <SkeletonList />;
  if (isError) return <ErrorBlock message={(error as Error)?.message || "Failed to load"} />;
  if (!data?.length) return <EmptyBlock emoji="💡" title="No submissions yet" subtitle="Suggest a feature to see it tracked here." />;

  return (
    <div className="space-y-3">
      {data.map(f => {
        const totalVotes = f.inv_votes + f.int_votes + f.iss_votes + f.enb_votes;
        return (
          <div key={f.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground leading-snug">{f.title}</p>
              <StatusBadge status={f.status} />
            </div>

            {f.rejection_reason && (
              <div className="text-xs bg-destructive/10 text-destructive rounded p-2">
                <span className="font-medium">Rejection reason:</span> {f.rejection_reason}
              </div>
            )}

            {f.merged_into_id && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Merge className="h-3 w-3" />
                Merged into another request
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <ArrowUp className="h-3 w-3" /> {totalVotes} votes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {f.comment_count}
              </span>
              <span>Score: {f.priority_score?.toFixed(1) ?? "—"}</span>
              <span className="ml-auto">{formatDistanceToNow(new Date(f.created_at), { addSuffix: true })}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MyVotes() {
  const { data, isLoading, isError, error } = useMyVotes();

  if (isLoading) return <SkeletonList />;
  if (isError) return <ErrorBlock message={(error as Error)?.message || "Failed to load"} />;
  if (!data?.length) return <EmptyBlock emoji="🗳️" title="No votes yet" subtitle="Vote on features in the Hub to track them here." />;

  return (
    <div className="space-y-3">
      {data.map(v => (
        <div key={v.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium text-foreground truncate">
              {v.feature?.title || "Deleted feature"}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {v.feature && <StatusBadge status={v.feature.status} />}
              <span>Voted as <span className="font-medium capitalize">{v.role_at_vote}</span></span>
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}

function MyComments() {
  const { data, isLoading, isError, error } = useMyComments();

  if (isLoading) return <SkeletonList />;
  if (isError) return <ErrorBlock message={(error as Error)?.message || "Failed to load"} />;
  if (!data?.length) return <EmptyBlock emoji="💬" title="No comments yet" subtitle="Join discussions on feature requests to see your comments here." />;

  return (
    <div className="space-y-3">
      {data.map(c => (
        <div key={c.id} className="rounded-lg border border-border bg-card p-4 space-y-2">
          <p className="text-xs font-medium text-muted-foreground truncate">
            On: {c.feature?.title || "Deleted feature"}
          </p>
          <p className="text-sm text-foreground line-clamp-2">{c.content}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {c.feature && <StatusBadge status={c.feature.status} />}
            <span className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3" /> {c.upvote_count}
            </span>
            <span className="ml-auto">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───
export function MyActivityPanel() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="submissions" className="space-y-4">
        <TabsList className="bg-muted/50 h-auto p-1">
          <TabsTrigger value="submissions" className="gap-1.5 text-xs">
            <Lightbulb className="h-3 w-3" />
            My Submissions
          </TabsTrigger>
          <TabsTrigger value="votes" className="gap-1.5 text-xs">
            <ArrowUp className="h-3 w-3" />
            My Votes
          </TabsTrigger>
          <TabsTrigger value="comments" className="gap-1.5 text-xs">
            <MessageSquare className="h-3 w-3" />
            My Comments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="submissions">
          <MySubmissions />
        </TabsContent>
        <TabsContent value="votes">
          <MyVotes />
        </TabsContent>
        <TabsContent value="comments">
          <MyComments />
        </TabsContent>
      </Tabs>
    </div>
  );
}
