import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ReportDialog } from "@/components/feed/ReportDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { MapPin, Clock, Briefcase, IndianRupee, BadgeCheck, Upload, Send, Bookmark, BookmarkCheck, Building2, Flag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRole } from "@/contexts/RoleContext";
import { useApplyToJob } from "@/hooks/useJobs";
import { supabase } from "@/integrations/supabase/client";
import { JOB_TYPE_LABELS, CATEGORY_LABELS } from "./JobCard";
import type { Job } from "@/hooks/useJobs";
import { useQuery } from "@tanstack/react-query";

interface Props {
  job: Job | null;
  open: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  hasApplied?: boolean;
}

export function JobDetailSheet({ job, open, onClose, isSaved, onToggleSave, hasApplied }: Props) {
  const { userId } = useRole();
  const applyMutation = useApplyToJob();
  const [coverNote, setCoverNote] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);

  // Check if user is an entity (entities cannot apply)
  const { data: userProfile } = useQuery({
    queryKey: ["profile-type", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_type").eq("id", userId!).single();
      return data;
    },
  });
  const isEntity = userProfile?.user_type === "entity";

  if (!job) return null;

  const isVerified = job.poster_profile?.verification_status === "verified";
  const isOwnJob = userId === job.poster_id;

  const formatSalary = () => {
    if (!job.salary_min && !job.salary_max) return null;
    const fmt = (n: number) => {
      if (n >= 100000) return `${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L`;
      if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
      return n.toString();
    };
    if (job.salary_min && job.salary_max) return `₹${fmt(job.salary_min)} – ₹${fmt(job.salary_max)}`;
    if (job.salary_min) return `₹${fmt(job.salary_min)}+`;
    return `Up to ₹${fmt(job.salary_max!)}`;
  };

  const handleApply = async () => {
    if (!userId) return;
    setUploading(true);
    let resume_url: string | undefined;
    let resume_name: string | undefined;

    if (resumeFile) {
      const filePath = `${userId}/${Date.now()}-${resumeFile.name}`;
      const { error } = await supabase.storage.from("resumes").upload(filePath, resumeFile);
      if (error) {
        setUploading(false);
        return;
      }
      resume_url = filePath;
      resume_name = resumeFile.name;
    }

    await applyMutation.mutateAsync({
      job_id: job.id,
      applicant_id: userId,
      cover_note: coverNote,
      resume_url,
      resume_name,
    });

    setCoverNote("");
    setResumeFile(null);
    setShowApplyForm(false);
    setUploading(false);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle className="font-heading text-lg">{job.title}</SheetTitle>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground/80">{job.company_name}</span>
                {isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
              </div>
            </div>
            {onToggleSave && (
              <Button variant="ghost" size="icon" className="shrink-0" onClick={onToggleSave}>
                {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Meta */}
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary">{CATEGORY_LABELS[job.job_category] || job.job_category}</Badge>
            <Badge variant="outline">{JOB_TYPE_LABELS[job.job_type] || job.job_type}</Badge>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}{job.is_remote && " (Remote)"}</span>
            {(job.experience_min != null || job.experience_max != null) && (
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.experience_min || 0}–{job.experience_max || "10+"}y exp</span>
            )}
            {formatSalary() && (
              <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{formatSalary()}</span>
            )}
          </div>

          <span className="text-[10px] text-muted-foreground">
            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })} · {job.application_count} applications
          </span>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-2">Description</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Skills */}
          {job.skills_required.length > 0 && (
            <div>
              <h4 className="font-heading font-semibold text-sm mb-2">Skills Required</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills_required.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Qualifications */}
          {job.qualifications.length > 0 && (
            <div>
              <h4 className="font-heading font-semibold text-sm mb-2">Qualifications</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                {job.qualifications.map((q) => <li key={q}>{q}</li>)}
              </ul>
            </div>
          )}

          {/* Certifications */}
          {job.certifications_preferred.length > 0 && (
            <div>
              <h4 className="font-heading font-semibold text-sm mb-2">Preferred Certifications</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.certifications_preferred.map((c) => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Apply section */}
          {!isOwnJob && userId && (
            <div>
              {isEntity ? (
                <div className="text-center py-3 text-sm text-muted-foreground border border-border rounded-lg bg-muted/30">
                  <Building2 className="h-4 w-4 mx-auto mb-1.5 opacity-50" />
                  Entity accounts can browse but not apply for jobs
                </div>
              ) : hasApplied ? (
                <div className="text-center py-3 text-sm text-muted-foreground border border-border rounded-lg bg-muted/30">
                  ✓ You've already applied to this position
                </div>
              ) : showApplyForm ? (
                <div className="space-y-3 border border-border rounded-lg p-4 bg-card">
                  <h4 className="font-heading font-semibold text-sm">Apply for this position</h4>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Cover Note</label>
                    <Textarea
                      placeholder="Tell the employer why you're a great fit..."
                      value={coverNote}
                      onChange={(e) => setCoverNote(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Resume (PDF, optional)</label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    />
                    {resumeFile && <span className="text-xs text-muted-foreground mt-1 block">{resumeFile.name}</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleApply} disabled={uploading || applyMutation.isPending} className="flex-1">
                      <Send className="h-4 w-4 mr-1.5" />
                      {uploading ? "Uploading..." : "Submit Application"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowApplyForm(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button className="w-full" onClick={() => setShowApplyForm(true)}>
                  <Briefcase className="h-4 w-4 mr-1.5" />
                  Apply Now
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
