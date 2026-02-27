import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export interface Job {
  id: string;
  poster_id: string;
  title: string;
  description: string;
  company_name: string;
  company_logo_url: string | null;
  location: string;
  is_remote: boolean;
  job_category: string;
  job_type: string;
  experience_min: number | null;
  experience_max: number | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string;
  skills_required: string[];
  qualifications: string[];
  certifications_preferred: string[];
  status: string;
  expires_at: string | null;
  application_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  // joined
  poster_profile?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    verification_status: string;
  };
}

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  cover_note: string;
  resume_url: string | null;
  resume_name: string | null;
  status: string;
  employer_notes: string | null;
  created_at: string;
  updated_at: string;
  // joined
  job?: Job;
  applicant_profile?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    verification_status: string;
  };
}

export function useJobs(filters?: { category?: string; type?: string; location?: string; search?: string }) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select("*")
        .eq("status", "active" as any)
        .order("created_at", { ascending: false });

      if (filters?.category && filters.category !== "all") {
        query = query.eq("job_category", filters.category as any);
      }
      if (filters?.type && filters.type !== "all") {
        query = query.eq("job_type", filters.type as any);
      }
      if (filters?.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      const jobs = (data || []) as unknown as Job[];
      
      // Fetch poster profiles separately
      const posterIds = [...new Set(jobs.map(j => j.poster_id))];
      if (posterIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, display_name, avatar_url, verification_status")
          .in("id", posterIds);
        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        jobs.forEach(j => {
          const p = profileMap.get(j.poster_id);
          if (p) j.poster_profile = p as any;
        });
      }
      return jobs;
    },
  });
}

export function useJob(id: string | undefined) {
  return useQuery({
    queryKey: ["job", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      const job = data as unknown as Job;
      // Fetch poster profile
      const { data: profile } = await supabase.from("profiles").select("id, full_name, display_name, avatar_url, verification_status").eq("id", job.poster_id).single();
      if (profile) job.poster_profile = profile as any;
      return job;
    },
  });
}

export function useMyPostedJobs() {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["my-posted-jobs", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("poster_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Job[];
    },
  });
}

export function useMyApplications() {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["my-applications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*, job:jobs(*)")
        .eq("applicant_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as JobApplication[];
    },
  });
}

export function useJobApplications(jobId: string | undefined) {
  return useQuery({
    queryKey: ["job-applications", jobId],
    enabled: !!jobId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("job_id", jobId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const apps = (data || []) as unknown as JobApplication[];
      // Fetch applicant profiles
      const applicantIds = [...new Set(apps.map(a => a.applicant_id))];
      if (applicantIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, display_name, avatar_url, headline, verification_status")
          .in("id", applicantIds);
        const profileMap = new Map((profiles || []).map(p => [p.id, p]));
        apps.forEach(a => {
          const p = profileMap.get(a.applicant_id);
          if (p) a.applicant_profile = p as any;
        });
      }
      return apps;
    },
  });
}

export function useSavedJobs() {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["saved-jobs", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", userId!);
      if (error) throw error;
      return (data || []).map((s: any) => s.job_id as string);
    },
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (job: Partial<Job>) => {
      const { data, error } = await supabase.from("jobs").insert(job as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["my-posted-jobs"] });
      toast.success("Job posted successfully!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }) => {
      const { error } = await supabase.from("jobs").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["my-posted-jobs"] });
      toast.success("Job updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useApplyToJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (application: { job_id: string; applicant_id: string; cover_note: string; resume_url?: string; resume_name?: string }) => {
      const { data, error } = await supabase.from("job_applications").insert(application as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["job-applications"] });
      toast.success("Application submitted!");
    },
    onError: (e: any) => {
      if (e.message?.includes("duplicate")) toast.error("You've already applied to this job");
      else toast.error(e.message);
    },
  });
}

export function useToggleSaveJob() {
  const qc = useQueryClient();
  const { userId } = useRole();
  return useMutation({
    mutationFn: async ({ jobId, saved }: { jobId: string; saved: boolean }) => {
      if (saved) {
        await supabase.from("saved_jobs").delete().eq("user_id", userId!).eq("job_id", jobId);
      } else {
        await supabase.from("saved_jobs").insert({ user_id: userId!, job_id: jobId } as any);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved-jobs"] }),
  });
}

export function useUpdateApplicationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, employer_notes }: { id: string; status: string; employer_notes?: string }) => {
      const updates: any = { status };
      if (employer_notes !== undefined) updates.employer_notes = employer_notes;
      const { error } = await supabase.from("job_applications").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-applications"] });
      toast.success("Application status updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
