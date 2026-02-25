import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, UserPlus, UserCheck, UserMinus, Clock, Search, BarChart3, Building2,
  CheckCircle2, ShieldCheck,
} from "lucide-react";
import { useConnectionActions } from "@/hooks/useConnectionActions";

interface NetworkUser {
  id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  verification_status: string;
  user_type: string;
}

interface ProfileNetworkProps {
  profileId: string;
  isOwnProfile: boolean;
  currentUserId: string | null;
  defaultTab?: string;
}

export const ProfileNetwork = ({ profileId, isOwnProfile, currentUserId, defaultTab = "followers" }: ProfileNetworkProps) => {
  const [followers, setFollowers] = useState<NetworkUser[]>([]);
  const [following, setFollowing] = useState<NetworkUser[]>([]);
  const [connections, setConnections] = useState<NetworkUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<{ id: string; user: NetworkUser; direction: "incoming" | "outgoing" }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadNetwork();
  }, [profileId]);

  const loadNetwork = async () => {
    setLoading(true);

    // Followers: people who follow this profile
    const { data: followerRows } = await supabase
      .from("connections")
      .select("from_user_id")
      .eq("to_user_id", profileId)
      .eq("connection_type", "follow");

    // Following: people this profile follows
    const { data: followingRows } = await supabase
      .from("connections")
      .select("to_user_id")
      .eq("from_user_id", profileId)
      .eq("connection_type", "follow");

    // Connections (accepted)
    const { data: connRows } = await supabase
      .from("connections")
      .select("from_user_id, to_user_id")
      .eq("connection_type", "connect")
      .eq("status", "accepted")
      .or(`from_user_id.eq.${profileId},to_user_id.eq.${profileId}`);

    // Pending requests (only for own profile)
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

    // Collect all user IDs
    const userIds = new Set<string>();
    followerRows?.forEach((r: any) => userIds.add(r.from_user_id));
    followingRows?.forEach((r: any) => userIds.add(r.to_user_id));
    connRows?.forEach((r: any) => {
      userIds.add(r.from_user_id === profileId ? r.to_user_id : r.from_user_id);
    });
    pendingRows.forEach((r) => userIds.add(r.userId));

    // Fetch profiles
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

  if (loading) {
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

      <Tabs defaultValue={defaultTab}>
        <TabsList className="w-full justify-start bg-card border border-border rounded-xl h-11 p-1">
          <TabsTrigger value="followers" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium flex-1 sm:flex-none sm:px-4">
            Followers ({followers.length})
          </TabsTrigger>
          <TabsTrigger value="following" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium flex-1 sm:flex-none sm:px-4">
            Following ({following.length})
          </TabsTrigger>
          <TabsTrigger value="connections" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium flex-1 sm:flex-none sm:px-4">
            Connections ({connections.length})
          </TabsTrigger>
          {isOwnProfile && pendingRequests.length > 0 && (
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium flex-1 sm:flex-none sm:px-4">
              Pending ({pendingRequests.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="followers" className="mt-4 space-y-2">
          <UserList users={filterUsers(followers)} getInitials={getInitials} emptyMessage="No followers yet" />
        </TabsContent>

        <TabsContent value="following" className="mt-4 space-y-2">
          <UserList users={filterUsers(following)} getInitials={getInitials} emptyMessage="Not following anyone yet" />
        </TabsContent>

        <TabsContent value="connections" className="mt-4 space-y-2">
          <UserList users={filterUsers(connections)} getInitials={getInitials} emptyMessage="No connections yet" />
        </TabsContent>

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
    </div>
  );
};

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
