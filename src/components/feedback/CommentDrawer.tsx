import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronUp, MessageSquare, Send, Reply, AlertTriangle, ShieldCheck, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  useFeatureComments,
  useAddFeatureComment,
  useCommentUpvote,
  type FeatureRequest,
  type FeatureComment,
} from "@/hooks/useFeedback";

const STATUS_LABELS: Record<string, string> = {
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  beta: "Beta",
  released: "Released",
  rejected: "Rejected",
};

const ROLE_LABELS: Record<string, string> = {
  investor: "INV",
  intermediary: "INT",
  issuer: "ISS",
  enabler: "ENB",
};

const EXPERT_ROLES = ["issuer", "intermediary"];

interface CommentDrawerProps {
  feature: FeatureRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommentDrawer({ feature, open, onOpenChange }: CommentDrawerProps) {
  const { data: comments, isLoading } = useFeatureComments(feature?.id || null);
  const addComment = useAddFeatureComment();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmitComment = () => {
    if (!feature || !newComment.trim()) return;
    addComment.mutate(
      { featureId: feature.id, content: newComment },
      { onSuccess: () => setNewComment("") }
    );
  };

  const handleSubmitReply = (parentId: string) => {
    if (!feature || !replyText.trim()) return;
    addComment.mutate(
      { featureId: feature.id, content: replyText, parentId },
      { onSuccess: () => { setReplyText(""); setReplyTo(null); } }
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="p-4 pb-3 border-b border-border shrink-0">
          <SheetTitle className="text-sm font-semibold text-left leading-tight">
            {feature?.title || "Feature Details"}
          </SheetTitle>
          {feature && (
            <div className="flex items-center gap-2 flex-wrap mt-1.5">
              <Badge variant="outline" className="text-[10px]">
                {STATUS_LABELS[feature.status]}
              </Badge>
              {feature.is_regulatory && (
                <span className="flex items-center gap-0.5 text-[10px] text-warning">
                  <AlertTriangle className="h-3 w-3" /> Regulatory
                </span>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto">
                Priority: {Number(feature.priority_score).toFixed(1)}
              </span>
            </div>
          )}
          {feature?.description && (
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{feature.description}</p>
          )}
        </SheetHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))
          ) : !comments?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground/70">Be the first to share your thoughts</p>
            </div>
          ) : (
            comments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                featureId={feature!.id}
                replyTo={replyTo}
                setReplyTo={setReplyTo}
                replyText={replyText}
                setReplyText={setReplyText}
                onSubmitReply={handleSubmitReply}
                isSubmitting={addComment.isPending}
              />
            ))
          )}
        </div>

        {/* New comment input */}
        <div className="shrink-0 border-t border-border p-3">
          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value.slice(0, 500))}
              placeholder="Add a comment..."
              className="min-h-[40px] max-h-[80px] text-xs resize-none flex-1"
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />
            <Button
              size="sm"
              className="h-10 w-10 p-0 shrink-0"
              disabled={!newComment.trim() || addComment.isPending}
              onClick={handleSubmitComment}
              aria-label="Send comment"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Single Comment ───
function CommentItem({
  comment,
  featureId,
  replyTo,
  setReplyTo,
  replyText,
  setReplyText,
  onSubmitReply,
  isSubmitting,
}: {
  comment: FeatureComment;
  featureId: string;
  replyTo: string | null;
  setReplyTo: (id: string | null) => void;
  replyText: string;
  setReplyText: (t: string) => void;
  onSubmitReply: (parentId: string) => void;
  isSubmitting: boolean;
}) {
  const upvoteMutation = useCommentUpvote();
  const primaryRole = comment.roles?.[0] || "investor";
  const isExpert = comment.roles?.some(r => EXPERT_ROLES.includes(r));

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {/* Author row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {comment.profile?.avatar_url ? (
            <img src={comment.profile.avatar_url} className="h-5 w-5 rounded-full" alt="" />
          ) : (
            <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium">
              {comment.profile?.full_name?.[0] || "?"}
            </div>
          )}
          <span className="text-xs font-medium text-foreground">
            {comment.profile?.display_name || comment.profile?.full_name || "User"}
          </span>
          {comment.profile?.verification_status === "verified" && (
            <ShieldCheck className="h-3 w-3 text-primary" />
          )}
          <Badge variant="outline" className="text-[8px] h-4 px-1">{ROLE_LABELS[primaryRole]}</Badge>
          {isExpert && (
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="secondary" className="text-[8px] h-4 px-1 gap-0.5">
                  <Award className="h-2.5 w-2.5" /> Expert
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="text-xs">Industry expert — Issuer or Intermediary role</TooltipContent>
            </Tooltip>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Content */}
        <p className="text-xs text-foreground/90 leading-relaxed pl-6">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 pl-6">
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-6 gap-1 text-[10px] px-1.5", comment.user_upvoted && "text-primary")}
            onClick={() =>
              upvoteMutation.mutate({
                commentId: comment.id,
                featureId,
                action: comment.user_upvoted ? "remove" : "upvote",
              })
            }
            disabled={upvoteMutation.isPending}
          >
            <ChevronUp className="h-3 w-3" />
            {comment.upvote_count}
          </Button>
          {!comment.parent_id && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 text-[10px] px-1.5 text-muted-foreground"
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            >
              <Reply className="h-3 w-3" /> Reply
            </Button>
          )}
        </div>
      </div>

      {/* Reply input */}
      {replyTo === comment.id && (
        <div className="flex gap-2 pl-6">
          <Textarea
            value={replyText}
            onChange={e => setReplyText(e.target.value.slice(0, 300))}
            placeholder="Reply..."
            className="min-h-[32px] max-h-[60px] text-xs resize-none flex-1"
            autoFocus
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmitReply(comment.id);
              }
            }}
          />
          <Button
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            disabled={!replyText.trim() || isSubmitting}
            onClick={() => onSubmitReply(comment.id)}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Threaded replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 border-l-2 border-border/50 ml-3 space-y-2">
          {comment.replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              featureId={featureId}
              replyTo={replyTo}
              setReplyTo={setReplyTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={onSubmitReply}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
