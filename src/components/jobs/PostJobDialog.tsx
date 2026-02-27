import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { useCreateJob } from "@/hooks/useJobs";
import { CATEGORY_LABELS } from "./JobCard";

const JOB_TYPES = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function PostJobDialog({ open, onClose }: Props) {
  const { userId } = useRole();
  const createJob = useCreateJob();

  const [form, setForm] = useState({
    title: "",
    company_name: "",
    location: "",
    is_remote: false,
    job_category: "other",
    job_type: "full_time",
    experience_min: "",
    experience_max: "",
    salary_min: "",
    salary_max: "",
    description: "",
  });

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [qualInput, setQualInput] = useState("");

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const addQual = () => {
    if (qualInput.trim() && !qualifications.includes(qualInput.trim())) {
      setQualifications([...qualifications, qualInput.trim()]);
      setQualInput("");
    }
  };

  const handleSubmit = async () => {
    if (!userId || !form.title || !form.company_name) return;
    await createJob.mutateAsync({
      poster_id: userId,
      title: form.title,
      company_name: form.company_name,
      location: form.location,
      is_remote: form.is_remote,
      job_category: form.job_category,
      job_type: form.job_type,
      experience_min: form.experience_min ? parseInt(form.experience_min) : null,
      experience_max: form.experience_max ? parseInt(form.experience_max) : null,
      salary_min: form.salary_min ? parseFloat(form.salary_min) : null,
      salary_max: form.salary_max ? parseFloat(form.salary_max) : null,
      description: form.description,
      skills_required: skills,
      qualifications,
    } as any);
    onClose();
    // Reset
    setForm({ title: "", company_name: "", location: "", is_remote: false, job_category: "other", job_type: "full_time", experience_min: "", experience_max: "", salary_min: "", salary_max: "", description: "" });
    setSkills([]);
    setQualifications([]);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Post a Job</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Title *</label>
              <Input placeholder="e.g. Senior Fund Manager" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Name *</label>
              <Input placeholder="e.g. HDFC AMC" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
              <Input placeholder="e.g. Mumbai, Maharashtra" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_remote} onCheckedChange={(v) => setForm({ ...form, is_remote: v })} />
                <span className="text-sm">Remote</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <Select value={form.job_category} onValueChange={(v) => setForm({ ...form, job_category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Job Type</label>
              <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOB_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Exp (yrs)</label>
              <Input type="number" placeholder="0" value={form.experience_min} onChange={(e) => setForm({ ...form, experience_min: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Exp (yrs)</label>
              <Input type="number" placeholder="10" value={form.experience_max} onChange={(e) => setForm({ ...form, experience_max: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Min Salary (₹)</label>
              <Input type="number" placeholder="500000" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Max Salary (₹)</label>
              <Input type="number" placeholder="2000000" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <Textarea placeholder="Describe the role, responsibilities, and requirements..." rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Skills */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Skills Required</label>
            <div className="flex gap-2">
              <Input placeholder="Add a skill" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} />
              <Button type="button" variant="outline" size="icon" onClick={addSkill}><Plus className="h-4 w-4" /></Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="gap-1">
                    {s}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSkills(skills.filter((x) => x !== s))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Qualifications */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Qualifications</label>
            <div className="flex gap-2">
              <Input placeholder="e.g. MBA Finance, CA, CFA" value={qualInput} onChange={(e) => setQualInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addQual())} />
              <Button type="button" variant="outline" size="icon" onClick={addQual}><Plus className="h-4 w-4" /></Button>
            </div>
            {qualifications.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {qualifications.map((q) => (
                  <Badge key={q} variant="secondary" className="gap-1">
                    {q}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setQualifications(qualifications.filter((x) => x !== q))} />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button className="w-full" onClick={handleSubmit} disabled={!form.title || !form.company_name || createJob.isPending}>
            {createJob.isPending ? "Posting..." : "Post Job"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
