import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronUp, MessageSquare, Link2, AlertTriangle, Pin, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFeatureVote, type FeatureRequest } from "@/hooks/useFeedback";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const STATUS_STYLES: Record<string, string> = {
  under_review: "bg-warning/10 text-warning border-warning/20",
  planned: "bg-primary/10 text-primary border-primary/20",
  in_progress: "bg-accent/10 text-accent-foreground border-accent/20",
  beta: "bg-secondary/10 text-secondary-foreground border-secondary/20",
  released: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

const STATUS_LABELS: Record<string, string> = {
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  beta: "Beta",
  released: "Released",
  rejected: "Rejected",
};

const CATEGORY_LABELS: Record<string, string> = {
  ui_ux: "UI/UX",
  investment: "Investment",
  insurance: "Insurance",
  compliance: "Compliance",
  community: "Community",
  data: "Data",
  jobs: "Jobs",
};

const ROLE_COLORS = {
  investor: "bg-investor",
  intermediary: "bg-intermediary",
  issuer: "bg-issuer",
  enabler: "bg-accent",
};

const ROLE_LABELS: Record<string, string> = {
  investor: "INV",
  intermediary: "INT",
  issuer: "ISS",
  enabler: "ENB",
};

interface FeatureCardProps {
  feature: FeatureRequest;
  onOpenComments?: () => void;
}

export function FeatureCard({ feature, onOpenComments }: FeatureCardProps) {
  const [expanded, setExpanded] = useState(false);
  const voteMutation = useFeatureVote();

  const totalVotes = feature.inv_votes + feature.int_votes + feature.iss_votes + feature.enb_votes;
  const maxVotes = Math.max(totalVotes, 1);

  const handleVote = useCallback(() => {
    voteMutation.mutate({
      featureId: feature.id,
      action: feature.user_voted ? "unvote" : "vote",
    });
  }, [feature.id, feature.user_voted, voteMutation]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/feedback?feature=${feature.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  }, [feature.id]);

  const authorDisplay = feature.is_anonymous
    ? null
    : feature.author_profile;

  const primaryRole = feature.author_roles?.[0] || "investor";

  return (
    <article
      role="article"
      aria-label={`Feature request: ${feature.title}`}
      className={cn(
        "rounded-lg border bg-card p-4 transition-all hover:shadow-sm focus-within:ring-2 focus-within:ring-primary/20",
        feature.pinned && "border-primary/30 bg-primary/[0.02]"
      )}
    >
      {/* Pinned badge */}
      {feature.pinned && (
        <div className="flex items-center gap-1 text-[10px] font-medium text-primary mb-2">
          <Pin className="h-3 w-3" />
          {feature.pin_label || "Pinned"}
        </div>
      )}

      <div className="flex gap-3">
        {/* Vote button */}
        <div className="flex flex-col items-center shrink-0">
          <Button
            variant={feature.user_voted ? "default" : "outline"}
            size="sm"
            aria-label={feature.user_voted ? `Remove vote (${totalVotes} total)` : `Vote (${totalVotes} total)`}
            aria-pressed={feature.user_voted}
            className={cn(
              "h-12 w-12 flex flex-col gap-0 p-0 rounded-lg",
              feature.user_voted && "bg-primary text-primary-foreground"
            )}
            onClick={handleVote}
            disabled={voteMutation.isPending}
          >
            <ChevronUp className="h-4 w-4" />
            <span className="text-xs font-bold tabular-nums">{totalVotes}</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-semibold text-sm text-foreground leading-tight">{feature.title}</h3>
            <Badge variant="outline" className={cn("text-[10px] shrink-0 border", STATUS_STYLES[feature.status])}>
              {STATUS_LABELS[feature.status]}
            </Badge>
            <Badge variant="secondary" className="text-[10px] shrink-0">
              {CATEGORY_LABELS[feature.category]}
            </Badge>
            {feature.is_regulatory && (
              <Tooltip>
                <TooltipTrigger>
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                </TooltipTrigger>
                <TooltipContent className="text-xs">May require regulatory approval</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Description */}
          <p className={cn(
            "text-xs text-muted-foreground leading-relaxed",
            !expanded && "line-clamp-2"
          )}>
            {feature.description}
          </p>
          {feature.description.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[10px] text-primary hover:underline"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}

          {/* Role Segmentation Bar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                {(["investor", "intermediary", "issuer", "enabler"] as const).map(role => {
                  const count = feature[`${role === "investor" ? "inv" : role === "intermediary" ? "int" : role === "issuer" ? "iss" : "enb"}_votes`];
                  if (count === 0) return null;
                  const pct = (count / maxVotes) * 100;
                  return (
                    <div
                      key={role}
                      className={cn("h-full transition-all", ROLE_COLORS[role])}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
              </div>
            </TooltipTrigger>
            <TooltipContent className="text-xs space-y-0.5">
              <p className="font-medium mb-1">Votes by Role</p>
              {(["investor", "intermediary", "issuer", "enabler"] as const).map(role => {
                const key = role === "investor" ? "inv" : role === "intermediary" ? "int" : role === "issuer" ? "iss" : "enb";
                return (
                  <p key={role}>
                    {ROLE_LABELS[role]}: {feature[`${key}_votes`]} votes
                  </p>
                );
              })}
            </TooltipContent>
          </Tooltip>

          {/* Meta row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Priority Score */}
            <Tooltip>
              <TooltipTrigger>
                <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
                  Priority: {Number(feature.priority_score).toFixed(1)}
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-xs max-w-xs">
                <p className="font-medium mb-1">Weighted Priority Score</p>
                <p>= (INV×1) + (INT×2) + (ISS×3) + (ENB×2.5)</p>
                <p className="mt-1">= ({feature.inv_votes}×1) + ({feature.int_votes}×2) + ({feature.iss_votes}×3) + ({feature.enb_votes}×2.5)</p>
              </TooltipContent>
            </Tooltip>

            {/* Author */}
            <div className="flex items-center gap-1.5">
              {authorDisplay ? (
                <>
                  {authorDisplay.avatar_url ? (
                    <img src={authorDisplay.avatar_url} className="h-4 w-4 rounded-full" alt="" />
                  ) : (
                    <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium">
                      {authorDisplay.full_name?.[0]}
                    </div>
                  )}
                  <span className="text-[10px] text-muted-foreground">{authorDisplay.display_name || authorDisplay.full_name}</span>
                  {authorDisplay.verification_status === "verified" && (
                    <ShieldCheck className="h-3 w-3 text-primary" />
                  )}
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">Anonymous</span>
              )}
              <Badge variant="outline" className="text-[8px] h-4 px-1">{ROLE_LABELS[primaryRole]}</Badge>
            </div>

            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(feature.created_at), { addSuffix: true })}
            </span>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground px-2" onClick={onOpenComments} aria-label={`${feature.comment_count} comments — open discussion`}>
                <MessageSquare className="h-3.5 w-3.5" />
                {feature.comment_count}
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-foreground px-2" onClick={handleShare} aria-label="Copy link to this feature">
                <Link2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
