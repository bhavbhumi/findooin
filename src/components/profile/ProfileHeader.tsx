import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, UserPlus, UserCheck, Users, BarChart3, Building2, Clock,
  Calendar, Edit3, Briefcase, MessageSquare, MapPin, Globe, Shield, ShieldCheck,
} from "lucide-react";
import { format } from "date-fns";

interface ProfileHeaderProps {
  profile: ProfileData;
  roles: RoleData[];
  stats: ProfileStats;
  isOwnProfile: boolean;
  connectionStatus: any;
  follow: () => void;
  connect: () => void;
  connLoading: boolean;
}

export interface ProfileData {
  id: string;
  full_name: string;
  display_name: string | null;
  user_type: string;
  bio: string | null;
  avatar_url: string | null;
  verification_status: string;
  created_at: string;
  headline: string | null;
  location: string | null;
  organization: string | null;
  designation: string | null;
  website: string | null;
  experience_years: number | null;
  specializations: string[] | null;
  regulatory_ids: Record<string, string> | null;
  social_links: Record<string, string> | null;
  languages: string[] | null;
  certifications: string[] | null;
}

export interface RoleData {
  role: string;
  sub_type: string | null;
}

export interface ProfileStats {
  followers: number;
  following: number;
  connections: number;
  posts: number;
}

const roleIcon: Record<string, typeof BarChart3> = {
  investor: BarChart3,
  intermediary: UserCheck,
  issuer: Building2,
};

const roleColor: Record<string, string> = {
  investor: "bg-investor/10 text-investor border-investor/20",
  intermediary: "bg-intermediary/10 text-intermediary border-intermediary/20",
  issuer: "bg-issuer/10 text-issuer border-issuer/20",
};

const roleBannerGradient: Record<string, string> = {
  investor: "from-investor/20 via-investor/10 to-transparent",
  intermediary: "from-intermediary/20 via-intermediary/10 to-transparent",
  issuer: "from-issuer/20 via-issuer/10 to-transparent",
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export const ProfileHeader = ({
  profile, roles, stats, isOwnProfile, connectionStatus, follow, connect, connLoading,
}: ProfileHeaderProps) => {
  const primaryRole = roles[0]?.role;
  const bannerGradient = primaryRole ? roleBannerGradient[primaryRole] : "from-primary/15 via-primary/8 to-transparent";

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden mb-4">
      {/* Banner */}
      <div className={`h-32 sm:h-40 bg-gradient-to-br ${bannerGradient} relative`}>
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }} />
        {/* Verification shield on banner */}
        {profile.verification_status === "verified" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-accent/90 text-accent-foreground px-2.5 py-1 rounded-full text-xs font-semibold shadow-md">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </div>
        )}
        {profile.verification_status === "pending" && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-muted/90 text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium shadow-md">
            <Clock className="h-3.5 w-3.5" /> Pending Verification
          </div>
        )}
      </div>

      {/* Avatar + Identity */}
      <div className="px-5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-14 sm:-mt-16">
          {/* Avatar */}
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-muted flex items-center justify-center text-2xl sm:text-3xl font-bold text-muted-foreground shrink-0 overflow-hidden border-4 border-card shadow-lg ring-2 ring-border">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
            ) : (
              getInitials(profile.full_name)
            )}
          </div>

          {/* Name + Actions */}
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-card-foreground leading-tight">
                  {profile.display_name || profile.full_name}
                </h1>
                {profile.verification_status === "verified" && (
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                )}
              </div>
              {profile.display_name && profile.display_name !== profile.full_name && (
                <p className="text-sm text-muted-foreground">{profile.full_name}</p>
              )}
              {/* Headline */}
              {profile.headline && (
                <p className="text-sm text-card-foreground/80 mt-0.5 leading-snug">{profile.headline}</p>
              )}
              {/* Location + Org */}
              <div className="flex items-center gap-3 flex-wrap mt-1 text-xs text-muted-foreground">
                {profile.organization && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {profile.organization}
                  </span>
                )}
                {profile.designation && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" /> {profile.designation}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {profile.location}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {isOwnProfile ? (
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </Button>
              ) : (
                <>
                  {connectionStatus.following ? (
                    <Button variant="secondary" size="sm" className="gap-1.5" disabled>
                      <UserCheck className="h-3.5 w-3.5" /> Following
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={follow} disabled={connLoading}>
                      <UserPlus className="h-3.5 w-3.5" /> Follow
                    </Button>
                  )}
                  {connectionStatus.connected === "accepted" ? (
                    <Button variant="secondary" size="sm" className="gap-1.5" disabled>
                      <Users className="h-3.5 w-3.5" /> Connected
                    </Button>
                  ) : connectionStatus.connected === "pending" ? (
                    <Button variant="secondary" size="sm" className="gap-1.5" disabled>
                      <Clock className="h-3.5 w-3.5" /> Pending
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" className="gap-1.5" onClick={connect} disabled={connLoading}>
                      <Users className="h-3.5 w-3.5" /> Connect
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Role Badges Row */}
        <div className="flex items-center gap-2 flex-wrap pb-4">
          <Badge variant="outline" className="text-xs capitalize gap-1">
            <Briefcase className="h-3 w-3" />
            {profile.user_type}
          </Badge>
          {roles.map((r, i) => {
            const Icon = roleIcon[r.role];
            return (
              <span key={i} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${roleColor[r.role] || ""}`}>
                {Icon && <Icon className="h-3 w-3" />}
                <span className="capitalize">{r.sub_type || r.role}</span>
              </span>
            );
          })}
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
            <Calendar className="h-3 w-3" />
            Joined {format(new Date(profile.created_at), "MMM yyyy")}
          </span>
        </div>
      </div>

      {/* Bio snippet */}
      {profile.bio && (
        <div className="px-5 sm:px-6 pb-4">
          <p className="text-sm text-card-foreground leading-relaxed line-clamp-3">{profile.bio}</p>
        </div>
      )}

      {/* Stats Bar */}
      <div className="border-t border-border grid grid-cols-4 divide-x divide-border">
        {[
          { label: "Posts", value: stats.posts },
          { label: "Followers", value: stats.followers },
          { label: "Following", value: stats.following },
          { label: "Connections", value: stats.connections },
        ].map((stat) => (
          <button key={stat.label} className="py-3 text-center hover:bg-muted/50 transition-colors">
            <p className="text-lg sm:text-xl font-bold font-heading text-card-foreground leading-none">{stat.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
};
