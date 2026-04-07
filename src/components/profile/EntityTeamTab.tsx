import { useState } from "react";
import { useEntityTeam, useManageAffiliation, useRequestAffiliation, type TeamAffiliation } from "@/hooks/useTeamAffiliations";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle2, Clock, XCircle, UserPlus, Users, Briefcase, MapPin, ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface EntityTeamTabProps {
  entityProfileId: string;
  isEntityAdmin: boolean;
  currentUserId: string | null;
  entityName: string;
}

export function EntityTeamTab({ entityProfileId, isEntityAdmin, currentUserId, entityName }: EntityTeamTabProps) {
  const { data: team, isLoading } = useEntityTeam(entityProfileId);
  const manageAffiliation = useManageAffiliation();
  const requestAffiliation = useRequestAffiliation();
  const [joinOpen, setJoinOpen] = useState(false);
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [branch, setBranch] = useState("");

  const verified = team?.filter((t) => t.status === "verified") || [];
  const pending = team?.filter((t) => t.status === "pending") || [];
  const userAffiliation = team?.find((t) => t.user_id === currentUserId);

  const handleJoin = () => {
    if (!designation.trim()) return;
    requestAffiliation.mutate({
      entity_profile_id: entityProfileId,
      designation: designation.trim(),
      department: department.trim() || undefined,
      branch_location: branch.trim() || undefined,
    }, {
      onSuccess: () => {
        setJoinOpen(false);
        setDesignation("");
        setDepartment("");
        setBranch("");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with join button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Team ({verified.length})
          </h3>
        </div>
        {currentUserId && !isEntityAdmin && !userAffiliation && (
          <Button size="sm" variant="outline" onClick={() => setJoinOpen(true)}>
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Join Team
          </Button>
        )}
        {userAffiliation?.status === "pending" && (
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" /> Request Pending
          </Badge>
        )}
      </div>

      {/* Pending requests — visible to entity admin */}
      {isEntityAdmin && pending.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
            {pending.length} pending request{pending.length > 1 ? "s" : ""}
          </p>
          {pending.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isEntityAdmin={isEntityAdmin}
              entityProfileId={entityProfileId}
              onAction={(action) => manageAffiliation.mutate({ id: member.id, action, entityProfileId })}
            />
          ))}
        </div>
      )}

      {/* Verified team */}
      {verified.length > 0 ? (
        <div className="space-y-2">
          {verified.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              isEntityAdmin={isEntityAdmin}
              entityProfileId={entityProfileId}
              onAction={(action) => manageAffiliation.mutate({ id: member.id, action, entityProfileId })}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm font-medium">No team members yet</p>
          <p className="text-muted-foreground text-xs mt-1">
            {isEntityAdmin
              ? "Team members will appear here once they join and you verify them."
              : "This entity hasn't verified any team members yet."}
          </p>
        </div>
      )}

      {/* Join dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join {entityName}</DialogTitle>
            <DialogDescription>
              Request to be listed as a team member. The entity admin will verify your affiliation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                placeholder="e.g. Senior Relationship Manager"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="e.g. Wealth Management"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="branch">Branch/Location</Label>
              <Input
                id="branch"
                placeholder="e.g. Mumbai - Nariman Point"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinOpen(false)}>Cancel</Button>
            <Button onClick={handleJoin} disabled={!designation.trim() || requestAffiliation.isPending}>
              {requestAffiliation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MemberRow({
  member,
  isEntityAdmin,
  entityProfileId,
  onAction,
}: {
  member: TeamAffiliation;
  isEntityAdmin: boolean;
  entityProfileId: string;
  onAction: (action: "verified" | "rejected" | "departed") => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors">
      <Link to={`/profile/${member.user_id}`}>
        <AvatarWithFallback
          src={member.member_avatar}
          initials={(member.member_name || "?").slice(0, 2).toUpperCase()}
          className="h-10 w-10 rounded-full"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${member.user_id}`} className="text-sm font-medium text-foreground hover:underline flex items-center gap-1.5">
          {member.member_name}
          {member.member_verification === "verified" && (
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          {member.designation && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3 shrink-0" /> {member.designation}
            </span>
          )}
          {member.department && <span>· {member.department}</span>}
          {member.branch_location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 shrink-0" /> {member.branch_location}
            </span>
          )}
        </div>
      </div>
      {isEntityAdmin && member.status === "pending" && (
        <div className="flex gap-1.5 shrink-0">
          <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => onAction("verified")}>
            <CheckCircle2 className="h-3 w-3 mr-1" /> Verify
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAction("rejected")}>
            <XCircle className="h-3 w-3 mr-1" /> Reject
          </Button>
        </div>
      )}
      {isEntityAdmin && member.status === "verified" && (
        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => onAction("departed")}>
          Mark Departed
        </Button>
      )}
    </div>
  );
}
