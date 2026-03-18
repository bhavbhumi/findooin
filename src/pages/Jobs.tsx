import { useState, memo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Briefcase, Sparkles, FolderOpen } from "lucide-react";
import { useJobs, useSavedJobs, useToggleSaveJob, useMyApplications } from "@/hooks/useJobs";
import { useRole } from "@/contexts/RoleContext";
import { JobCard, CATEGORY_LABELS } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/skeletons/JobCardSkeleton";
import { JobDetailSheet } from "@/components/jobs/JobDetailSheet";
import { PostJobDialog } from "@/components/jobs/PostJobDialog";
import { EmployerDashboard } from "@/components/jobs/EmployerDashboard";
import { CandidateDashboard } from "@/components/jobs/CandidateDashboard";
import { JobsSidebar } from "@/components/jobs/JobsSidebar";
import AppLayout from "@/components/AppLayout";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyJobsIllustration } from "@/components/illustrations/EmptyStateIllustrations";
import type { Job } from "@/hooks/useJobs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MemoizedJobsSidebar = memo(JobsSidebar);

const Jobs = () => {
  usePageMeta({ title: "BFSI Jobs", description: "India's only BFSI-focused job board — find or post finance, compliance, and advisory roles.", path: "/jobs" });
  const { activeRole, userId } = useRole();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showPostJob, setShowPostJob] = useState(false);

  const { data: jobs, isLoading } = useJobs({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    type: jobType !== "all" ? jobType : undefined,
  });
  const { data: savedJobIds } = useSavedJobs();
  const { data: myApps } = useMyApplications();
  const toggleSave = useToggleSaveJob();

  const { data: userProfile } = useQuery({
    queryKey: ["profile-type", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_type, certifications, specializations, experience_years, location").eq("id", userId!).maybeSingle();
      return data;
    },
  });
  const isEntity = userProfile?.user_type === "entity";
  const isIndividual = !isEntity;

  const appliedJobIds = new Set(myApps?.map((a) => a.job_id) || []);
  const canPostJobs = activeRole === "issuer" || activeRole === "intermediary" || activeRole === "admin";
  const showCandidateView = isIndividual || activeRole === "investor";

  // Suggested jobs: match by skills/certs/location
  const suggestedJobs = (() => {
    if (!jobs || !userProfile) return [];
    const userSkills = new Set([
      ...(userProfile.certifications || []),
      ...(userProfile.specializations || []),
    ].map((s: string) => s.toLowerCase()));

    if (userSkills.size === 0 && !userProfile.location) return [];

    return jobs
      .map((job) => {
        let score = 0;
        const jobSkills = [...(job.skills_required || []), ...(job.certifications_preferred || [])].map((s) => s.toLowerCase());
        if (jobSkills.length > 0 && userSkills.size > 0) {
          const matched = jobSkills.filter((s) => userSkills.has(s)).length;
          score += Math.round((matched / jobSkills.length) * 50);
        }
        if (job.experience_min != null || job.experience_max != null) {
          const exp = userProfile.experience_years || 0;
          if (exp >= (job.experience_min || 0) && exp <= (job.experience_max || 99)) score += 30;
          else if (exp >= (job.experience_min || 0) - 2) score += 15;
        }
        if (job.location && userProfile.location) {
          if (job.location.toLowerCase().includes(userProfile.location.toLowerCase()) || job.is_remote) score += 20;
        }
        return { job, score };
      })
      .filter((j) => j.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((j) => j.job);
  })();

  const handleCategoryClick = (cat: string) => setCategory(cat);
  const handleLocationClick = (loc: string) => setSearch(loc);

  return (
    <AppLayout maxWidth="max-w-6xl">
      <MobileFilterDrawer title="Jobs Filters & Insights">
        <JobsSidebar onCategoryClick={handleCategoryClick} onLocationClick={handleLocationClick} />
      </MobileFilterDrawer>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">BFSI Job Board</h1>
              <p className="text-sm text-muted-foreground">Find opportunities in India's financial services sector</p>
            </div>
            {canPostJobs && (
              <Button onClick={() => setShowPostJob(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Post Job
              </Button>
            )}
          </div>

          <Tabs defaultValue="browse" className="space-y-4">
            <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
              <TabsList className="inline-flex w-max sm:w-auto bg-muted/50">
                <TabsTrigger value="browse" className="gap-1.5 whitespace-nowrap">
                  <Briefcase className="h-3.5 w-3.5" /> Browse
                </TabsTrigger>
                {showCandidateView && (
                  <TabsTrigger value="suggested" className="gap-1.5 whitespace-nowrap">
                    <Sparkles className="h-3.5 w-3.5" /> Suggested
                  </TabsTrigger>
                )}
                <TabsTrigger value="my-jobs" className="gap-1.5 whitespace-nowrap">
                  <FolderOpen className="h-3.5 w-3.5" /> My Jobs
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ─── Browse Tab ─── */}
            <TabsContent value="browse" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search jobs, companies..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full_time">Full-Time</SelectItem>
                      <SelectItem value="part_time">Part-Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => <JobCardSkeleton key={i} />)}
                </div>
              ) : !jobs?.length ? (
                <EmptyState
                  illustration={<EmptyJobsIllustration />}
                  icon={Briefcase}
                  title="No jobs match your search"
                  description="Try adjusting your filters or check back later. New BFSI roles are posted daily by verified employers."
                  actionLabel={canPostJobs ? "Post a Job" : undefined}
                  onAction={canPostJobs ? () => setShowPostJob(true) : undefined}
                />
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds?.includes(job.id)}
                      onToggleSave={() => toggleSave.mutate({ jobId: job.id, saved: savedJobIds?.includes(job.id) || false })}
                      onClick={() => setSelectedJob(job)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── Suggested Tab ─── */}
            {showCandidateView && (
              <TabsContent value="suggested" className="space-y-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <JobCardSkeleton key={i} />)}
                  </div>
                ) : suggestedJobs.length === 0 ? (
                  <EmptyState
                    illustration={<EmptyJobsIllustration />}
                    icon={Sparkles}
                    title="No suggested jobs yet"
                    description="Complete your profile with skills, certifications, and location to get personalized job matches."
                  />
                ) : (
                  <div className="space-y-3">
                    {suggestedJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds?.includes(job.id)}
                        onToggleSave={() => toggleSave.mutate({ jobId: job.id, saved: savedJobIds?.includes(job.id) || false })}
                        onClick={() => setSelectedJob(job)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            {/* ─── My Jobs Tab ─── */}
            <TabsContent value="my-jobs" className="space-y-6">
              {/* Employer view: posted jobs + applicants */}
              {canPostJobs && (
                <div>
                  <h3 className="font-heading font-semibold text-sm mb-3 text-foreground">Posted Jobs & Applicants</h3>
                  <EmployerDashboard />
                </div>
              )}

              {/* Candidate view: applications + dashboard */}
              {showCandidateView && (
                <div>
                  {canPostJobs && <div className="border-t border-border my-4" />}
                  <CandidateDashboard onSelectJob={setSelectedJob} />
                </div>
              )}

              {/* Fallback for users who are neither */}
              {!canPostJobs && !showCandidateView && (
                <EmptyState
                  icon={FolderOpen}
                  title="No activity yet"
                  description="Browse jobs or post a listing to see your activity here."
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <MemoizedJobsSidebar onCategoryClick={handleCategoryClick} onLocationClick={handleLocationClick} />
          </div>
        </aside>
      </div>

      <JobDetailSheet
        job={selectedJob}
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobIds?.includes(selectedJob.id) : false}
        onToggleSave={() => selectedJob && toggleSave.mutate({ jobId: selectedJob.id, saved: savedJobIds?.includes(selectedJob.id) || false })}
        hasApplied={selectedJob ? appliedJobIds.has(selectedJob.id) : false}
      />

      <PostJobDialog open={showPostJob} onClose={() => setShowPostJob(false)} />
    </AppLayout>
  );
};

export default Jobs;
