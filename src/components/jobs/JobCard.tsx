import { memo } from "react";
import { MapPin, Clock, Briefcase, IndianRupee, Bookmark, BookmarkCheck, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import type { Job } from "@/hooks/useJobs";

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Full-Time",
  part_time: "Part-Time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
};

const CATEGORY_LABELS: Record<string, string> = {
  fund_management: "Fund Management",
  research_analysis: "Research & Analysis",
  compliance_legal: "Compliance & Legal",
  risk_management: "Risk Management",
  distribution_sales: "Distribution & Sales",
  wealth_advisory: "Wealth Advisory",
  relationship_management: "Relationship Mgmt",
  operations: "Operations",
  fintech: "FinTech",
  data_analytics: "Data Analytics",
  corporate_finance: "Corporate Finance",
  treasury: "Treasury",
  insurance: "Insurance",
  banking: "Banking",
  other: "Other",
};

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onClick?: () => void;
}

export const JobCard = memo(function JobCard({ job, isSaved, onToggleSave, onClick }: JobCardProps) {
  const isVerified = job.poster_profile?.verification_status === "verified";

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

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border-border hover:border-primary/20"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${job.title} at ${job.company_name}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } }}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-heading font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {job.title}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
              <span className="font-medium text-foreground/80">{job.company_name}</span>
              {isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {job.location}
                {job.is_remote && " (Remote)"}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {JOB_TYPE_LABELS[job.job_type] || job.job_type}
              </span>
              {(job.experience_min != null || job.experience_max != null) && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {job.experience_min || 0}–{job.experience_max || "10+"}y
                </span>
              )}
              {formatSalary() && (
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3" />
                  {formatSalary()}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-[10px]">
                {CATEGORY_LABELS[job.job_category] || job.job_category}
              </Badge>
              {job.skills_required.slice(0, 3).map((s) => (
                <Badge key={s} variant="outline" className="text-[10px]">
                  {s}
                </Badge>
              ))}
              {job.skills_required.length > 3 && (
                <Badge variant="outline" className="text-[10px]">
                  +{job.skills_required.length - 3}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            {onToggleSave && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label={isSaved ? "Unsave job" : "Save job"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave();
                }}
              >
                {isSaved ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            )}
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export { JOB_TYPE_LABELS, CATEGORY_LABELS };
