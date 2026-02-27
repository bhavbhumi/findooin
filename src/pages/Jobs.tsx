import { useState } from "react";
import AppNavbar from "@/components/AppNavbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Briefcase, FileText, Building2 } from "lucide-react";
import { useJobs, useSavedJobs, useToggleSaveJob, useMyApplications } from "@/hooks/useJobs";
import { useRole } from "@/contexts/RoleContext";
import { JobCard, CATEGORY_LABELS } from "@/components/jobs/JobCard";
import { JobDetailSheet } from "@/components/jobs/JobDetailSheet";
import { PostJobDialog } from "@/components/jobs/PostJobDialog";
import { MyApplicationsPanel } from "@/components/jobs/MyApplicationsPanel";
import { EmployerDashboard } from "@/components/jobs/EmployerDashboard";
import type { Job } from "@/hooks/useJobs";

const Jobs = () => {
  const { activeRole } = useRole();
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

  const appliedJobIds = new Set(myApps?.map((a) => a.job_id) || []);
  const canPostJobs = activeRole === "issuer" || activeRole === "intermediary";

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AppNavbar />

      <div className="container max-w-5xl py-6 px-4">
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
            <TabsTrigger value="applications" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              My Applications
            </TabsTrigger>
            {canPostJobs && (
              <TabsTrigger value="employer" className="gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Employer Dashboard
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs, companies..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
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

            {/* Job list */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 rounded-lg bg-muted/30 animate-pulse" />
                ))}
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

          <TabsContent value="applications">
            <MyApplicationsPanel />
          </TabsContent>

          {canPostJobs && (
            <TabsContent value="employer">
              <EmployerDashboard />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Job detail sheet */}
      <JobDetailSheet
        job={selectedJob}
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        isSaved={selectedJob ? savedJobIds?.includes(selectedJob.id) : false}
        onToggleSave={() => selectedJob && toggleSave.mutate({ jobId: selectedJob.id, saved: savedJobIds?.includes(selectedJob.id) || false })}
        hasApplied={selectedJob ? appliedJobIds.has(selectedJob.id) : false}
      />

      {/* Post job dialog */}
      <PostJobDialog open={showPostJob} onClose={() => setShowPostJob(false)} />
    </div>
  );
};

export default Jobs;
