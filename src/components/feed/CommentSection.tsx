import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { sanitizeText } from "@/lib/sanitize";
import { useCodedMessagingGuard } from "@/hooks/useCodedMessagingGuard";

function CommentAvatar({ src, name }: { src: string | null; name: string }) {
  const [err, setErr] = useState(false);
  const show = !!src && !err;
  return (
    <div
      className={cn(
        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 overflow-hidden",
        show ? "bg-muted text-muted-foreground" : "text-white drop-shadow-sm"
      )}
      style={!show ? { background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold)))" } : undefined}
    >
      {show ? (
        <img src={src} alt={name} className="h-full w-full object-cover" onError={() => setErr(true)} />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const queryClient = useQueryClient();
  const MAX_VISIBLE = 5;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    setLoading(true);
    const { data: commentsData } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: false });

    if (!commentsData || commentsData.length === 0) {
      setComments([]);
      setLoading(false);
      return;
    }

    const authorIds = [...new Set(commentsData.map(c => c.author_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, display_name, avatar_url")
      .in("id", authorIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]));

    setComments(
      commentsData.map(c => {
        const profile = profileMap.get(c.author_id);
        return {
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          author: {
            id: c.author_id,
            full_name: profile?.full_name || "Unknown",
            display_name: profile?.display_name || null,
            avatar_url: profile?.avatar_url || null,
          },
        };
      })
    );
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!text.trim() || !currentUserId || submitting) return;
    setSubmitting(true);
    const commentText = sanitizeText(text.trim());

    // Optimistic: add comment immediately
    const optimisticComment: Comment = {
      id: `temp-${Date.now()}`,
      content: commentText,
      created_at: new Date().toISOString(),
      author: {
        id: currentUserId,
        full_name: "You",
        display_name: null,
        avatar_url: null,
      },
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setText("");

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: currentUserId,
      content: commentText,
    });

    if (!error) {
      // Refresh with real data
      await loadComments();
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
    } else {
      // Rollback optimistic comment
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setText(commentText);
    }
    setSubmitting(false);
  };

  return (
    <div className="pt-3 border-t border-border space-y-3">
      {/* Comment input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Write a comment..."
          className="flex-1 h-8 rounded-lg border border-border bg-secondary/50 px-3 text-xs text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-accent hover:text-accent/80"
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="text-xs text-muted-foreground text-center py-2">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-2">No comments yet. Be the first!</div>
      ) : (
        <div className="space-y-2.5 max-h-60 overflow-y-auto">
          {(showAll ? comments : comments.slice(0, MAX_VISIBLE)).map((comment) => (
            <div key={comment.id} className="flex items-start gap-2">
              <CommentAvatar src={comment.author.avatar_url} name={comment.author.full_name} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-card-foreground">
                    {comment.author.display_name || comment.author.full_name}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-card-foreground/90 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}
          {!showAll && comments.length > MAX_VISIBLE && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-accent hover:underline w-full text-center py-1"
            >
              View all {comments.length} comments
            </button>
          )}
        </div>
      )}
    </div>
  );
}
