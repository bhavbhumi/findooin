import { useAdminReports, useUpdateReportStatus, useDeletePost } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Flag, CheckCircle2, XCircle, Trash2, FileText, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FindooLoader } from "@/components/FindooLoader";

const statusColors: Record<string, string> = {
  pending: "bg-status-warning/10 text-status-warning border-status-warning/20",
  reviewed: "bg-accent/10 text-accent border-accent/20",
  dismissed: "bg-muted text-muted-foreground border-border",
  action_taken: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AdminContentModeration() {
  const { data: reports, isLoading } = useAdminReports();
  const updateStatus = useUpdateReportStatus();
  const deletePost = useDeletePost();

  if (isLoading) return <FindooLoader text="Loading reports..." />;

  const pending = reports?.filter(r => r.status === "pending") || [];
  const resolved = reports?.filter(r => r.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Flag className="h-4 w-4 text-status-warning" />
          Pending Reports ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No pending reports</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pending.map(report => (
              <Card key={report.id}>
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <Flag className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] ${statusColors[report.status]}`}>{report.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm font-medium">{report.reason}</p>
                      {report.description && <p className="text-xs text-muted-foreground">{report.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          Reporter: {report.reporter?.full_name || "Unknown"}
                        </span>
                        {report.reported_user && (
                          <span className="flex items-center gap-1">
                            Reported: {report.reported_user.full_name}
                          </span>
                        )}
                        {report.post_id && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Post reported
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs"
                          onClick={() => updateStatus.mutate({ reportId: report.id, status: "dismissed" })}
                          disabled={updateStatus.isPending}
                        >
                          <XCircle className="h-3 w-3" /> Dismiss
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-xs"
                          onClick={() => updateStatus.mutate({ reportId: report.id, status: "reviewed" })}
                          disabled={updateStatus.isPending}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Mark Reviewed
                        </Button>
                        {report.post_id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-1 text-xs"
                            onClick={() => {
                              deletePost.mutate(report.post_id!);
                              updateStatus.mutate({ reportId: report.id, status: "action_taken" });
                            }}
                            disabled={deletePost.isPending}
                          >
                            <Trash2 className="h-3 w-3" /> Remove Post
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {resolved.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            Resolved ({resolved.length})
          </h2>
          <div className="space-y-2">
            {resolved.slice(0, 20).map(report => (
              <Card key={report.id} className="opacity-70">
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <Flag className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm flex-1">{report.reason}</span>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[report.status]}`}>{report.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
