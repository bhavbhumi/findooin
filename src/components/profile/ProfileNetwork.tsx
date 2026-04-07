import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, UserPlus, UserCheck, UserMinus, Clock, Search,
  CheckCircle2, ShieldCheck, Briefcase, MapPin, XCircle,
  BarChart3, Landmark, Settings2,
} from "lucide-react";

import { useEntityTeam, useManageAffiliation, useRequestAffiliation, type TeamAffiliation } from "@/hooks/useTeamAffiliations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { ROLE_CONFIG } from "@/lib/role-config";

interface NetworkUser {
  id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  verification_status: string;
  user_type: string;
}

interface RoleData {
  role: string;
  sub_type: string | null;
}

interface ProfileNetworkProps {
  profileId: string;
  isOwnProfile: boolean;
  currentUserId: string | null;
  defaultTab?: string;
  /** Pass for entity profiles to show team/B2B sub-tabs */
  profileUserType?: string;
  profileRoles?: RoleData[];
  profileDisplayName?: string;
}

/** Determine which B2B directory sub-tabs to show based on entity's roles */
function getEntityDirectoryTabs(roles: RoleData[]): { key: string; label: string; icon: React.ElementType }[] {
  const roleSet = new Set(roles.map((r) => r.role));
  const tabs: { key: string; label: string; icon: React.ElementType }[] = [];

  // All entity types show Employees
  // Then show the OTHER entity types as directories
  if (!roleSet.has("issuer")) {
    tabs.push({ key: "issuers", label: "Issuers", icon: Landmark });
  }
  if (!roleSet.has("intermediary")) {
    tabs.push({ key: "intermediaries", label: "Intermediaries", icon: BarChart3 });
  }
  if (!roleSet.has("enabler")) {
    tabs.push({ key: "enablers", label: "Enablers", icon: Settings2 });
  }

  return tabs;
}

