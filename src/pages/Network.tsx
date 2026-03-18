import { useEffect, useState, useCallback, memo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Button } from "@/components/ui/button";
import { NetworkSidebar } from "@/components/network/NetworkSidebar";
import { InviteDialog } from "@/components/network/InviteDialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetworkUserSkeleton } from "@/components/skeletons/NetworkUserSkeleton";
import {
  Users, UserPlus, UserCheck, UserMinus, Clock, Search, CheckCircle2,
  Send, MessageSquare,
} from "lucide-react";

interface NetworkUser {
  id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  verification_status: string;
  user_type: string;
  organization: string | null;
}

const MemoizedNetworkSidebar = memo(NetworkSidebar);

const Network = () => {
  usePageMeta({ title: "Network", description: "Build your trust network — connect with verified financial professionals.", path: "/network" });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("connections");
  const [inviteOpen, setInviteOpen] = useState(false);

  const [myConnections, setMyConnections] = useState<NetworkUser[]>([]);
  const [myFollowing, setMyFollowing] = useState<NetworkUser[]>([]);
  const [myFollowers, setMyFollowers] = useState<NetworkUser[]>([]);
  const [pendingIncoming, setPendingIncoming] = useState<{ id: string; user: NetworkUser }[]>([]);
  const [pendingOutgoing, setPendingOutgoing] = useState<{ id: string; user: NetworkUser }[]>([]);
  

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setCurrentUserId(session.user.id);
      loadNetwork(session.user.id);
    });
  }, []);

  const loadNetwork = async (userId: string) => {
    setLoading(true);
    const [followersRes, followingRes, connRes, pendInRes, pendOutRes] = await Promise.all([
      supabase.from("connections").select("from_user_id").eq("to_user_id", userId).eq("connection_type", "follow"),
      supabase.from("connections").select("to_user_id").eq("from_user_id", userId).eq("connection_type", "follow"),
      supabase.from("connections").select("from_user_id, to_user_id").eq("connection_type", "connect").eq("status", "accepted").or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`),
      supabase.from("connections").select("id, from_user_id").eq("to_user_id", userId).eq("connection_type", "connect").eq("status", "pending"),
      supabase.from("connections").select("id, to_user_id").eq("from_user_id", userId).eq("connection_type", "connect").eq("status", "pending"),
    ]);

    const userIds = new Set<string>();
    followersRes.data?.forEach((r: any) => userIds.add(r.from_user_id));
    followingRes.data?.forEach((r: any) => userIds.add(r.to_user_id));
    connRes.data?.forEach((r: any) => {
      userIds.add(r.from_user_id === userId ? r.to_user_id : r.from_user_id);
    });
    pendInRes.data?.forEach((r: any) => userIds.add(r.from_user_id));
    pendOutRes.data?.forEach((r: any) => userIds.add(r.to_user_id));

    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, display_name, avatar_url, headline, verification_status, user_type, organization")
      .neq("id", userId)
      .limit(50);


    const profilesMap: Record<string, NetworkUser> = {};
    (allProfiles || []).forEach((p: any) => { profilesMap[p.id] = p; });

    const missingIds = Array.from(userIds).filter((id) => !profilesMap[id]);
    if (missingIds.length > 0) {
      const { data: extra } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, headline, verification_status, user_type, organization")
        .in("id", missingIds);
      extra?.forEach((p: any) => { profilesMap[p.id] = p; });
    }

    setMyFollowers(followersRes.data?.map((r: any) => profilesMap[r.from_user_id]).filter(Boolean) || []);
    setMyFollowing(followingRes.data?.map((r: any) => profilesMap[r.to_user_id]).filter(Boolean) || []);
    setMyConnections(
      connRes.data?.map((r: any) => profilesMap[r.from_user_id === userId ? r.to_user_id : r.from_user_id]).filter(Boolean) || []
    );
    setPendingIncoming(
      pendInRes.data?.map((r: any) => ({ id: r.id, user: profilesMap[r.from_user_id] })).filter((r: any) => r.user) || []
    );
    setPendingOutgoing(
      pendOutRes.data?.map((r: any) => ({ id: r.id, user: profilesMap[r.to_user_id] })).filter((r: any) => r.user) || []
    );
    setLoading(false);
  };

  // Optimistic accept
  const handleAccept = useCallback(async (connectionId: string) => {
    const req = pendingIncoming.find((r) => r.id === connectionId);
    if (!req) return;
    // Optimistic: move from pending to connections
    setPendingIncoming((prev) => prev.filter((r) => r.id !== connectionId));
    setMyConnections((prev) => [...prev, req.user]);
    // Server update
    const { error } = await supabase.from("connections").update({ status: "accepted" }).eq("id", connectionId);
    if (error) {
      // Rollback
      setPendingIncoming((prev) => [...prev, req]);
      setMyConnections((prev) => prev.filter((u) => u.id !== req.user.id));
    }
  }, [pendingIncoming]);

  // Optimistic reject
  const handleReject = useCallback(async (connectionId: string) => {
    const req = pendingIncoming.find((r) => r.id === connectionId);
    if (!req) return;
    setPendingIncoming((prev) => prev.filter((r) => r.id !== connectionId));
    const { error } = await supabase.from("connections").update({ status: "rejected" }).eq("id", connectionId);
    if (error) {
      setPendingIncoming((prev) => [...prev, req]);
    }
  }, [pendingIncoming]);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const filterUsers = useCallback((users: NetworkUser[]) => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.display_name?.toLowerCase().includes(q) ||
        u.headline?.toLowerCase().includes(q) ||
        u.organization?.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const totalPending = pendingIncoming.length + pendingOutgoing.length;

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Column */}
          <div>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold font-heading text-foreground">Network</h1>
          <Button
            size="sm"
            className="gap-1.5 bg-accent text-accent-foreground hover:bg-gold hover:text-gold-foreground"
            onClick={() => setInviteOpen(true)}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Invite</span>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Manage your professional relationships and grow your network.</p>

        {/* Pending requests banner */}
        {pendingIncoming.length > 0 && (
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 mb-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <UserPlus className="h-5 w-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-card-foreground">
                {pendingIncoming.length} pending connection request{pendingIncoming.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-muted-foreground">Review and respond to grow your network</p>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search your network..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => <NetworkUserSkeleton key={i} />)}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="overflow-x-auto -mx-1 px-1 mb-4 scrollbar-hide">
              <TabsList className="inline-flex w-max sm:w-full justify-start bg-card border border-border rounded-xl h-11 p-1">
                <TabsTrigger value="connections" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm font-medium whitespace-nowrap px-3 sm:px-4">
                  Connections ({myConnections.length})
                </TabsTrigger>
                <TabsTrigger value="followers" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm font-medium whitespace-nowrap px-3 sm:px-4">
                  Followers ({myFollowers.length})
                </TabsTrigger>
                <TabsTrigger value="following" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm font-medium whitespace-nowrap px-3 sm:px-4">
                  Following ({myFollowing.length})
                </TabsTrigger>
                {totalPending > 0 && (
                  <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground text-sm font-medium whitespace-nowrap px-3 sm:px-4">
                    Pending ({totalPending})
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="connections" className="mt-0 space-y-2">
              <NetworkUserList users={filterUsers(myConnections)} getInitials={getInitials} emptyMessage="No connections yet. Start building your professional network!" showMessage />
            </TabsContent>

            <TabsContent value="followers" className="mt-0 space-y-2">
              <NetworkUserList users={filterUsers(myFollowers)} getInitials={getInitials} emptyMessage="No followers yet" />
            </TabsContent>

            <TabsContent value="following" className="mt-0 space-y-2">
              <NetworkUserList users={filterUsers(myFollowing)} getInitials={getInitials} emptyMessage="Not following anyone yet" />
            </TabsContent>

            {totalPending > 0 && (
              <TabsContent value="pending" className="mt-0 space-y-2">
                {pendingIncoming.map((req) => (
                  <div key={req.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                    <Link to={`/profile/${req.user.id}`}>
                      <NetworkAvatar src={req.user.avatar_url} initials={getInitials(req.user.full_name)} size="md" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${req.user.id}`} className="hover:underline">
                        <p className="text-sm font-semibold text-card-foreground truncate">
                          {req.user.display_name || req.user.full_name}
                          {req.user.verification_status === "verified" && <CheckCircle2 className="h-3.5 w-3.5 text-accent inline ml-1" />}
                        </p>
                      </Link>
                      {req.user.headline && <p className="text-xs text-muted-foreground truncate">{req.user.headline}</p>}
                      <p className="text-[10px] text-muted-foreground mt-0.5">Wants to connect</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="default" className="gap-1 bg-accent text-accent-foreground hover:bg-gold hover:text-gold-foreground" onClick={() => handleAccept(req.id)}>
                        <UserCheck className="h-3.5 w-3.5" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1" onClick={() => handleReject(req.id)}>
                        <UserMinus className="h-3.5 w-3.5" /> Decline
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingOutgoing.map((req) => (
                  <div key={req.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                    <Link to={`/profile/${req.user.id}`}>
                      <NetworkAvatar src={req.user.avatar_url} initials={getInitials(req.user.full_name)} size="md" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/profile/${req.user.id}`} className="hover:underline">
                        <p className="text-sm font-semibold text-card-foreground truncate">
                          {req.user.display_name || req.user.full_name}
                        </p>
                      </Link>
                      {req.user.headline && <p className="text-xs text-muted-foreground truncate">{req.user.headline}</p>}
                    </div>
                    <Badge variant="secondary" className="text-xs gap-1">
                      <Clock className="h-3 w-3" /> Sent
                    </Badge>
                  </div>
                ))}
              </TabsContent>
            )}

          </Tabs>
        )}
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <MemoizedNetworkSidebar
                connectionsCount={myConnections.length}
                followersCount={myFollowers.length}
                followingCount={myFollowing.length}
                pendingCount={pendingIncoming.length + pendingOutgoing.length}
                suggestions={[]}
                allUsers={[...myConnections, ...myFollowing, ...myFollowers]}
                getInitials={getInitials}
                onStatClick={(tab) => setActiveTab(tab)}
              />
            </div>
          </aside>
        </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </AppLayout>
  );
};

const NetworkUserList = memo(({ users, getInitials, emptyMessage, showMessage = false }: { users: NetworkUser[]; getInitials: (n: string) => string; emptyMessage: string; showMessage?: boolean }) => {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {users.map((user) => (
        <div key={user.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
          <Link to={`/profile/${user.id}`}>
            <NetworkAvatar src={user.avatar_url} initials={getInitials(user.full_name)} size="md" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/profile/${user.id}`} className="hover:underline">
              <p className="text-sm font-semibold text-card-foreground truncate">
                {user.display_name || user.full_name}
                {user.verification_status === "verified" && <CheckCircle2 className="h-3.5 w-3.5 text-accent inline ml-1" />}
              </p>
            </Link>
            {user.headline && <p className="text-xs text-muted-foreground truncate">{user.headline}</p>}
            {user.organization && <p className="text-[10px] text-muted-foreground mt-0.5">{user.organization}</p>}
          </div>
          <div className="flex items-center gap-1.5">
            {showMessage && (
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" asChild title="Message">
                <Link to={`/messages?user=${user.id}`}>
                  <MessageSquare className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link to={`/profile/${user.id}`}>View</Link>
            </Button>
          </div>
        </div>
      ))}
    </>
  );
});

export default Network;
