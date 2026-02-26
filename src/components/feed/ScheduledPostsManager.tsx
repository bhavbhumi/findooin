import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScheduledPosts } from "@/hooks/useScheduledPosts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar, Clock, Trash2, Send, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScheduledPostsManager() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: posts, isLoading, cancelPost, publishNow } = useScheduledPosts(userId);

  if (!userId) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-semibold font-heading">Scheduled Posts</h3>
        {posts && posts.length > 0 && (
          <Badge variant="secondary" className="text-[10px]">{posts.length}</Badge>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && (!posts || posts.length === 0) && (
        <p className="text-xs text-muted-foreground py-2">No scheduled posts</p>
      )}

      {posts?.map((post) => (
        <div
          key={post.id}
          className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2"
        >
          <p className="text-xs text-foreground line-clamp-2">{post.content}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(post.scheduled_at), "MMM d, yyyy")}
            </Badge>
            <Badge variant="outline" className="text-[10px] gap-1">
              <Clock className="h-3 w-3" />
              {format(new Date(post.scheduled_at), "h:mm a")}
            </Badge>
            {post.attachment_name && (
              <Badge variant="secondary" className="text-[10px] gap-1">
                <FileText className="h-3 w-3" />
                {post.attachment_name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => publishNow.mutate(post.id)}
              disabled={publishNow.isPending}
            >
              <Send className="h-3 w-3" /> Publish Now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
              onClick={() => cancelPost.mutate(post.id)}
              disabled={cancelPost.isPending}
            >
              <Trash2 className="h-3 w-3" /> Cancel
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
}
