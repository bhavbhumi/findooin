import { useState } from "react";
import { useMyPostedJobs, useJobApplications, useUpdateJob, useUpdateApplicationStatus, type Job } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Eye, Users, Pause, Play, X, BadgeCheck, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const STATUS_LABELS: Record<string, string> = {
  submitted: "New",
  viewed: "Viewed",
  shortlisted: "Shortlisted",
  interviewing: "Interviewing",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

export function EmployerDashboard() {
  const { data: jobs, isLoading } = useMyPostedJobs();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const updateJob = useUpdateJob();

  if (isLoading) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20" />)}</div>;

  if (!jobs?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No jobs posted yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job listings */}
      {jobs.map((job) => (
        <Card key={job.id} className={`border-border cursor-pointer transition-all ${selectedJobId === job.id ? "ring-1 ring-primary" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1" onClick={() => setSelectedJobId(selectedJobId === job.id ? null : job.id)}>
                <h4 className="font-heading font-semibold text-sm">{job.title}</h4>
                <p className="text-xs text-muted-foreground">{job.company_name}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job.application_count} applicants</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.view_count} views</span>
                  <Badge variant={job.status === "active" ? "default" : "secondary"} className="text-[10px]">
                    {job.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {job.status === "active" ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateJob.mutate({ id: job.id, status: "paused" } as any)}>
                    <Pause className="h-3.5 w-3.5" />
                  </Button>
                ) : job.status === "paused" ? (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => updateJob.mutate({ id: job.id, status: "active" } as any)}>
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                ) : null}
                {(job.status === "active" || job.status === "paused") && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => updateJob.mutate({ id: job.id, status: "closed" } as any)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Applicants panel */}
            {selectedJobId === job.id && (
              <div className="mt-4 pt-4 border-t border-border">
                <ApplicantsList jobId={job.id} />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ApplicantsList({ jobId }: { jobId: string }) {
  const { data: applications, isLoading } = useJobApplications(jobId);
  const updateStatus = useUpdateApplicationStatus();

  if (isLoading) return <Skeleton className="h-16" />;
  if (!applications?.length) return <p className="text-xs text-muted-foreground text-center py-4">No applications yet</p>;

  const handleDownloadResume = async (resumeUrl: string, resumeName: string) => {
    const { data } = await supabase.storage.from("resumes").createSignedUrl(resumeUrl, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-3">
      {applications.map((app) => {
        const profile = app.applicant_profile;
        return (
          <div key={app.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <Avatar className="h-9 w-9">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{(profile?.full_name || "?")[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium truncate">{profile?.display_name || profile?.full_name}</span>
                {profile?.verification_status === "verified" && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
              </div>
              {profile?.headline && <p className="text-[10px] text-muted-foreground truncate">{profile.headline}</p>}
              {app.cover_note && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{app.cover_note}</p>}
              <div className="flex items-center gap-2 mt-2">
                {app.resume_url && app.resume_name && (
                  <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1" onClick={() => handleDownloadResume(app.resume_url!, app.resume_name!)}>
                    <FileText className="h-3 w-3" />Resume
                  </Button>
                )}
                <Select value={app.status} onValueChange={(v) => updateStatus.mutate({ id: app.id, status: v })}>
                  <SelectTrigger className="h-6 text-[10px] w-auto min-w-[100px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
            </span>
          </div>
        );
      })}
    </div>
  );
}
