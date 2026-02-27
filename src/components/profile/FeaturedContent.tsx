import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Pin, Plus, X, Sparkles, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

interface FeaturedPost {
  id: string;
  post_id: string;
  position: number;
  post?: {
    id: string;
    content: string;
    post_type: string;
    created_at: string;
    attachment_url: string | null;
    attachment_type: string | null;
  };
}

interface AvailablePost {
  id: string;
  content: string;
  post_type: string;
  created_at: string;
  attachment_url: string | null;
}

interface FeaturedContentProps {
  profileId: string;
  isOwnProfile: boolean;
}

export const FeaturedContent = ({ profileId, isOwnProfile }: FeaturedContentProps) => {
  const [featured, setFeatured] = useState<FeaturedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [available, setAvailable] = useState<AvailablePost[]>([]);

  useEffect(() => {
    loadFeatured();
  }, [profileId]);

  const loadFeatured = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("featured_posts")
      .select("id, post_id, position")
      .eq("user_id", profileId)
      .order("position");

    if (data && data.length > 0) {
      const postIds = data.map((f: any) => f.post_id);
      const { data: posts } = await supabase
        .from("posts")
        .select("id, content, post_type, created_at, attachment_url, attachment_type")
        .in("id", postIds);

      const postMap: Record<string, any> = {};
      (posts || []).forEach((p: any) => { postMap[p.id] = p; });

      setFeatured(data.map((f: any) => ({ ...f, post: postMap[f.post_id] })));
    } else {
      setFeatured([]);
    }
    setLoading(false);
  };

  const openPicker = async () => {
    const featuredIds = new Set(featured.map((f) => f.post_id));
    const { data } = await supabase
      .from("posts")
      .select("id, content, post_type, created_at, attachment_url")
      .eq("author_id", profileId)
      .order("created_at", { ascending: false })
      .limit(20);

    setAvailable((data || []).filter((p: any) => !featuredIds.has(p.id)));
    setPickerOpen(true);
  };

  const addFeatured = async (postId: string) => {
    const { error } = await supabase.from("featured_posts").insert({
      user_id: profileId,
      post_id: postId,
      position: featured.length,
    });
    if (error) toast.error("Failed to feature post");
    else {
      toast.success("Post featured!");
      setPickerOpen(false);
      loadFeatured();
    }
  };

  const removeFeatured = async (id: string) => {
    await supabase.from("featured_posts").delete().eq("id", id);
    toast.success("Removed from featured");
    loadFeatured();
  };

  if (loading) return null;
  if (featured.length === 0 && !isOwnProfile) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-gold" />
          <h3 className="text-sm font-semibold font-heading text-card-foreground">Featured</h3>
        </div>
        {isOwnProfile && featured.length < 5 && (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={openPicker}>
            <Plus className="h-3 w-3" /> Add
          </Button>
        )}
      </div>

      {featured.length === 0 ? (
        <div className="p-6 text-center">
          <Pin className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted-foreground">Pin your best posts to showcase them here</p>
          <Button variant="outline" size="sm" className="mt-3 text-xs" onClick={openPicker}>
            Feature a post
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {featured.map((f) => (
            <div key={f.id} className="px-5 py-4 group relative">
              {f.post?.attachment_url && f.post.attachment_type?.startsWith("image") && (
                <div className="h-32 rounded-lg overflow-hidden mb-3 bg-muted">
                  <img src={f.post.attachment_url} alt="Featured" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-full capitalize">
                  {f.post?.post_type.replace(/_/g, " ")}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {f.post ? format(parseISO(f.post.created_at), "MMM d, yyyy") : ""}
                </span>
              </div>
              <p className="text-sm text-card-foreground line-clamp-3 leading-relaxed">
                {f.post?.content}
              </p>
              {isOwnProfile && (
                <button
                  onClick={() => removeFeatured(f.id)}
                  className="absolute top-3 right-3 h-6 w-6 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Picker Dialog */}
      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent className="sm:max-w-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feature a Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {available.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No posts available to feature</p>
            ) : (
              available.map((post) => (
                <button
                  key={post.id}
                  onClick={() => addFeatured(post.id)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-medium text-primary capitalize">{post.post_type.replace(/_/g, " ")}</span>
                    <span className="text-[10px] text-muted-foreground">{format(parseISO(post.created_at), "MMM d")}</span>
                  </div>
                  <p className="text-sm text-card-foreground line-clamp-2">{post.content}</p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
