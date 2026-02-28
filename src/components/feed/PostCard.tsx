import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
  Heart, MessageSquare, Bookmark, Share2, FileText, Image, Video, Music,
  CheckCircle2, Megaphone, Newspaper,
  MoreVertical, Pencil, EyeOff, Trash2, Flag, TrendingUp, BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import type { FeedPost } from "@/hooks/useFeedPosts";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { differenceInMinutes } from "date-fns";
import { ReportDialog } from "@/components/feed/ReportDialog";
import { CommentSection } from "@/components/feed/CommentSection";
import { ROLE_CONFIG } from "@/lib/role-config";
import { UserCheck } from "lucide-react";

const postTypeConfig: Record<string, { label: string; icon: typeof TrendingUp; className: string }> = {
  market_commentary: { label: "Market Commentary", icon: TrendingUp, className: "bg-status-info/10 text-status-info" },
  research_note: { label: "Research Note", icon: BookOpen, className: "bg-status-highlight/10 text-status-highlight" },
  announcement: { label: "Announcement", icon: Megaphone, className: "bg-destructive/10 text-destructive" },
  article: { label: "Article", icon: Newspaper, className: "bg-accent/10 text-accent" },
  text: { label: "Insight", icon: FileText, className: "bg-muted text-muted-foreground" },
  query: { label: "Query", icon: FileText, className: "bg-gold/10 text-gold" },
};

const queryCategoryConfig: Record<string, { label: string; icon: typeof FileText; className: string }> = {
  requirement: { label: "Requirement", icon: FileText, className: "bg-gold/10 text-gold" },
  expert_find: { label: "Expert Find", icon: UserCheck, className: "bg-status-info/10 text-status-info" },
};

function getAttachmentIcon(type: string | null) {
  if (!type) return null;
  if (type.startsWith("image")) return Image;
  if (type.startsWith("video")) return Video;
  if (type.startsWith("audio")) return Music;
  return FileText;
}

function isImageAttachment(type: string | null) {
  return type?.startsWith("image");
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}


export function PostCard({ post }: { post: FeedPost }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const typeConfig = postTypeConfig[post.post_type] || postTypeConfig.text;
  const TypeIcon = typeConfig.icon;
  const primaryRole = post.roles[0];
  const roleConf = primaryRole ? ROLE_CONFIG[primaryRole.role] : null;
  const RoleIcon = roleConf?.icon ?? null;
  const AttachIcon = getAttachmentIcon(post.attachment_type);
  const { liked, bookmarked, currentUserId, toggleLike, toggleBookmark } = usePostInteractions(post.id);
  const isOwnPost = currentUserId === post.author.id;
  const canEdit = isOwnPost && differenceInMinutes(new Date(), new Date(post.created_at)) <= 60;

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Post link copied to clipboard");
    } catch {
      toast.info("Could not copy link");
    }
  };

  return (
    <article className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Link to={`/profile/${post.author.id}`} className="shrink-0 hover:opacity-90 transition-opacity">
          <NetworkAvatar
            src={post.author.avatar_url}
            initials={getInitials(post.author.full_name)}
            size="sm"
            roleColor={roleConf?.hslVar}
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to={`/profile/${post.author.id}`} className="font-semibold text-card-foreground text-sm truncate hover:underline">
              {post.author.display_name || post.author.full_name}
            </Link>
            {post.author.verification_status === "verified" && (
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
            )}
            {primaryRole && roleConf && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleConf.bgColor}`}>
                {RoleIcon && <RoleIcon className="h-2.5 w-2.5" />}
                <span className="capitalize">{primaryRole.role}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            {post.post_type !== "text" && (
              <>
                <span>·</span>
                <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${typeConfig.className}`}>
                  <TypeIcon className="h-2.5 w-2.5" />
                  {typeConfig.label}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Post menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors shrink-0"
              aria-label="Post options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50 bg-popover border border-border shadow-lg">
            {isOwnPost ? (
              <>
                {canEdit && (
                  <DropdownMenuItem onClick={() => toast.info("Edit post coming soon")} className="gap-2 text-sm">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => toast.info("Hide post coming soon")} className="gap-2 text-sm">
                  <EyeOff className="h-3.5 w-3.5" /> Hide
                </DropdownMenuItem>


                <DropdownMenuItem onClick={() => toast.info("Delete post coming soon")} className="gap-2 text-sm text-destructive focus:text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={toggleBookmark} className="gap-2 text-sm">
                  <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-current text-accent" : ""}`} />
                  {bookmarked ? "Remove Bookmark" : "Bookmark"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setReportOpen(true)} className="gap-2 text-sm text-destructive focus:text-destructive">
                  <Flag className="h-3.5 w-3.5" /> Report
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content — strip trailing hashtag lines to avoid duplication with tag chips */}
      <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-line mb-3">
        {post.content.replace(/\n*(?:#\w+\s*)+$/g, "").trim()}
      </p>

      {/* Image Attachment - render inline */}
      {post.attachment_url && isImageAttachment(post.attachment_type) && !post.attachment_url.startsWith("attachment://") && (
        <div className="rounded-lg overflow-hidden border border-border mb-3">
          <img
            src={post.attachment_url}
            alt={post.attachment_name || "Post attachment"}
            className="w-full max-h-[400px] object-cover"
            loading="lazy"
            onError={(e) => {
              // Hide broken images gracefully
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}

      {/* Non-image Attachment — download link */}
      {post.attachment_name && AttachIcon && !isImageAttachment(post.attachment_type) && post.attachment_url && !post.attachment_url.startsWith("attachment://") && (
        <a
          href={post.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 mb-3 hover:bg-secondary transition-colors"
        >
          <AttachIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-foreground truncate flex-1">{post.attachment_name}</span>
          <span className="text-[10px] text-accent font-medium shrink-0">Download</span>
        </a>
      )}

      {/* Placeholder for legacy attachment:// URLs */}
      {post.attachment_name && post.attachment_url?.startsWith("attachment://") && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2 mb-3">
          {AttachIcon && <AttachIcon className="h-4 w-4 text-muted-foreground shrink-0" />}
          <span className="text-xs text-muted-foreground truncate">{post.attachment_name}</span>
          <span className="text-[10px] text-muted-foreground italic shrink-0">Pending upload</span>
        </div>
      )}

      {/* Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.hashtags.map((tag) => (
            <span key={tag} className="text-xs text-accent font-medium">
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-border">
        {/* Like */}
        <button
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors",
            liked
              ? "text-destructive bg-destructive/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
          onClick={toggleLike}
          aria-label={liked ? "Unlike post" : "Like post"}
          aria-pressed={liked}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
          <span>{post.like_count > 0 ? post.like_count : ""}</span>
        </button>

        {/* Comment */}
        <button
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors",
            commentsOpen
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-primary hover:bg-primary/5"
          )}
          onClick={() => setCommentsOpen(!commentsOpen)}
          aria-label={commentsOpen ? "Hide comments" : "Show comments"}
          aria-expanded={commentsOpen}
        >
          <MessageSquare className={`h-3.5 w-3.5 ${commentsOpen ? "fill-current" : ""}`} />
          <span>{post.comment_count > 0 ? post.comment_count : ""}</span>
        </button>




        <div className="flex-1" />

        {/* Share */}
        <button
          className="inline-flex items-center px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
          onClick={handleShare}
          aria-label="Share post"
        >
          <Share2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Inline Comments */}
      {commentsOpen && <CommentSection postId={post.id} />}

      {/* Report Dialog */}
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} postId={post.id} postAuthorId={post.author.id} />
    </article>
  );
}
