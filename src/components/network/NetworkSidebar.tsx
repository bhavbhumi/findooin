import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, UserPlus, Eye, Link2, Activity, Award, Upload, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ContactImportDialog } from "@/components/network/ContactImportDialog";
import { ContactInviteSheet } from "@/components/network/ContactInviteSheet";
import { useContacts } from "@/hooks/useContacts";

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

interface NetworkSidebarProps {
  connectionsCount: number;
  followersCount: number;
  followingCount: number;
  pendingCount: number;
  suggestions: NetworkUser[];
  allUsers: NetworkUser[];
  getInitials: (name: string) => string;
  onStatClick?: (tab: string) => void;
}

const roleLabels: Record<string, string> = {
  individual: "Individual",
  entity: "Entity",
};

const roleColors: Record<string, string> = {
  individual: "bg-investor/10 text-investor",
  entity: "bg-issuer/10 text-issuer",
};

export function NetworkSidebar({
  connectionsCount,
  followersCount,
  followingCount,
  pendingCount,
  suggestions,
  allUsers,
  getInitials,
  onStatClick,
}: NetworkSidebarProps) {
  const [recentlyActive, setRecentlyActive] = useState<NetworkUser[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const { stats: contactStats } = useContacts();
  const peopleYouMayKnow = suggestions.slice(0, 5);

  // Industry spotlight — group by user_type, pick one from each
  const spotlightMap = new Map<string, NetworkUser>();
  allUsers.forEach((u) => {
    if (!spotlightMap.has(u.user_type) && u.headline) {
      spotlightMap.set(u.user_type, u);
    }
  });
  const spotlight = Array.from(spotlightMap.values()).slice(0, 3);

  // Fetch recently active users (those who posted recently)
  useEffect(() => {
    const fetchRecentlyActive = async () => {
      const { data: recentPosts } = await supabase
        .from("posts")
        .select("author_id")
        .order("created_at", { ascending: false })
        .limit(30);

      const authorIds = [...new Set(recentPosts?.map((p) => p.author_id) || [])].slice(0, 4);
      if (authorIds.length === 0) return;

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, headline, verification_status, user_type, organization")
        .in("id", authorIds);

      setRecentlyActive(profiles || []);
    };
    fetchRecentlyActive();
  }, []);

  return (
    <div className="space-y-4">
      {/* Network Stats */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Network Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatItem
            icon={<Link2 className="h-3.5 w-3.5" />}
            label="Connections"
            count={connectionsCount}
            onClick={() => onStatClick?.("connections")}
          />
          <StatItem
            icon={<Eye className="h-3.5 w-3.5" />}
            label="Followers"
            count={followersCount}
            onClick={() => onStatClick?.("followers")}
          />
          <StatItem
            icon={<UserPlus className="h-3.5 w-3.5" />}
            label="Following"
            count={followingCount}
            onClick={() => onStatClick?.("following")}
          />
          <StatItem
            icon={<Users className="h-3.5 w-3.5" />}
            label="Pending"
            count={pendingCount}
            highlight={pendingCount > 0}
            onClick={() => onStatClick?.("pending")}
          />
        </div>
      </div>

      {/* Import & Invite Contacts */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
          <Upload className="h-4 w-4 text-primary" />
          Grow Your Network
        </h3>
        <p className="text-xs text-muted-foreground">
          Import your phone contacts to find people on findoo and invite others.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setImportOpen(true)}>
            <Upload className="h-3.5 w-3.5" />
            Import
            {contactStats.total > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">{contactStats.total}</Badge>
            )}
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setInviteOpen(true)} disabled={contactStats.total === 0}>
            <Send className="h-3.5 w-3.5" />
            Invite
            {contactStats.notInvited > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1 ml-0.5">{contactStats.notInvited}</Badge>
            )}
          </Button>
        </div>
        {contactStats.total > 0 && (
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>{contactStats.invited} invited</span>
            <span>{contactStats.matched} on findoo</span>
          </div>
        )}
      </div>

      <ContactImportDialog open={importOpen} onOpenChange={setImportOpen} />
      <ContactInviteSheet open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* People You May Know */}
      {peopleYouMayKnow.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            People You May Know
          </h3>
          <div className="space-y-3">
            {peopleYouMayKnow.map((user) => (
              <SuggestionRow key={user.id} user={user} getInitials={getInitials} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Active */}
      {recentlyActive.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Recently Active
          </h3>
          <div className="space-y-3">
            {recentlyActive.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="flex items-center gap-2.5 group"
              >
                <div className="relative">
                  <NetworkAvatar src={user.avatar_url} initials={getInitials(user.full_name)} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                    {user.display_name || user.full_name}
                  </p>
                  {user.organization && (
                    <p className="text-[10px] text-muted-foreground truncate">{user.organization}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Industry Spotlight */}
      {spotlight.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Industry Spotlight
          </h3>
          <div className="space-y-3">
            {spotlight.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="flex items-center gap-2.5 group"
              >
                <NetworkAvatar src={user.avatar_url} initials={getInitials(user.full_name)} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                    {user.display_name || user.full_name}
                    {user.verification_status === "verified" && (
                      <CheckCircle2 className="h-3 w-3 text-accent inline ml-0.5" />
                    )}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 h-4 ${roleColors[user.user_type] || ""}`}>
                      {roleLabels[user.user_type] || user.user_type}
                    </Badge>
                    {user.headline && (
                      <span className="text-[10px] text-muted-foreground truncate">{user.headline}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Suggestion row with Follow action */
function SuggestionRow({ user, getInitials }: { user: NetworkUser; getInitials: (n: string) => string }) {
  const [followed, setFollowed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    await supabase.from("connections").insert({
      from_user_id: session.user.id,
      to_user_id: user.id,
      connection_type: "follow",
      status: "accepted",
    });
    setFollowed(true);
    setLoading(false);
    toast.success(`Following ${user.display_name || user.full_name}`);
  };

  return (
    <div className="flex items-center gap-2.5">
      <Link to={`/profile/${user.id}`} className="flex items-center gap-2.5 flex-1 min-w-0 group">
        <NetworkAvatar src={user.avatar_url} initials={getInitials(user.full_name)} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
            {user.display_name || user.full_name}
            {user.verification_status === "verified" && (
              <CheckCircle2 className="h-3 w-3 text-accent inline ml-0.5" />
            )}
          </p>
          {user.headline && (
            <p className="text-[10px] text-muted-foreground truncate">{user.headline}</p>
          )}
        </div>
      </Link>
      {followed ? (
        <span className="text-[10px] text-muted-foreground font-medium shrink-0">Following</span>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] px-2.5 shrink-0"
          onClick={handleFollow}
          disabled={loading}
        >
          Follow
        </Button>
      )}
    </div>
  );
}

function StatItem({
  icon,
  label,
  count,
  highlight = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  highlight?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-muted/50 p-2.5 text-center hover:bg-primary/5 transition-colors"
    >
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : "text-card-foreground"}`}>
        {count}
      </p>
    </button>
  );
}
