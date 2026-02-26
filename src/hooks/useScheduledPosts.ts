import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScheduledPost {
  id: string;
  content: string;
  post_type: string;
  post_kind: string;
  visibility: string;
  scheduled_at: string;
  hashtags: string[] | null;
  attachment_name: string | null;
  created_at: string;
}

export function useScheduledPosts(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["scheduled-posts", userId],
    enabled: !!userId,
    queryFn: async (): Promise<ScheduledPost[]> => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, content, post_type, post_kind, visibility, scheduled_at, hashtags, attachment_name, created_at")
        .eq("author_id", userId!)
        .not("scheduled_at", "is", null)
        .gt("scheduled_at", new Date().toISOString())
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return data as ScheduledPost[];
    },
  });

  const cancelPost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      toast.success("Scheduled post cancelled");
    },
    onError: () => toast.error("Failed to cancel post"),
  });

  const publishNow = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from("posts")
        .update({ scheduled_at: null } as any)
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-posts"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast.success("Post published now!");
    },
    onError: () => toast.error("Failed to publish post"),
  });

  return { ...query, cancelPost, publishNow };
}
