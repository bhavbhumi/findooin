/**
 * AdminJobsManagement — Admin view for managing all job listings across the platform.
 * Provides overview stats, filtering, and moderation actions (pause, close, delete).
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import {
  Briefcase, Search, ChevronLeft, ChevronRight, Eye, Users,
  Pause, Play, Trash2, MapPin, Building2, Clock, BarChart3, AlertTriangle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  paused: "bg-status-warning/10 text-status-warning border-status-warning/20",
  closed: "bg-muted text-muted-foreground border-border",
  expired: "bg-destructive/10 text-destructive border-destructive/20",
};

const PAGE_SIZE = 15;

export function AdminJobsManagement() {

function JobsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Fetch poster profiles
      const posterIds = [...new Set((data || []).map((j) => j.poster_id))];
      const { data: profiles } = posterIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, display_name, avatar_url").in("id", posterIds)
        : { data: [] };
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
      return (data || []).map((j) => ({ ...j, poster_profile: profileMap[j.poster_id] || null }));
    },
  });

  const updateJob = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "closed" | "draft" | "expired" | "paused" }) => {
      const { error } = await supabase.from("jobs").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Job status updated");
    },
  });

  const deleteJob = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Job deleted");
    },
  });

  const filtered = useMemo(() => {
    if (!jobs) return [];
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (categoryFilter !== "all" && j.job_category !== categoryFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return j.title.toLowerCase().includes(s) || j.company_name.toLowerCase().includes(s);
      }
      return true;
    });
  }, [jobs, search, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => {
    if (!jobs) return { total: 0, active: 0, paused: 0, totalApps: 0, totalViews: 0 };
    return {
      total: jobs.length,
      active: jobs.filter((j) => j.status === "active").length,
      paused: jobs.filter((j) => j.status === "paused").length,
      totalApps: jobs.reduce((s, j) => s + (j.application_count || 0), 0),
      totalViews: jobs.reduce((s, j) => s + (j.view_count || 0), 0),
    };
  }, [jobs]);

  const categories = useMemo(() => {
    if (!jobs) return [];
    return [...new Set(jobs.map((j) => j.job_category))].sort();
  }, [jobs]);

  if (isLoading) return <FindooLoader text="Loading jobs..." />;

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Jobs", value: stats.total, icon: Briefcase },
          { label: "Active", value: stats.active, icon: Play },
          { label: "Paused", value: stats.paused, icon: Pause },
          { label: "Applications", value: stats.totalApps, icon: Users },
          { label: "Views", value: stats.totalViews.toLocaleString(), icon: Eye },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search jobs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} job{filtered.length !== 1 ? "s" : ""}</p>

      {/* Job list */}
      <div className="space-y-2">
        {paged.map((job) => {
          const poster = job.poster_profile as any;
          return (
            <Card key={job.id} className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold truncate">{job.title}</h3>
                      <Badge variant="outline" className={`text-[9px] ${statusColors[job.status] || ""}`}>
                        {job.status}
                      </Badge>
                      <Badge variant="outline" className="text-[9px]">{job.job_type.replace(/_/g, " ")}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{job.company_name}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location || "Remote"}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job.application_count} apps</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.view_count} views</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</span>
                    </div>
                    {poster && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Posted by: {poster.display_name || poster.full_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {job.status === "active" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateJob.mutate({ id: job.id, status: "paused" })}>
                        <Pause className="h-3 w-3" /> Pause
                      </Button>
                    )}
                    {job.status === "paused" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateJob.mutate({ id: job.id, status: "active" })}>
                        <Play className="h-3 w-3" /> Resume
                      </Button>
                    )}
                    {(job.status === "active" || job.status === "paused") && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateJob.mutate({ id: job.id, status: "closed" })}>
                        Close
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => deleteJob.mutate(job.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {paged.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No jobs found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
