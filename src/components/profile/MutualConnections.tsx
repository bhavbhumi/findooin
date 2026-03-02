import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Users, Eye, UserPlus } from "lucide-react";

interface MiniProfile {
  id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
}

interface MutualConnectionsProps {
  profileId: string;
  currentUserId: string | null;
  isOwnProfile: boolean;
}

export const MutualConnections = ({ profileId, currentUserId, isOwnProfile }: MutualConnectionsProps) => {
  const [mutuals, setMutuals] = useState<MiniProfile[]>([]);
  const [alsoViewed, setAlsoViewed] = useState<MiniProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }
    loadData();
  }, [profileId, currentUserId, isOwnProfile]);

  const loadData = async () => {
    setLoading(true);

    let mutualIds: string[] = [];

    if (!isOwnProfile) {
      // Get my connections
      const { data: myConns } = await supabase
        .from("connections")
        .select("from_user_id, to_user_id")
        .eq("connection_type", "connect")
        .eq("status", "accepted")
        .or(`from_user_id.eq.${currentUserId},to_user_id.eq.${currentUserId}`);

      const myConnIds = new Set(
        (myConns || []).map((c: any) => c.from_user_id === currentUserId ? c.to_user_id : c.from_user_id)
      );

      // Get their connections
      const { data: theirConns } = await supabase
        .from("connections")
        .select("from_user_id, to_user_id")
        .eq("connection_type", "connect")
        .eq("status", "accepted")
        .or(`from_user_id.eq.${profileId},to_user_id.eq.${profileId}`);

      const theirConnIds = new Set(
        (theirConns || []).map((c: any) => c.from_user_id === profileId ? c.to_user_id : c.from_user_id)
      );

      // Mutual = intersection
      mutualIds = [...myConnIds].filter((id) => theirConnIds.has(id) && id !== profileId && id !== currentUserId);
    }

    // "People Also Viewed" — for own profile use similar profiles by location/role
    let alsoViewedIds: string[] = [];
    if (isOwnProfile) {
      // Suggest similar profiles (same user_type, different user)
      const { data: similar } = await supabase
        .from("profiles")
        .select("id")
        .neq("id", profileId)
        .limit(5);
      alsoViewedIds = (similar || []).map((p: any) => p.id);
    } else {
      const { data: viewerIds } = await supabase
        .from("profile_views")
        .select("viewer_id")
        .eq("profile_id", profileId)
        .neq("viewer_id", currentUserId!)
        .limit(20);

      if (viewerIds && viewerIds.length > 0) {
        const vIds = viewerIds.map((v: any) => v.viewer_id);
        const { data: otherViews } = await supabase
          .from("profile_views")
          .select("profile_id")
          .in("viewer_id", vIds)
          .neq("profile_id", profileId)
          .neq("profile_id", currentUserId!)
          .limit(50);

        const counts: Record<string, number> = {};
        (otherViews || []).forEach((v: any) => { counts[v.profile_id] = (counts[v.profile_id] || 0) + 1; });
        alsoViewedIds = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([id]) => id);
      }
    }

    // Fetch profiles
    const allIds = [...new Set([...mutualIds.slice(0, 6), ...alsoViewedIds])];
    if (allIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, headline")
        .in("id", allIds);

      const map: Record<string, MiniProfile> = {};
      (profiles || []).forEach((p: any) => { map[p.id] = p; });

      setMutuals(mutualIds.slice(0, 6).map((id) => map[id]).filter(Boolean));
      setAlsoViewed(alsoViewedIds.map((id) => map[id]).filter(Boolean));
    }

    setLoading(false);
  };

  if (loading) return null;
  if (mutuals.length === 0 && alsoViewed.length === 0) return null;

  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-4">
      {/* Mutual Connections */}
      {mutuals.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-accent" />
            <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">
              {mutuals.length} Mutual Connection{mutuals.length > 1 ? "s" : ""}
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {mutuals.map((u) => (
              <Link key={u.id} to={`/profile/${u.id}`} className="flex items-center gap-2.5 hover:bg-muted/50 rounded-lg p-1.5 -mx-1.5 transition-colors">
                <NetworkAvatar src={u.avatar_url} initials={getInitials(u.full_name)} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-card-foreground truncate">{u.display_name || u.full_name}</p>
                  {u.headline && <p className="text-[10px] text-muted-foreground truncate">{u.headline}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* People Also Viewed */}
      {alsoViewed.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">
              People Also Viewed
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {alsoViewed.map((u) => (
              <Link key={u.id} to={`/profile/${u.id}`} className="flex items-center gap-2.5 hover:bg-muted/50 rounded-lg p-1.5 -mx-1.5 transition-colors">
                <NetworkAvatar src={u.avatar_url} initials={getInitials(u.full_name)} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-card-foreground truncate">{u.display_name || u.full_name}</p>
                  {u.headline && <p className="text-[10px] text-muted-foreground truncate">{u.headline}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
