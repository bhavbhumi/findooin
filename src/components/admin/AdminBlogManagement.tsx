import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  BookOpen, Search, Clock,
} from "lucide-react";

const CATEGORIES = [
  { value: "market-insights", label: "Market Insights" },
  { value: "regulation", label: "Regulation" },
  { value: "investing", label: "Investing" },
  { value: "general", label: "General" },
];

interface BlogPostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image_url: string;
  tags: string;
  read_time_minutes: number;
  published: boolean;
  featured: boolean;
  author_name: string;
  author_avatar_url: string;
}

const emptyForm: BlogPostForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "general",
  cover_image_url: "",
  tags: "",
  read_time_minutes: 3,
  published: false,
  featured: false,
  author_name: "FindOO Team",
  author_avatar_url: "",
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function useAdminBlogPosts() {
  return useQuery({
    queryKey: ["admin-blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function AdminBlogManagement() {
  const qc = useQueryClient();
  const { data: posts, isLoading } = useAdminBlogPosts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogPostForm>(emptyForm);
  const [search, setSearch] = useState("");

  const upsert = useMutation({
    mutationFn: async (f: BlogPostForm & { id?: string }) => {
      const payload = {
        title: f.title,
        slug: f.slug,
        excerpt: f.excerpt,
        content: f.content,
        category: f.category,
        cover_image_url: f.cover_image_url || null,
        tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean),
        read_time_minutes: f.read_time_minutes,
        published: f.published,
        featured: f.featured,
        author_name: f.author_name,
        author_avatar_url: f.author_avatar_url || null,
        published_at: f.published ? new Date().toISOString() : null,
      };

      if (f.id) {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Post updated" : "Post created");
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Post deleted");
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => {
      const { error } = await supabase
        .from("blog_posts")
        .update({
          published,
          published_at: published ? new Date().toISOString() : null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.published ? "Published" : "Unpublished");
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase.from("blog_posts").update({ featured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(vars.featured ? "Marked featured" : "Unfeatured");
      qc.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function openEdit(post: any) {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      cover_image_url: post.cover_image_url || "",
      tags: (post.tags || []).join(", "),
      read_time_minutes: post.read_time_minutes,
      published: post.published,
      featured: post.featured,
      author_name: post.author_name,
      author_avatar_url: post.author_avatar_url || "",
    });
    setDialogOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.slug) {
      toast.error("Title and slug are required");
      return;
    }
    upsert.mutate({ ...form, id: editingId || undefined });
  }

  const filtered = (posts || []).filter(
    (p: any) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <FindooLoader text="Loading blog posts..." />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-1.5" onClick={() => { resetForm(); setDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Blog Post" : "Create Blog Post"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({
                      ...f,
                      title: e.target.value,
                      slug: editingId ? f.slug : slugify(e.target.value),
                    }))}
                    placeholder="Post title"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug *</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="url-friendly-slug"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Excerpt</Label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Brief summary..."
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Content (HTML supported)</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Full article content..."
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Cover Image URL</Label>
                  <Input
                    value={form.cover_image_url}
                    onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="mutual-funds, sebi, nfo"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Author Name</Label>
                  <Input
                    value={form.author_name}
                    onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Read Time (min)</Label>
                  <Input
                    type="number"
                    value={form.read_time_minutes}
                    onChange={(e) => setForm((f) => ({ ...f, read_time_minutes: parseInt(e.target.value) || 3 }))}
                    min={1}
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.published}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
                  />
                  <Label className="text-sm">Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))}
                  />
                  <Label className="text-sm">Featured</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={upsert.isPending}>
                  {upsert.isPending ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="flex gap-3 text-sm text-muted-foreground">
        <span>{posts?.length || 0} total</span>
        <span>·</span>
        <span>{posts?.filter((p: any) => p.published).length || 0} published</span>
        <span>·</span>
        <span>{posts?.filter((p: any) => !p.published).length || 0} drafts</span>
        <span>·</span>
        <span>{posts?.filter((p: any) => p.featured).length || 0} featured</span>
      </div>

      {/* Posts list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No blog posts found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((post: any) => (
            <Card key={post.id} className={!post.published ? "opacity-70" : ""}>
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-3">
                  {post.cover_image_url ? (
                    <img
                      src={post.cover_image_url}
                      alt=""
                      className="h-12 w-16 rounded object-cover shrink-0 border border-border"
                    />
                  ) : (
                    <div className="h-12 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-muted-foreground/40" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-medium truncate">{post.title}</h3>
                      {post.featured && (
                        <Badge variant="secondary" className="text-[9px] bg-primary/10 text-primary border-0 px-1.5 py-0 shrink-0">
                          Featured
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{post.category}</Badge>
                      <span>{post.author_name}</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={post.published ? "Unpublish" : "Publish"}
                      onClick={() => togglePublish.mutate({ id: post.id, published: !post.published })}
                    >
                      {post.published ? <Eye className="h-3.5 w-3.5 text-accent" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title={post.featured ? "Unfeature" : "Feature"}
                      onClick={() => toggleFeatured.mutate({ id: post.id, featured: !post.featured })}
                    >
                      {post.featured ? <Star className="h-3.5 w-3.5 text-yellow-500" /> : <StarOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm("Delete this blog post?")) {
                          deleteMut.mutate(post.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
