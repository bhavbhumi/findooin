import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

interface Publication {
  id: string;
  title: string;
  publication_type: string;
  publisher: string | null;
  published_date: string | null;
  url: string | null;
  description: string;
  co_authors: string[] | null;
  tags: string[];
}

const PUB_TYPES: Record<string, string> = {
  article: "Article",
  research_paper: "Research Paper",
  market_commentary: "Market Commentary",
  whitepaper: "Whitepaper",
  book: "Book",
  report: "Report",
  presentation: "Presentation",
};

function PublicationForm({ publication, onSave, onCancel }: {
  publication?: Publication;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: publication?.title || "",
    publication_type: publication?.publication_type || "article",
    publisher: publication?.publisher || "",
    published_date: publication?.published_date || "",
    url: publication?.url || "",
    description: publication?.description || "",
  });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Title *</Label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Impact of RBI Policy on MF Flows" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Type</Label>
          <Select value={form.publication_type} onValueChange={(v) => setForm({ ...form, publication_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(PUB_TYPES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Publisher</Label>
          <Input value={form.publisher} onChange={(e) => setForm({ ...form, publisher: e.target.value })} placeholder="e.g. Economic Times" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Published Date</Label>
          <Input type="date" value={form.published_date} onChange={(e) => setForm({ ...form, published_date: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">URL</Label>
          <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
        </div>
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief summary..." rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.title}>Save</Button>
      </div>
    </div>
  );
}

export function PublicationsSection({ profileId, isOwnProfile }: { profileId: string; isOwnProfile: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Publication | undefined>();
  const queryClient = useQueryClient();

  const { data: publications = [] } = useQuery({
    queryKey: ["publications", profileId],
    queryFn: async () => {
      const { data } = await supabase
        .from("publications")
        .select("*")
        .eq("user_id", profileId)
        .order("published_date", { ascending: false, nullsFirst: false });
      return (data || []) as Publication[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (form: any) => {
      const clean = { ...form, published_date: form.published_date || null, url: form.url || null, publisher: form.publisher || null };
      if (editing) {
        const { error } = await supabase.from("publications").update(clean).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("publications").insert({ ...clean, user_id: profileId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications", profileId] });
      toast.success(editing ? "Publication updated" : "Publication added");
      setDialogOpen(false);
      setEditing(undefined);
    },
    onError: () => toast.error("Failed to save publication"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("publications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["publications", profileId] });
      toast.success("Publication removed");
    },
  });

  if (!publications.length && !isOwnProfile) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold font-heading text-card-foreground">Publications & Research</h3>
        </div>
        {isOwnProfile && (
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit Publication" : "Add Publication"}</DialogTitle></DialogHeader>
              <PublicationForm publication={editing} onSave={(d) => saveMutation.mutate(d)} onCancel={() => { setDialogOpen(false); setEditing(undefined); }} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="p-5">
        {publications.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Add your research papers, articles, and market commentaries.</p>
        ) : (
          <div className="space-y-4">
            {publications.map((pub, idx) => (
              <div key={pub.id} className={`${idx > 0 ? "pt-4 border-t border-border" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-card-foreground">{pub.title}</p>
                      {pub.url && (
                        <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 shrink-0">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <Badge variant="secondary" className="text-[10px] mr-1.5">{PUB_TYPES[pub.publication_type] || pub.publication_type}</Badge>
                      {pub.publisher && <span>{pub.publisher}</span>}
                      {pub.published_date && <span> · {format(new Date(pub.published_date), "MMM yyyy")}</span>}
                    </p>
                    {pub.description && <p className="text-xs text-card-foreground/80 mt-1.5 leading-relaxed">{pub.description}</p>}
                  </div>
                  {isOwnProfile && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditing(pub); setDialogOpen(true); }}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(pub.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