export const ProfileNetwork = ({
  profileId,
  isOwnProfile,
  currentUserId,
  defaultTab = "connections",
  profileUserType,
  profileRoles = [],
  profileDisplayName = "",
}: ProfileNetworkProps) => {
  const [followers, setFollowers] = useState<NetworkUser[]>([]);
  const [following, setFollowing] = useState<NetworkUser[]>([]);
  const [connections, setConnections] = useState<NetworkUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ id: string; user: NetworkUser; direction: "incoming" | "outgoing" }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const isEntity = profileUserType === "entity";
  const entityDirectoryTabs = isEntity ? getEntityDirectoryTabs(profileRoles) : [];

  // Team data for entity profiles
  const { data: team, isLoading: teamLoading } = useEntityTeam(isEntity ? profileId : undefined);
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
      entity_profile_id: profileId,
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

  useEffect(() => {
    loadNetwork();
  }, [profileId]);

  const loadNetwork = async () => {
    setLoading(true);

    const { data: followerRows } = await supabase
      .from("connections")
      .select("from_user_id")
      .eq("to_user_id", profileId)
      .eq("connection_type", "follow");

    const { data: followingRows } = await supabase
      .from("connections")
      .select("to_user_id")
      .eq("from_user_id", profileId)
      .eq("connection_type", "follow");

    const { data: connRows } = await supabase
      .from("connections")
      .select("from_user_id, to_user_id")
      .eq("connection_type", "connect")
      .eq("status", "accepted")
      .or(`from_user_id.eq.${profileId},to_user_id.eq.${profileId}`);

    let pendingRows: any[] = [];
    if (isOwnProfile) {
      const { data: incoming } = await supabase
        .from("connections")
        .select("id, from_user_id")
        .eq("to_user_id", profileId)
        .eq("connection_type", "connect")
        .eq("status", "pending");

      const { data: outgoing } = await supabase
        .from("connections")
        .select("id, to_user_id")
        .eq("from_user_id", profileId)
        .eq("connection_type", "connect")
        .eq("status", "pending");

      pendingRows = [
        ...(incoming || []).map((r: any) => ({ id: r.id, userId: r.from_user_id, direction: "incoming" as const })),
        ...(outgoing || []).map((r: any) => ({ id: r.id, userId: r.to_user_id, direction: "outgoing" as const })),
      ];
    }

    const userIds = new Set<string>();
    followerRows?.forEach((r: any) => userIds.add(r.from_user_id));
    followingRows?.forEach((r: any) => userIds.add(r.to_user_id));
    connRows?.forEach((r: any) => {
      userIds.add(r.from_user_id === profileId ? r.to_user_id : r.from_user_id);
    });
    pendingRows.forEach((r) => userIds.add(r.userId));

    const ids = Array.from(userIds);
    let profilesMap: Record<string, NetworkUser> = {};
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, headline, verification_status, user_type")
        .in("id", ids);
      profiles?.forEach((p: any) => {
        profilesMap[p.id] = p;
      });
    }

    setFollowers(followerRows?.map((r: any) => profilesMap[r.from_user_id]).filter(Boolean) || []);
    setFollowing(followingRows?.map((r: any) => profilesMap[r.to_user_id]).filter(Boolean) || []);
    setConnections(
      connRows?.map((r: any) => profilesMap[r.from_user_id === profileId ? r.to_user_id : r.from_user_id]).filter(Boolean) || []
    );
    setPendingRequests(
      pendingRows.map((r) => ({ id: r.id, user: profilesMap[r.userId], direction: r.direction })).filter((r) => r.user)
    );

    setLoading(false);
  };

  const handleAccept = async (connectionId: string) => {
    await supabase.from("connections").update({ status: "accepted" }).eq("id", connectionId);
    loadNetwork();
  };

  const handleReject = async (connectionId: string) => {
    await supabase.from("connections").update({ status: "rejected" }).eq("id", connectionId);
    loadNetwork();
  };

  const filterUsers = (users: NetworkUser[]) => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.display_name?.toLowerCase().includes(q) ||
        u.headline?.toLowerCase().includes(q)
    );
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  // Determine default sub-tab
  const effectiveDefault = isEntity ? "employees" : defaultTab;

  if (loading && (!isEntity || teamLoading)) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const tabClass = "rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium whitespace-nowrap px-3 sm:px-4";

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search network..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <Tabs defaultValue={effectiveDefault}>
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="inline-flex w-max sm:w-full justify-start bg-card border border-border rounded-xl h-11 p-1">
            {/* Entity-specific: Employees tab */}
            {isEntity && (
              <TabsTrigger value="employees" className={tabClass}>
                <Users className="h-3.5 w-3.5 mr-1.5" />
                Employees ({verified.length})
              </TabsTrigger>
            )}

            {/* B2B directory tabs for entities */}
            {entityDirectoryTabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className={tabClass}>
                <tab.icon className="h-3.5 w-3.5 mr-1.5" />
                {tab.label}
              </TabsTrigger>
            ))}

            {/* Standard network tabs */}
            <TabsTrigger value="connections" className={tabClass}>
              Connections ({connections.length})
            </TabsTrigger>
            <TabsTrigger value="followers" className={tabClass}>
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className={tabClass}>
              Following ({following.length})
            </TabsTrigger>
            {isOwnProfile && pendingRequests.length > 0 && (
              <TabsTrigger value="pending" className={tabClass}>
                Pending ({pendingRequests.length})
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* ── Entity: Employees sub-tab ── */}
        {isEntity && (
          <TabsContent value="employees" className="mt-4 space-y-3">
            {/* Join / pending badge */}
            <div className="flex items-center justify-between">
              {currentUserId && !isOwnProfile && !userAffiliation && (
                <Button size="sm" variant="outline" onClick={() => setJoinOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Join Team
                </Button>
              )}
              {userAffiliation?.status === "pending" && (
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" /> Your Request Pending
                </Badge>
              )}
              <div /> {/* spacer */}
            </div>

            {/* Pending requests — admin only */}
            {isOwnProfile && pending.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  {pending.length} pending request{pending.length > 1 ? "s" : ""}
                </p>
                {pending.map((member) => (
                  <TeamMemberRow
                    key={member.id}
                    member={member}
                    isAdmin={isOwnProfile}
                    onAction={(action) => manageAffiliation.mutate({ id: member.id, action, entityProfileId: profileId })}
                  />
                ))}
              </div>
            )}

            {/* Verified team list */}
            {verified.length > 0 ? (
              verified.map((member) => (
                <TeamMemberRow
                  key={member.id}
                  member={member}
                  isAdmin={isOwnProfile}
                  onAction={(action) => manageAffiliation.mutate({ id: member.id, action, entityProfileId: profileId })}
                />
              ))
            ) : (
              <EmptyState message="No team members yet" />
            )}
          </TabsContent>
        )}

        {/* ── B2B directory sub-tabs (placeholder) ── */}
        {entityDirectoryTabs.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="mt-4">
            <div className="rounded-xl border border-border bg-card p-10 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <tab.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">
                {tab.label} directory
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Linked {tab.label.toLowerCase()} will appear here once the B2B partnership system is enabled.
              </p>
            </div>
          </TabsContent>
        ))}

        {/* ── Standard: Connections ── */}
        <TabsContent value="connections" className="mt-4 space-y-2">
          <UserList users={filterUsers(connections)} getInitials={getInitials} emptyMessage="No connections yet" />
        </TabsContent>

        {/* ── Standard: Followers ── */}
        <TabsContent value="followers" className="mt-4 space-y-2">
          <UserList users={filterUsers(followers)} getInitials={getInitials} emptyMessage="No followers yet" />
        </TabsContent>

        {/* ── Standard: Following ── */}
        <TabsContent value="following" className="mt-4 space-y-2">
          <UserList users={filterUsers(following)} getInitials={getInitials} emptyMessage="Not following anyone yet" />
        </TabsContent>

        {/* ── Standard: Pending ── */}
        {isOwnProfile && (
          <TabsContent value="pending" className="mt-4 space-y-2">
            {pendingRequests.length === 0 ? (
              <EmptyState message="No pending requests" />
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                  <Link to={`/profile/${req.user.id}`}>
                    <NetworkAvatar
                      src={req.user.avatar_url}
                      initials={getInitials(req.user.full_name)}
                      size="md"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${req.user.id}`} className="hover:underline">
                      <p className="text-sm font-semibold text-card-foreground truncate">
                        {req.user.display_name || req.user.full_name}
                        {req.user.verification_status === "verified" && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-accent inline ml-1" />
                        )}
                      </p>
                    </Link>
                    {req.user.headline && (
                      <p className="text-xs text-muted-foreground truncate">{req.user.headline}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                      {req.direction === "incoming" ? "Wants to connect with you" : "Request sent"}
                    </p>
                  </div>
                  {req.direction === "incoming" && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="default" className="gap-1" onClick={() => handleAccept(req.id)}>
                        <UserCheck className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => handleReject(req.id)}>
                        <UserMinus className="h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  )}
                  {req.direction === "outgoing" && (
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Join Team dialog */}
      {isEntity && (
        <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Join {profileDisplayName}</DialogTitle>
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
      )}
    </div>
  );
};

/* ── Reusable sub-components ── */

function TeamMemberRow({
  member,
  isAdmin,
  onAction,
}: {
  member: TeamAffiliation;
  isAdmin: boolean;
  onAction: (action: "verified" | "rejected" | "departed") => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors">
      <Link to={`/profile/${member.user_id}`}>
        <NetworkAvatar
          src={member.member_avatar}
          initials={(member.member_name || "?").slice(0, 2).toUpperCase()}
          size="md"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${member.user_id}`} className="text-sm font-medium text-foreground hover:underline flex items-center gap-1.5">
          {member.member_name}
          {member.member_verification === "verified" && (
            <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
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
      {isAdmin && member.status === "pending" && (
        <div className="flex gap-1.5 shrink-0">
          <Button size="sm" variant="default" className="h-7 text-xs" onClick={() => onAction("verified")}>
            <CheckCircle2 className="h-3 w-3 mr-1" /> Verify
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onAction("rejected")}>
            <XCircle className="h-3 w-3 mr-1" /> Reject
          </Button>
        </div>
      )}
      {isAdmin && member.status === "verified" && (
        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => onAction("departed")}>
          Mark Departed
        </Button>
      )}
    </div>
  );
}

const UserList = ({ users, getInitials, emptyMessage }: { users: NetworkUser[]; getInitials: (n: string) => string; emptyMessage: string }) => {
  if (users.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <>
      {users.map((user) => (
        <div key={user.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <Link to={`/profile/${user.id}`}>
            <NetworkAvatar
              src={user.avatar_url}
              initials={getInitials(user.full_name)}
              size="md"
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${user.id}`} className="hover:underline">
              <p className="text-sm font-semibold text-card-foreground truncate">
                {user.display_name || user.full_name}
                {user.verification_status === "verified" && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent inline ml-1" />
                )}
              </p>
            </Link>
            {user.headline && (
              <p className="text-xs text-muted-foreground truncate">{user.headline}</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{user.user_type}</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/profile/${user.id}`}>View</Link>
          </Button>
        </div>
      ))}
    </>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-border bg-card p-10 text-center">
    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
      <Users className="h-5 w-5 text-muted-foreground" />
    </div>
    <p className="text-muted-foreground text-sm font-medium">{message}</p>
  </div>
);
