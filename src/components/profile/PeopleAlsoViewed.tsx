/**
 * PeopleAlsoViewed — Shows similar profiles based on shared roles and specializations.
 * Displayed on profile visitor view (not own profile).
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { CheckCircle2, Users } from "lucide-react";

interface Props {
  profileId: string;
  profileRoles: string[];
  profileLocation: string | null;
  isOwnProfile: boolean;
}

export function PeopleAlsoViewed({ profileId, profileRoles, profileLocation, isOwnProfile }: Props) {
  const { data: similar } = useQuery({
    queryKey: ["people-also-viewed", profileId],
    enabled: !isOwnProfile && !!profileId,
    queryFn: async () => {
      // Fetch profiles with same roles, excluding self
      const { data: roleUsers } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", profileRoles.length > 0 ? profileRoles as any : ["investor"])
        .neq("user_id", profileId)
        .limit(30);

      const userIds = [...new Set((roleUsers || []).map((r) => r.user_id))].slice(0, 6);
      if (userIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, headline, verification_status, location")
        .in("id", userIds)
        .eq("onboarding_completed", true);

      // Score: same location = +2, verified = +1
      return (profiles || [])
        .map((p) => ({
          ...p,
          score: (p.location === profileLocation ? 2 : 0) + (p.verification_status === "verified" ? 1 : 0),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
    },
    staleTime: 5 * 60_000,
  });

  if (!similar || similar.length === 0 || isOwnProfile) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        People Also Viewed
      </h3>
      <div className="space-y-3">
        {similar.map((p) => (
          <Link
            key={p.id}
            to={`/profile/${p.id}`}
            className="flex items-center gap-2.5 group"
          >
            <NetworkAvatar
              src={p.avatar_url}
              initials={p.full_name?.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "?"}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                {p.display_name || p.full_name}
                {p.verification_status === "verified" && (
                  <CheckCircle2 className="h-3 w-3 text-accent inline ml-0.5" />
                )}
              </p>
              {p.headline && (
                <p className="text-[10px] text-muted-foreground truncate">{p.headline}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
