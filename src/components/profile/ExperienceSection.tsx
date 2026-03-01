import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, Plus, Pencil, Trash2, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

interface Experience {
  id: string;
  title: string;
  company: string;
  company_logo_url: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  employment_type: string;
}

const EMPLOYMENT_TYPES: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  freelance: "Freelance",
  internship: "Internship",
  self_employed: "Self-employed",
};

function ExperienceForm({ experience, onSave, onCancel }: {
  experience?: Experience;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: experience?.title || "",
    company: experience?.company || "",
    location: experience?.location || "",
    start_date: experience?.start_date || "",
    end_date: experience?.end_date || "",
    is_current: experience?.is_current || false,
    description: experience?.description || "",
    employment_type: experience?.employment_type || "full_time",
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Title *</Label>
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Fund Manager" />
        </div>
        <div>
          <Label className="text-xs">Company *</Label>
          <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. HDFC AMC" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Employment Type</Label>
          <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(EMPLOYMENT_TYPES).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Location</Label>
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Mumbai, India" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Start Date *</Label>
          <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
        </div>
        <div>
          <Label className="text-xs">End Date</Label>
          <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} disabled={form.is_current} />
          <div className="flex items-center gap-2 mt-2">
            <Switch checked={form.is_current} onCheckedChange={(v) => setForm({ ...form, is_current: v, end_date: v ? "" : form.end_date })} />
            <span className="text-xs text-muted-foreground">Currently working here</span>
          </div>
        </div>
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your responsibilities and achievements..." rows={3} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.title || !form.company || !form.start_date}>Save</Button>
      </div>
    </div>
  );
}

export function ExperienceSection({ profileId, isOwnProfile }: { profileId: string; isOwnProfile: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Experience | undefined>();
  const queryClient = useQueryClient();

  const { data: experiences = [] } = useQuery({
    queryKey: ["work-experiences", profileId],
    queryFn: async () => {
      const { data } = await supabase
        .from("work_experiences")
        .select("*")
        .eq("user_id", profileId)
        .order("is_current", { ascending: false })
        .order("start_date", { ascending: false });
      return (data || []) as Experience[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (form: any) => {
      if (editing) {
        const { error } = await supabase.from("work_experiences").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("work_experiences").insert({ ...form, user_id: profileId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-experiences", profileId] });
      toast.success(editing ? "Experience updated" : "Experience added");
      setDialogOpen(false);
      setEditing(undefined);
    },
    onError: () => toast.error("Failed to save experience"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("work_experiences").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-experiences", profileId] });
      toast.success("Experience removed");
    },
  });

  if (!experiences.length && !isOwnProfile) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold font-heading text-card-foreground">Experience</h3>
        </div>
        {isOwnProfile && (
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit Experience" : "Add Experience"}</DialogTitle></DialogHeader>
              <ExperienceForm experience={editing} onSave={(d) => saveMutation.mutate(d)} onCancel={() => { setDialogOpen(false); setEditing(undefined); }} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="p-5">
        {experiences.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Add your work experience to build credibility.</p>
        ) : (
          <div className="space-y-4">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className={`flex gap-3 ${idx > 0 ? "pt-4 border-t border-border" : ""}`}>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{exp.title}</p>
                      <p className="text-xs text-muted-foreground">{exp.company} · {EMPLOYMENT_TYPES[exp.employment_type] || exp.employment_type}</p>
                    </div>
                    {isOwnProfile && (
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditing(exp); setDialogOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(exp.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(exp.start_date), "MMM yyyy")} – {exp.is_current ? "Present" : exp.end_date ? format(new Date(exp.end_date), "MMM yyyy") : ""}
                  </p>
                  {exp.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {exp.location}
                    </p>
                  )}
                  {exp.description && (
                    <p className="text-xs text-card-foreground/80 mt-2 leading-relaxed whitespace-pre-line">{exp.description}</p>
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
