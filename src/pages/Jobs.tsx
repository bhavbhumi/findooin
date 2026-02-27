import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Briefcase, Building2, LayoutDashboard } from "lucide-react";
import { useJobs, useSavedJobs, useToggleSaveJob, useMyApplications } from "@/hooks/useJobs";
import { useRole } from "@/contexts/RoleContext";
import { JobCard, CATEGORY_LABELS } from "@/components/jobs/JobCard";
import { JobDetailSheet } from "@/components/jobs/JobDetailSheet";
import { PostJobDialog } from "@/components/jobs/PostJobDialog";
import { EmployerDashboard } from "@/components/jobs/EmployerDashboard";
import { CandidateDashboard } from "@/components/jobs/CandidateDashboard";
import { JobsSidebar } from "@/components/jobs/JobsSidebar";
import AppLayout from "@/components/AppLayout";
import type { Job } from "@/hooks/useJobs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Jobs = () => {
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
      const { data } = await supabase.from("profiles").select("user_type").eq("id", userId!).maybeSingle();
      return data;
    },
  });
  const isEntity = userProfile?.user_type === "entity";
  const isIndividual = !isEntity;

  const appliedJobIds = new Set(myApps?.map((a) => a.job_id) || []);
  const canPostJobs = activeRole === "issuer" || activeRole === "intermediary";

  const handleCategoryClick = (cat: string) => setCategory(cat);
  const handleLocationClick = (loc: string) => setSearch(loc);

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Column */}
        <div className="min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">BFSI Job Board</h1>
              <p className="text-sm text-muted-foreground">Find opportunities in India's financial services sector</p>
            </div>
            {canPostJobs && (
              <Button onClick={() => setShowPostJob(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Post Job
              </Button>
            )}
          </div>

          <Tabs defaultValue="browse" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="browse" className="gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Browse Jobs
              </TabsTrigger>
              {isIndividual && (
                <TabsTrigger value="dashboard" className="gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  My Dashboard
                </TabsTrigger>
              )}
              {canPostJobs && (
                <TabsTrigger value="employer" className="gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  Employer Dashboard
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search jobs, companies..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
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

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-lg bg-muted/30 animate-pulse" />)}
                </div>
              ) : !jobs?.length ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="font-heading font-semibold">No jobs found</p>
                  <p className="text-sm mt-1">Try adjusting your filters or check back later</p>
                </div>
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

            {isIndividual && (
              <TabsContent value="dashboard">
                <CandidateDashboard onSelectJob={setSelectedJob} />
              </TabsContent>
            )}

            {canPostJobs && (
              <TabsContent value="employer">
                <EmployerDashboard />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <JobsSidebar
              onCategoryClick={handleCategoryClick}
              onLocationClick={handleLocationClick}
            />
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
