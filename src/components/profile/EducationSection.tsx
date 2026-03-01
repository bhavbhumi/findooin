import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface Education {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string | null;
  start_year: number;
  end_year: number | null;
  is_current: boolean;
  grade: string | null;
  description: string;
  activities: string | null;
}

function EducationForm({ education, onSave, onCancel }: {
  education?: Education;
  onSave: (data: any) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    institution: education?.institution || "",
    degree: education?.degree || "",
    field_of_study: education?.field_of_study || "",
    start_year: education?.start_year || new Date().getFullYear(),
    end_year: education?.end_year || null as number | null,
    is_current: education?.is_current || false,
    grade: education?.grade || "",
    description: education?.description || "",
    activities: education?.activities || "",
  });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-xs">Institution *</Label>
        <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="e.g. IIM Ahmedabad" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Degree *</Label>
          <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} placeholder="e.g. MBA, CFA, B.Com" />
        </div>
        <div>
          <Label className="text-xs">Field of Study</Label>
          <Input value={form.field_of_study} onChange={(e) => setForm({ ...form, field_of_study: e.target.value })} placeholder="e.g. Finance, Economics" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Start Year *</Label>
          <Input type="number" value={form.start_year} onChange={(e) => setForm({ ...form, start_year: parseInt(e.target.value) })} />
        </div>
        <div>
          <Label className="text-xs">End Year</Label>
          <Input type="number" value={form.end_year ?? ""} onChange={(e) => setForm({ ...form, end_year: e.target.value ? parseInt(e.target.value) : null })} disabled={form.is_current} />
          <div className="flex items-center gap-2 mt-2">
            <Switch checked={form.is_current} onCheckedChange={(v) => setForm({ ...form, is_current: v, end_year: v ? null : form.end_year })} />
            <span className="text-xs text-muted-foreground">Currently studying</span>
          </div>
        </div>
      </div>
      <div>
        <Label className="text-xs">Grade / CGPA</Label>
        <Input value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} placeholder="e.g. 8.5 CGPA, First Class" />
      </div>
      <div>
        <Label className="text-xs">Description</Label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Activities, achievements..." rows={2} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.institution || !form.degree}>Save</Button>
      </div>
    </div>
  );
}

export function EducationSection({ profileId, isOwnProfile }: { profileId: string; isOwnProfile: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Education | undefined>();
  const queryClient = useQueryClient();

  const { data: educations = [] } = useQuery({
    queryKey: ["education", profileId],
    queryFn: async () => {
      const { data } = await supabase
        .from("education")
        .select("*")
        .eq("user_id", profileId)
        .order("is_current", { ascending: false })
        .order("start_year", { ascending: false });
      return (data || []) as Education[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (form: any) => {
      if (editing) {
        const { error } = await supabase.from("education").update(form).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("education").insert({ ...form, user_id: profileId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education", profileId] });
      toast.success(editing ? "Education updated" : "Education added");
      setDialogOpen(false);
      setEditing(undefined);
    },
    onError: () => toast.error("Failed to save education"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("education").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education", profileId] });
      toast.success("Education removed");
    },
  });

  if (!educations.length && !isOwnProfile) return null;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold font-heading text-card-foreground">Education</h3>
        </div>
        {isOwnProfile && (
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(undefined); }}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7"><Plus className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>{editing ? "Edit Education" : "Add Education"}</DialogTitle></DialogHeader>
              <EducationForm education={editing} onSave={(d) => saveMutation.mutate(d)} onCancel={() => { setDialogOpen(false); setEditing(undefined); }} />
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="p-5">
        {educations.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Add your education to showcase your qualifications.</p>
        ) : (
          <div className="space-y-4">
            {educations.map((edu, idx) => (
              <div key={edu.id} className={`flex gap-3 ${idx > 0 ? "pt-4 border-t border-border" : ""}`}>
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <GraduationCap className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-card-foreground">{edu.institution}</p>
                      <p className="text-xs text-muted-foreground">
                        {edu.degree}{edu.field_of_study ? ` · ${edu.field_of_study}` : ""}
                      </p>
                    </div>
                    {isOwnProfile && (
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditing(edu); setDialogOpen(true); }}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMutation.mutate(edu.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {edu.start_year} – {edu.is_current ? "Present" : edu.end_year || ""}
                  </p>
                  {edu.grade && <p className="text-xs text-muted-foreground mt-0.5">Grade: {edu.grade}</p>}
                  {edu.description && <p className="text-xs text-card-foreground/80 mt-2 leading-relaxed">{edu.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
