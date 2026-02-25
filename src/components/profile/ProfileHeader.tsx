import { useState } from "react";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, UserPlus, UserCheck, Users, BarChart3, Building2, Clock,
  Calendar, Edit3, Briefcase, MessageSquare, MapPin, Globe, Shield, ShieldCheck,
  Share2, Flag, Copy, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profile: ProfileData;
  roles: RoleData[];
  stats: ProfileStats;
  isOwnProfile: boolean;
  connectionStatus: any;
  follow: () => void;
  connect: () => void;
  connLoading: boolean;
  onEditProfile?: () => void;
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
  profile, roles, stats, isOwnProfile, connectionStatus, follow, connect, connLoading, onEditProfile,
}: ProfileHeaderProps) => {
  const primaryRole = roles[0]?.role;
  const bannerGradient = primaryRole ? roleBannerGradient[primaryRole] : "from-primary/15 via-primary/8 to-transparent";
  const [reportOpen, setReportOpen] = useState(false);

  const profileUrl = `${window.location.origin}/profile/${profile.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard");
  };

  const handleShareExternal = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.display_name || profile.full_name} on FindOO`,
        text: profile.headline || `Check out ${profile.display_name || profile.full_name}'s profile on FindOO`,
        url: profileUrl,
      }).catch(() => {});
    } else {
      handleCopyLink();
    }
  };

  const handleReport = () => {
    setReportOpen(false);
    toast.success("Report submitted. Our team will review this profile.");
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden mb-4">
        {/* Banner */}
        <div className={`h-32 sm:h-40 bg-gradient-to-br ${bannerGradient} relative`}>
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }} />
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
            {/* Avatar — Network-styled rounded square */}
            <NetworkAvatar
              src={profile.avatar_url}
              initials={getInitials(profile.full_name)}
              size="xl"
              roleColor={primaryRole ? `hsl(var(--${primaryRole}))` : undefined}
            />

            {/* Name + Info + Actions stacked */}
            <div className="flex-1 min-w-0">
              {/* Name */}
              <div className="flex items-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-card-foreground leading-tight break-words">
                  {profile.display_name || profile.full_name}
                </h1>
                {profile.verification_status === "verified" && (
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-1" />
                )}
              </div>
              {profile.display_name && profile.display_name !== profile.full_name && (
                <p className="text-sm text-muted-foreground">{profile.full_name}</p>
              )}
              {/* Headline */}
              {profile.headline && (
                <p className="text-sm text-card-foreground/80 mt-0.5 leading-snug line-clamp-2">{profile.headline}</p>
              )}
              {/* Designation + Organization + Location */}
              <div className="flex items-center gap-3 flex-wrap mt-1 text-xs text-muted-foreground">
                {profile.designation && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3 shrink-0" /> {profile.designation}
                  </span>
                )}
                {profile.organization && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3 shrink-0" /> {profile.organization}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" /> {profile.location}
                  </span>
                )}
              </div>

              {/* Action Buttons — below name block */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {isOwnProfile ? (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={onEditProfile}>
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

                {/* Share */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleCopyLink} className="gap-2 text-sm">
                      <Copy className="h-3.5 w-3.5" /> Copy profile link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareExternal} className="gap-2 text-sm">
                      <ExternalLink className="h-3.5 w-3.5" /> Share externally
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Report/Flag — only for other users */}
                {!isOwnProfile && (
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => setReportOpen(true)}>
                    <Flag className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Role Badges Row */}
          <div className="flex items-center gap-2 flex-wrap mt-3 pb-4">
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

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report this profile</DialogTitle>
            <DialogDescription>
              Help us keep FindOO safe. Let us know why you're reporting this profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 pt-2">
            {["Fake or misleading identity", "Impersonation", "Inappropriate content", "Spam or scam", "Other"].map((reason) => (
              <Button
                key={reason}
                variant="outline"
                className="w-full justify-start text-sm h-10"
                onClick={handleReport}
              >
                {reason}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
