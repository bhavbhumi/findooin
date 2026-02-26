import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScheduledPosts, ScheduledPost } from "@/hooks/useScheduledPosts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Trash2, Send, Loader2, FileText, Pencil, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function ScheduledPostsManager() {
  const [userId, setUserId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState<Date | undefined>();
  const [editTime, setEditTime] = useState("09:00");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: posts, isLoading, cancelPost, publishNow } = useScheduledPosts(userId);

  const startEdit = (post: ScheduledPost) => {
    setEditingId(post.id);
    setEditContent(post.content);
    const d = new Date(post.scheduled_at);
    setEditDate(d);
    setEditTime(format(d, "HH:mm"));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditDate(undefined);
  };

  const saveEdit = async () => {
    if (!editingId || !editDate) return;
    setSaving(true);
    try {
      const [h, m] = editTime.split(":").map(Number);
      const dt = new Date(editDate);
      dt.setHours(h, m, 0, 0);
      if (dt <= new Date()) {
        toast.error("Scheduled time must be in the future.");
        setSaving(false);
        return;
      }
      const hashtags = editContent.match(/#(\w+)/g)?.map(t => t.replace("#", "")) || null;
      const { error } = await supabase
        .from("posts")
        .update({
          content: editContent.trim(),
          scheduled_at: dt.toISOString(),
          hashtags: hashtags && hashtags.length > 0 ? hashtags : null,
        } as any)
        .eq("id", editingId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast.success("Scheduled post updated");
      cancelEdit();
    } catch {
      toast.error("Failed to update post");
    } finally {
      setSaving(false);
    }
  };

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
          {editingId === post.id ? (
            /* Edit mode */
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="text-xs min-h-[60px] resize-none"
              />
              <div className="flex items-center gap-2 flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {editDate ? format(editDate, "MMM d, yyyy") : "Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50" align="start">
                    <Calendar
                      mode="single"
                      selected={editDate}
                      onSelect={setEditDate}
                      disabled={(d) => d < new Date()}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="time"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="h-7 w-[100px] text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={saveEdit}
                  disabled={saving || !editContent.trim()}
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onClick={cancelEdit}
                >
                  <X className="h-3 w-3" /> Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View mode */
            <>
              <p className="text-xs text-foreground line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] gap-1">
                  <CalendarIcon className="h-3 w-3" />
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
                  onClick={() => startEdit(post)}
                >
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
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
            </>
          )}
        </div>
      ))}
    </Card>
  );
}
