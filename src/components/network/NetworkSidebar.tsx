import { Link } from "react-router-dom";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { CheckCircle2, Users, UserPlus, Eye, Link2, TrendingUp, Activity, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
}

const roleLabels: Record<string, string> = {
  investor: "Investor",
  intermediary: "Intermediary",
  issuer: "Issuer",
};

const roleColors: Record<string, string> = {
  investor: "bg-investor/10 text-investor",
  intermediary: "bg-intermediary/10 text-intermediary",
  issuer: "bg-issuer/10 text-issuer",
};

export function NetworkSidebar({
  connectionsCount,
  followersCount,
  followingCount,
  pendingCount,
  suggestions,
  allUsers,
  getInitials,
}: NetworkSidebarProps) {
  // People you may know — first 5 suggestions
  const peopleYouMayKnow = suggestions.slice(0, 5);

  // Recently active — pick random users (simulated with first few from allUsers)
  const recentlyActive = allUsers.slice(0, 4);

  // Industry spotlight — group by user_type, pick one from each
  const spotlightMap = new Map<string, NetworkUser>();
  allUsers.forEach((u) => {
    if (!spotlightMap.has(u.user_type) && u.headline) {
      spotlightMap.set(u.user_type, u);
    }
  });
  const spotlight = Array.from(spotlightMap.values()).slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Network Stats */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          Network Stats
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatItem icon={<Link2 className="h-3.5 w-3.5" />} label="Connections" count={connectionsCount} />
          <StatItem icon={<Eye className="h-3.5 w-3.5" />} label="Followers" count={followersCount} />
          <StatItem icon={<UserPlus className="h-3.5 w-3.5" />} label="Following" count={followingCount} />
          <StatItem
            icon={<Users className="h-3.5 w-3.5" />}
            label="Pending"
            count={pendingCount}
            highlight={pendingCount > 0}
          />
        </div>
      </div>

      {/* People You May Know */}
      {peopleYouMayKnow.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-primary" />
            People You May Know
          </h3>
          <div className="space-y-3">
            {peopleYouMayKnow.map((user) => (
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
                  {user.headline && (
                    <p className="text-[10px] text-muted-foreground truncate">{user.headline}</p>
                  )}
                </div>
              </Link>
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

function StatItem({
  icon,
  label,
  count,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-2.5 text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px] font-medium">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : "text-card-foreground"}`}>
        {count}
      </p>
    </div>
  );
}
