import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { useMyApplications, useSavedJobs, useJobs, useToggleSaveJob, type Job } from "@/hooks/useJobs";
import { MyApplicationsPanel } from "./MyApplicationsPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase, Bookmark, TrendingUp, CheckCircle2, Eye, Clock,
  Send, Users, Award, Globe, FileText, ShieldCheck, Star
} from "lucide-react";
import { JobCard } from "./JobCard";
import type { JobApplication } from "@/hooks/useJobs";

// ─── Pipeline Tracker ───────────────────────────────────────────
const PIPELINE_STAGES = [
  { key: "submitted", label: "Applied", icon: Send, color: "bg-muted" },
  { key: "viewed", label: "Viewed", icon: Eye, color: "bg-blue-500/20" },
  { key: "shortlisted", label: "Shortlisted", icon: Star, color: "bg-amber-500/20" },
  { key: "interviewing", label: "Interviewing", icon: Users, color: "bg-purple-500/20" },
  { key: "offered", label: "Offered", icon: Award, color: "bg-green-500/20" },
  { key: "hired", label: "Hired", icon: CheckCircle2, color: "bg-green-600/20" },
];

function ApplicationPipeline({ applications }: { applications: JobApplication[] }) {
  const stageCounts: Record<string, number> = {};
  PIPELINE_STAGES.forEach((s) => (stageCounts[s.key] = 0));
  applications.forEach((a) => {
    if (stageCounts[a.status] !== undefined) stageCounts[a.status]++;
  });
  const total = applications.filter((a) => a.status !== "withdrawn" && a.status !== "rejected").length;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-heading flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Application Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PIPELINE_STAGES.map((stage) => {
            const Icon = stage.icon;
            const count = stageCounts[stage.key];
            return (
              <div
                key={stage.key}
                className={`rounded-lg p-3 text-center ${stage.color} transition-all`}
              >
                <Icon className="h-4 w-4 mx-auto mb-1 text-foreground/70" />
                <p className="text-lg font-heading font-bold text-foreground">{count}</p>
                <p className="text-[10px] text-muted-foreground">{stage.label}</p>
              </div>
            );
          })}
        </div>
        {applications.length > 0 && (
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>{total} active</span>
            <span>·</span>
            <span>{applications.filter((a) => a.status === "rejected").length} rejected</span>
            <span>·</span>
            <span>{applications.filter((a) => a.status === "withdrawn").length} withdrawn</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Profile Strength Meter ─────────────────────────────────────
function ProfileStrengthMeter({ userId }: { userId: string }) {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-strength", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, display_name, avatar_url, banner_url, bio, headline, location, organization, designation, certifications, specializations, languages, experience_years, website, social_links")
        .eq("id", userId)
        .single();
      return data;
    },
  });

  if (isLoading) return <Skeleton className="h-32" />;
  if (!profile) return null;

  const checks = [
    { label: "Profile photo", done: !!profile.avatar_url, weight: 15 },
    { label: "Banner image", done: !!profile.banner_url, weight: 5 },
    { label: "Headline", done: !!profile.headline && profile.headline.length > 5, weight: 15 },
    { label: "Bio / About", done: !!profile.bio && profile.bio.length > 20, weight: 15 },
    { label: "Location", done: !!profile.location, weight: 10 },
    { label: "Organization", done: !!profile.organization, weight: 10 },
    { label: "Designation", done: !!profile.designation, weight: 5 },
    { label: "Certifications", done: (profile.certifications?.length || 0) > 0, weight: 10 },
    { label: "Experience years", done: profile.experience_years != null && profile.experience_years > 0, weight: 5 },
    { label: "Website / Social", done: !!profile.website || (typeof profile.social_links === "object" && Object.values(profile.social_links as any).some(Boolean)), weight: 10 },
  ];

  const score = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);
  const missing = checks.filter((c) => !c.done);

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-heading flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Profile Strength
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <Progress value={score} className="flex-1 h-2" />
          <span className="text-sm font-heading font-bold text-foreground">{score}%</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {score >= 90 ? "Excellent! Your profile is optimized for recruiters." :
           score >= 70 ? "Good profile! A few more steps to stand out." :
           score >= 50 ? "Getting there — complete more sections to attract employers." :
           "Complete your profile to improve your job match visibility."}
        </p>
        {missing.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {missing.slice(0, 4).map((m) => (
              <Badge key={m.label} variant="outline" className="text-[10px] gap-1">
                + {m.label}
              </Badge>
            ))}
            {missing.length > 4 && (
              <Badge variant="outline" className="text-[10px]">+{missing.length - 4} more</Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Job Match Score ────────────────────────────────────────────
function JobMatchScores({ userId }: { userId: string }) {
  const { data: profile } = useQuery({
    queryKey: ["profile-skills", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("certifications, specializations, experience_years, location")
        .eq("id", userId)
        .single();
      return data;
    },
  });

  const { data: jobs } = useJobs();

  if (!profile || !jobs?.length) return null;

  const userSkills = new Set([
    ...(profile.certifications || []),
    ...(profile.specializations || []),
  ].map((s: string) => s.toLowerCase()));

  const scored = jobs
    .map((job) => {
      let score = 0;
      let maxScore = 0;

      // Skill match
      const jobSkills = [...job.skills_required, ...job.certifications_preferred].map((s) => s.toLowerCase());
      if (jobSkills.length > 0) {
        maxScore += 50;
        const matched = jobSkills.filter((s) => userSkills.has(s)).length;
        score += Math.round((matched / jobSkills.length) * 50);
      }

      // Experience match
      if (job.experience_min != null || job.experience_max != null) {
        maxScore += 30;
        const exp = profile.experience_years || 0;
        if (exp >= (job.experience_min || 0) && exp <= (job.experience_max || 99)) score += 30;
        else if (exp >= (job.experience_min || 0) - 2) score += 15;
      }

      // Location match
      if (job.location && profile.location) {
        maxScore += 20;
        if (job.location.toLowerCase().includes(profile.location.toLowerCase()) || job.is_remote) score += 20;
      }

      const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      return { job, score: pct };
    })
    .filter((j) => j.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (!scored.length) return null;

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-heading flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          Top Matches For You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scored.map(({ job, score }) => (
          <div key={job.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{job.title}</p>
              <p className="text-[10px] text-muted-foreground">{job.company_name} · {job.location}</p>
            </div>
            <Badge variant={score >= 70 ? "default" : "secondary"} className="shrink-0 text-xs">
              {score}% match
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Application Analytics ──────────────────────────────────────
function ApplicationAnalytics({ applications }: { applications: JobApplication[] }) {
  if (applications.length < 2) return null;

  const total = applications.length;
  const viewed = applications.filter((a) => a.status !== "submitted").length;
  const responseRate = total > 0 ? Math.round((viewed / total) * 100) : 0;

  const shortlisted = applications.filter((a) => ["shortlisted", "interviewing", "offered", "hired"].includes(a.status)).length;
  const conversionRate = total > 0 ? Math.round((shortlisted / total) * 100) : 0;

  // Average days to first response
  const responseTimes = applications
    .filter((a) => a.status !== "submitted" && a.updated_at !== a.created_at)
    .map((a) => (new Date(a.updated_at).getTime() - new Date(a.created_at).getTime()) / 86400000);
  const avgResponseDays = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : null;

  // Category breakdown
  const categories: Record<string, number> = {};
  applications.forEach((a) => {
    const cat = a.job?.job_category || "other";
    categories[cat] = (categories[cat] || 0) + 1;
  });
  const topCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0];

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-heading flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Application Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xl font-heading font-bold text-foreground">{responseRate}%</p>
            <p className="text-[10px] text-muted-foreground">Response Rate</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xl font-heading font-bold text-foreground">{conversionRate}%</p>
            <p className="text-[10px] text-muted-foreground">Shortlist Rate</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xl font-heading font-bold text-foreground">{avgResponseDays != null ? `${avgResponseDays}d` : "—"}</p>
            <p className="text-[10px] text-muted-foreground">Avg Response</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <p className="text-xl font-heading font-bold text-foreground">{total}</p>
            <p className="text-[10px] text-muted-foreground">Total Applied</p>
          </div>
        </div>
        {topCategory && (
          <p className="text-xs text-muted-foreground mt-3">
            Most applied category: <span className="font-medium text-foreground">{topCategory[0].replace(/_/g, " ")}</span> ({topCategory[1]} apps)
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Saved Jobs View ────────────────────────────────────────────
function SavedJobsView({ onSelectJob }: { onSelectJob: (job: Job) => void }) {
  const { data: savedJobIds } = useSavedJobs();
  const { data: allJobs } = useJobs();
  const toggleSave = useToggleSaveJob();

  const savedJobs = allJobs?.filter((j) => savedJobIds?.includes(j.id)) || [];

  if (!savedJobs.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No saved jobs</p>
        <p className="text-xs mt-1">Bookmark jobs while browsing to save them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedJobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSaved={true}
          onToggleSave={() => toggleSave.mutate({ jobId: job.id, saved: true })}
          onClick={() => onSelectJob(job)}
        />
      ))}
    </div>
  );
}

// ─── Main Candidate Dashboard ───────────────────────────────────
export function CandidateDashboard({ onSelectJob }: { onSelectJob: (job: Job) => void }) {
  const { userId } = useRole();
  const { data: applications, isLoading } = useMyApplications();

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>;
  }

  if (!userId) return null;

  return (
    <div className="space-y-4">
      {/* Row 1: Pipeline + Profile Strength */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ApplicationPipeline applications={applications || []} />
        <ProfileStrengthMeter userId={userId} />
      </div>

      {/* Row 2: Analytics */}
      <ApplicationAnalytics applications={applications || []} />

      {/* Row 3: Job Match Scores */}
      <JobMatchScores userId={userId} />

      {/* Row 4: Saved Jobs */}
      <div>
        <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
          <Bookmark className="h-4 w-4" /> Saved Jobs
        </h3>
        <SavedJobsView onSelectJob={onSelectJob} />
      </div>

      {/* Row 5: Application List */}
      {(applications?.length || 0) > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Recent Applications
          </h3>
          <MyApplicationsPanel />
        </div>
      )}
    </div>
  );
}

export default CandidateDashboard;
