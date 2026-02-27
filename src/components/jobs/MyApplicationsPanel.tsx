import { useMyApplications } from "@/hooks/useJobs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Briefcase, FileText } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-muted text-muted-foreground",
  viewed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  shortlisted: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  interviewing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  offered: "bg-green-500/10 text-green-600 border-green-500/20",
  hired: "bg-green-600/10 text-green-700 border-green-600/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  withdrawn: "bg-muted text-muted-foreground",
};

export function MyApplicationsPanel() {
  const { data: applications, isLoading } = useMyApplications();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  if (!applications?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No applications yet</p>
        <p className="text-xs mt-1">Browse jobs and apply to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {applications.map((app) => (
        <Card key={app.id} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="font-heading font-semibold text-sm truncate">{app.job?.title || "Job"}</h4>
                <p className="text-xs text-muted-foreground">{app.job?.company_name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={STATUS_COLORS[app.status] || ""}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                  {app.resume_name && (
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <FileText className="h-3 w-3" />{app.resume_name}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
