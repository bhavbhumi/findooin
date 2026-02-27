
-- Job categories enum
CREATE TYPE public.job_category AS ENUM (
  'fund_management',
  'research_analysis',
  'compliance_legal',
  'risk_management',
  'distribution_sales',
  'wealth_advisory',
  'relationship_management',
  'operations',
  'fintech',
  'data_analytics',
  'corporate_finance',
  'treasury',
  'insurance',
  'banking',
  'other'
);

-- Job type enum
CREATE TYPE public.job_type AS ENUM ('full_time', 'part_time', 'contract', 'internship', 'freelance');

-- Job status enum
CREATE TYPE public.job_status AS ENUM ('draft', 'active', 'paused', 'closed', 'expired');

-- Application status enum
CREATE TYPE public.application_status AS ENUM ('submitted', 'viewed', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn');

-- Jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poster_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  company_name TEXT NOT NULL DEFAULT '',
  company_logo_url TEXT,
  location TEXT NOT NULL DEFAULT '',
  is_remote BOOLEAN NOT NULL DEFAULT false,
  job_category public.job_category NOT NULL DEFAULT 'other',
  job_type public.job_type NOT NULL DEFAULT 'full_time',
  experience_min INTEGER DEFAULT 0,
  experience_max INTEGER,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT NOT NULL DEFAULT 'INR',
  skills_required TEXT[] DEFAULT '{}',
  qualifications TEXT[] DEFAULT '{}',
  certifications_preferred TEXT[] DEFAULT '{}',
  status public.job_status NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  application_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL,
  cover_note TEXT DEFAULT '',
  resume_url TEXT,
  resume_name TEXT,
  status public.application_status NOT NULL DEFAULT 'submitted',
  employer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, applicant_id)
);

-- Saved jobs (bookmarks)
CREATE TABLE public.saved_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, job_id)
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- Jobs RLS policies
CREATE POLICY "Anyone can view active jobs" ON public.jobs FOR SELECT USING (status = 'active' OR poster_id = auth.uid());
CREATE POLICY "Verified users can post jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = poster_id);
CREATE POLICY "Posters can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() = poster_id) WITH CHECK (auth.uid() = poster_id);
CREATE POLICY "Posters can delete own jobs" ON public.jobs FOR DELETE USING (auth.uid() = poster_id);

-- Job applications RLS policies
CREATE POLICY "Applicants can view own applications" ON public.job_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Job posters can view applications" ON public.job_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_applications.job_id AND jobs.poster_id = auth.uid())
);
CREATE POLICY "Authenticated users can apply" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Applicants can update own applications" ON public.job_applications FOR UPDATE USING (auth.uid() = applicant_id);
CREATE POLICY "Job posters can update application status" ON public.job_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jobs WHERE jobs.id = job_applications.job_id AND jobs.poster_id = auth.uid())
);

-- Saved jobs RLS policies
CREATE POLICY "Users can view own saved jobs" ON public.saved_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save jobs" ON public.saved_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave jobs" ON public.saved_jobs FOR DELETE USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON public.job_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Resume storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false);

-- Resume storage policies
CREATE POLICY "Users can upload own resumes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own resumes" ON storage.objects FOR SELECT USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Job posters can view applicant resumes" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND EXISTS (
    SELECT 1 FROM public.job_applications ja
    JOIN public.jobs j ON j.id = ja.job_id
    WHERE j.poster_id = auth.uid()
    AND ja.applicant_id::text = (storage.foldername(name))[1]
  )
);
