import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
  Heart, MessageSquare, Bookmark, Share2, FileText, Image, Video, Music,
  CheckCircle2, BarChart3, UserCheck, Building2, TrendingUp, BookOpen, Megaphone, Newspaper,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FeedPost } from "@/hooks/useFeedPosts";
import { usePostInteractions } from "@/hooks/usePostInteractions";

const postTypeConfig: Record<string, { label: string; icon: typeof TrendingUp; className: string }> = {
  market_commentary: { label: "Market Commentary", icon: TrendingUp, className: "bg-accent/10 text-accent" },
  research_note: { label: "Research Note", icon: BookOpen, className: "bg-issuer/10 text-issuer" },
  announcement: { label: "Announcement", icon: Megaphone, className: "bg-destructive/10 text-destructive" },
  article: { label: "Article", icon: Newspaper, className: "bg-intermediary/10 text-intermediary" },
  text: { label: "Post", icon: FileText, className: "bg-muted text-muted-foreground" },
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

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export function PostCard({ post }: { post: FeedPost }) {
  const typeConfig = postTypeConfig[post.post_type] || postTypeConfig.text;
  const TypeIcon = typeConfig.icon;
  const primaryRole = post.roles[0];
  const RoleIcon = primaryRole ? roleIcon[primaryRole.role] : null;
  const AttachIcon = getAttachmentIcon(post.attachment_type);
  const { liked, bookmarked, toggleLike, toggleBookmark } = usePostInteractions(post.id);

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
      </div>

      {/* Content */}
      <p className="text-card-foreground text-sm leading-relaxed whitespace-pre-line mb-3">
        {post.content}
      </p>

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

      {/* Attachment */}
      {post.attachment_name && AttachIcon && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 mb-3">
          <AttachIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">{post.attachment_name}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2.5 gap-1.5 text-xs ${liked ? "text-destructive" : "text-muted-foreground"}`}
          onClick={toggleLike}
        >
          <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
          {(post.like_count + (liked ? 0 : 0)) > 0 && post.like_count}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2.5 gap-1.5 text-xs">
          <MessageSquare className="h-3.5 w-3.5" />
          {post.comment_count > 0 && post.comment_count}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2.5 gap-1.5 text-xs ${bookmarked ? "text-accent" : "text-muted-foreground"}`}
          onClick={toggleBookmark}
        >
          <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-current" : ""}`} />
          {post.bookmark_count > 0 && post.bookmark_count}
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2.5">
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </article>
  );
}
