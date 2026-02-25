import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
  Heart, MessageSquare, Bookmark, Share2, FileText, Image, Video, Music,
  CheckCircle2, BarChart3, UserCheck, Building2, TrendingUp, BookOpen, Megaphone, Newspaper,
  Repeat2, MoreVertical, Pencil, EyeOff, Archive, Trash2, Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FeedPost } from "@/hooks/useFeedPosts";
import { usePostInteractions } from "@/hooks/usePostInteractions";
import { toast } from "sonner";
import { differenceInMinutes } from "date-fns";
import { ReportDialog } from "@/components/feed/ReportDialog";
import { CommentSection } from "@/components/feed/CommentSection";

const postTypeConfig: Record<string, { label: string; icon: typeof TrendingUp; className: string }> = {
  market_commentary: { label: "Market Commentary", icon: TrendingUp, className: "bg-accent/10 text-accent" },
  research_note: { label: "Research Note", icon: BookOpen, className: "bg-issuer/10 text-issuer" },
  announcement: { label: "Announcement", icon: Megaphone, className: "bg-destructive/10 text-destructive" },
  article: { label: "Article", icon: Newspaper, className: "bg-intermediary/10 text-intermediary" },
  text: { label: "Insight", icon: FileText, className: "bg-muted text-muted-foreground" },
};

const roleIcon: Record<string, typeof BarChart3> = {
  investor: BarChart3,
  intermediary: UserCheck,
  issuer: Building2,
};

const roleColor: Record<string, string> = {
  investor: "bg-investor/10 text-investor",
  intermediary: "bg-intermediary/10 text-intermediary",
  issuer: "bg-issuer/10 text-issuer",
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
  const RoleIcon = primaryRole ? roleIcon[primaryRole.role] : null;
  const AttachIcon = getAttachmentIcon(post.attachment_type);
  const { liked, bookmarked, reposted, currentUserId, toggleLike, toggleBookmark, toggleRepost } = usePostInteractions(post.id);
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
        <Link to={`/profile/${post.author.id}`} className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0 overflow-hidden hover:ring-2 hover:ring-accent/30 transition-all">
          {post.author.avatar_url ? (
            <img src={post.author.avatar_url} alt={post.author.full_name} className="h-full w-full object-cover" />
          ) : (
            getInitials(post.author.full_name)
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to={`/profile/${post.author.id}`} className="font-semibold text-card-foreground text-sm truncate hover:underline">
              {post.author.display_name || post.author.full_name}
            </Link>
            {post.author.verification_status === "verified" && (
              <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
            )}
            {primaryRole && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleColor[primaryRole.role] || ""}`}>
                {RoleIcon && <RoleIcon className="h-2.5 w-2.5" />}
                <span className="capitalize">{primaryRole.role}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            <span>·</span>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${typeConfig.className}`}>
              <TypeIcon className="h-2.5 w-2.5" />
              {typeConfig.label}
            </span>
          </div>
        </div>

        {/* Post menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-card-foreground shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
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
                <DropdownMenuItem onClick={() => toast.info("Archive post coming soon")} className="gap-2 text-sm">
                  <Archive className="h-3.5 w-3.5" /> Archive
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
          />
        </div>
      )}

      {/* Non-image Attachment */}
      {post.attachment_name && AttachIcon && !isImageAttachment(post.attachment_type) && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 mb-3">
          <AttachIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{post.attachment_name}</span>
        </div>
      )}

      {/* Image attachment placeholder (for attachment:// URLs) */}
      {post.attachment_name && isImageAttachment(post.attachment_type) && post.attachment_url?.startsWith("attachment://") && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 mb-3">
          <Image className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{post.attachment_name}</span>
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
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2.5 gap-1.5 text-xs transition-colors ${liked ? "text-destructive hover:text-destructive/80" : "text-muted-foreground hover:text-destructive"}`}
          onClick={toggleLike}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
          <span>{post.like_count > 0 ? post.like_count : ""}</span>
        </Button>

        {/* Comment */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2.5 gap-1.5 text-xs transition-colors ${commentsOpen ? "text-accent" : "text-muted-foreground hover:text-accent"}`}
          onClick={() => setCommentsOpen(!commentsOpen)}
        >
          <MessageSquare className={`h-3.5 w-3.5 ${commentsOpen ? "fill-current" : ""}`} />
          <span>{post.comment_count > 0 ? post.comment_count : ""}</span>
        </Button>

        {/* Repost */}
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2.5 gap-1.5 text-xs transition-colors ${reposted ? "text-green-600 hover:text-green-500" : "text-muted-foreground hover:text-green-600"}`}
          onClick={toggleRepost}
        >
          <Repeat2 className={`h-3.5 w-3.5 ${reposted ? "stroke-[2.5px]" : ""}`} />
          <span>{post.repost_count > 0 ? post.repost_count : ""}</span>
        </Button>


        <div className="flex-1" />

        <div className="flex-1" />

        {/* Share */}
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-8 px-2.5 transition-colors" onClick={handleShare}>
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Inline Comments */}
      {commentsOpen && <CommentSection postId={post.id} />}

      {/* Report Dialog */}
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} postId={post.id} postAuthorId={post.author.id} />
    </article>
  );
}
