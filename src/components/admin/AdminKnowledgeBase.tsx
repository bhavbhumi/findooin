/**
 * AdminKnowledgeBase — Full KB article management for admins.
 */
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Pencil, Trash2, Eye, BookOpen, FileText } from "lucide-react";
import { useAdminKBArticles, useCreateKBArticle, useUpdateKBArticle, useDeleteKBArticle, type KBArticle } from "@/hooks/useKnowledgeBase";

const CATEGORIES = [
  { value: "account", label: "Account & Profile" },
  { value: "verification", label: "Verification" },
  { value: "content", label: "Posts & Content" },
  { value: "billing", label: "Billing & Plans" },
  { value: "privacy", label: "Privacy & Security" },
  { value: "community", label: "Community & Guidelines" },
  { value: "general", label: "General" },
];

export function AdminKnowledgeBase() {
  const { data: articles = [], isLoading } = useAdminKBArticles();
  const createArticle = useCreateKBArticle();
  const updateArticle = useUpdateKBArticle();
  const deleteArticle = useDeleteKBArticle();

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingArticle, setEditingArticle] = useState<KBArticle | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filtered = articles.filter((a) => {
    const matchesSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || a.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: articles.length,
    published: articles.filter((a) => a.published).length,
    categories: [...new Set(articles.map((a) => a.category))].length,
    totalViews: articles.reduce((sum, a) => sum + a.view_count, 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<FileText className="h-4 w-4" />} label="Total Articles" value={stats.total} />
        <StatCard icon={<Eye className="h-4 w-4 text-emerald-500" />} label="Published" value={stats.published} />
        <StatCard icon={<BookOpen className="h-4 w-4 text-blue-500" />} label="Categories" value={stats.categories} />
        <StatCard icon={<Eye className="h-4 w-4 text-amber-500" />} label="Total Views" value={stats.totalViews} />
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search articles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Article
        </Button>
      </div>

      {/* Article list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading articles...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No articles found</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((article) => (
                <div key={article.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{article.title}</span>
                      {!article.published && <Badge variant="outline" className="text-[10px]">Draft</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{article.excerpt}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px] px-1.5">{article.category}</Badge>
                      <span>{article.read_time_minutes} min read</span>
                      <span>·</span>
                      <span>{article.view_count} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingArticle(article)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => {
                      if (confirm("Delete this article?")) deleteArticle.mutate(article.id);
                    }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <ArticleDialog
        article={editingArticle}
        open={isCreating || !!editingArticle}
        onClose={() => { setIsCreating(false); setEditingArticle(null); }}
        onSave={(data) => {
          if (editingArticle) {
            updateArticle.mutate({ id: editingArticle.id, ...data }, { onSuccess: () => { setEditingArticle(null); } });
          } else {
            createArticle.mutate(data, { onSuccess: () => { setIsCreating(false); } });
          }
        }}
        isPending={createArticle.isPending || updateArticle.isPending}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <p className="text-xl font-bold font-heading">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ArticleDialog({ article, open, onClose, onSave, isPending }: {
  article: KBArticle | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<KBArticle>) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(article?.title || "");
  const [slug, setSlug] = useState(article?.slug || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [content, setContent] = useState(article?.content || "");
  const [category, setCategory] = useState(article?.category || "general");
  const [published, setPublished] = useState(article?.published ?? true);
  const [readTime, setReadTime] = useState(article?.read_time_minutes || 3);

  // Reset on article change
  const key = article?.id || "new";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{article ? "Edit Article" : "New Article"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2" key={key}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Title</Label>
              <Input defaultValue={article?.title} onChange={(e) => setTitle(e.target.value)} placeholder="Article title" />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input defaultValue={article?.slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-friendly-slug" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select defaultValue={article?.category || "general"} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Excerpt</Label>
            <Input defaultValue={article?.excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Brief summary" maxLength={300} />
          </div>
          <div className="space-y-1.5">
            <Label>Content (Markdown)</Label>
            <Textarea defaultValue={article?.content} onChange={(e) => setContent(e.target.value)} placeholder="Write article content in Markdown..." rows={12} className="font-mono text-sm" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Read time (min)</Label>
                <Input type="number" className="w-16 h-8 text-xs" defaultValue={article?.read_time_minutes || 3} onChange={(e) => setReadTime(parseInt(e.target.value) || 3)} min={1} max={60} />
              </div>
              <div className="flex items-center gap-2">
                <Switch defaultChecked={article?.published ?? true} onCheckedChange={setPublished} />
                <Label className="text-xs">Published</Label>
              </div>
            </div>
            <Button onClick={() => onSave({ title, slug, excerpt, content, category, published, read_time_minutes: readTime })} disabled={!title.trim() || !slug.trim() || isPending}>
              {isPending ? "Saving..." : "Save Article"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
