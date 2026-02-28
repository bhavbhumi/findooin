import { useState } from "react";
import { useVerificationQueue, useReviewVerification } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, FileText, ExternalLink, ShieldCheck, Building2, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FindooLoader } from "@/components/FindooLoader";
import { ROLE_CONFIG } from "@/lib/role-config";

const statusColors: Record<string, string> = {
  pending: "bg-status-warning/10 text-status-warning border-status-warning/20",
  approved: "bg-accent/10 text-accent border-accent/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AdminVerificationQueue() {
  const { data: requests, isLoading } = useVerificationQueue();
  const review = useReviewVerification();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [action, setAction] = useState<"approved" | "rejected" | null>(null);

  const selected = requests?.find(r => r.id === selectedId);

  const handleReview = () => {
    if (!selected || !action) return;
    review.mutate({
      requestId: selected.id,
      status: action,
      adminNotes,
      userId: selected.user_id,
    }, {
      onSuccess: () => {
        setSelectedId(null);
        setAdminNotes("");
        setAction(null);
      },
    });
  };

  if (isLoading) return <FindooLoader text="Loading queue..." />;

  const pending = requests?.filter(r => r.status === "pending") || [];
  const reviewed = requests?.filter(r => r.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-status-warning" />
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">No pending verification requests</CardContent></Card>
        ) : (
          <div className="space-y-3">
            {pending.map(req => (
              <Card key={req.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedId(req.id)}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {req.profile?.full_name?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{req.profile?.organization || req.profile?.full_name || "Unknown"}</span>
                        {req.roles?.map(r => {
                          const rc = ROLE_CONFIG[r.role];
                          return rc ? (
                            <span key={r.role} className={`text-[10px] px-1.5 py-0.5 rounded-full ${rc.bgColor}`}>
                              {rc.label}
                            </span>
                          ) : null;
                        })}
                        <Badge variant="outline" className={`text-[10px] ${statusColors[req.status]}`}>{req.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {req.regulator && `${req.regulator} · `}
                        {req.registration_number && `Reg: ${req.registration_number} · `}
                        {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {reviewed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-accent" />
            Reviewed ({reviewed.length})
          </h2>
          <div className="space-y-2">
            {reviewed.slice(0, 20).map(req => (
              <Card key={req.id} className="opacity-70">
                <CardContent className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {req.profile?.full_name?.slice(0, 2).toUpperCase() || "??"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{req.profile?.organization || req.profile?.full_name}</span>
                      <Badge variant="outline" className={`ml-2 text-[10px] ${statusColors[req.status]}`}>{req.status}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(o) => { if (!o) { setSelectedId(null); setAction(null); setAdminNotes(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Verification Request</DialogTitle>
            <DialogDescription>Review the submitted documents and approve or reject this request.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                  {selected.profile?.full_name?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{selected.profile?.organization || selected.profile?.full_name}</p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {selected.profile?.user_type === "entity" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {selected.profile?.user_type}
                    </span>
                    {selected.roles?.map(r => <span key={r.role} className="capitalize">{r.role}{r.sub_type ? ` (${r.sub_type})` : ""}</span>)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-3 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Document</p>
                <a href={selected.document_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileText className="h-4 w-4" />
                  {selected.document_name}
                  <ExternalLink className="h-3 w-3" />
                </a>
                {selected.regulator && <p className="text-xs"><span className="text-muted-foreground">Regulator:</span> {selected.regulator}</p>}
                {selected.registration_number && <p className="text-xs"><span className="text-muted-foreground">Reg #:</span> {selected.registration_number}</p>}
                {selected.notes && <p className="text-xs"><span className="text-muted-foreground">Notes:</span> {selected.notes}</p>}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Admin Notes (optional)</label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add notes about your decision..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 gap-1.5"
                  variant="default"
                  onClick={() => { setAction("approved"); }}
                  disabled={review.isPending}
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
                <Button
                  className="flex-1 gap-1.5"
                  variant="destructive"
                  onClick={() => { setAction("rejected"); }}
                  disabled={review.isPending}
                >
                  <XCircle className="h-4 w-4" /> Reject
                </Button>
              </div>

              {action && (
                <div className="rounded-lg border border-border p-3 bg-muted/50">
                  <p className="text-sm font-medium mb-2">
                    Confirm <span className={action === "approved" ? "text-accent" : "text-destructive"}>{action}</span>?
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleReview} disabled={review.isPending}>
                      {review.isPending ? "Processing..." : "Confirm"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setAction(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
