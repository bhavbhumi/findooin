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
  onNavigateToNetwork?: () => void;
}

export interface ProfileData {
  id: string;
  full_name: string;
  display_name: string | null;
  user_type: string;
  bio: string | null;
  avatar_url: string | null;
  banner_url: string | null;
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
  profile, roles, stats, isOwnProfile, connectionStatus, follow, connect, connLoading, onEditProfile, onNavigateToNetwork,
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
        <div className={`h-28 sm:h-36 md:h-44 relative ${!profile.banner_url ? `bg-gradient-to-br ${bannerGradient}` : ''}`}>
          {profile.banner_url ? (
            <img src={profile.banner_url} alt="Profile banner" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }} />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
          {profile.verification_status === "pending" && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-muted/90 text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium shadow-md">
              <Clock className="h-3.5 w-3.5" /> Pending Verification
            </div>
          )}
        </div>

        {/* Avatar + Identity */}
        <div className="px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-10 sm:-mt-14 md:-mt-16">
            {/* Avatar — Network-styled rounded square */}
            <NetworkAvatar
              src={profile.avatar_url}
              initials={getInitials(profile.full_name)}
              size="xl"
              roleColor={primaryRole ? `hsl(var(--${primaryRole}))` : undefined}
            />

            {/* Name + Info + Actions stacked */}
            <div className="flex-1 min-w-0">
              {/* Verified badge above name */}
              {profile.verification_status === "verified" && (
                <div className="flex items-center gap-1 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                  <span className="text-xs font-semibold text-accent">Verified</span>
                </div>
              )}
              {/* Name */}
              <div className="flex items-start gap-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-heading text-card-foreground leading-tight break-words">
                  {profile.display_name || profile.full_name}
                </h1>
              </div>
              {profile.display_name && profile.display_name !== profile.full_name && (
                <p className="text-sm text-muted-foreground">{profile.full_name}</p>
              )}
              {/* Designation + Organization */}
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

          {/* Role Badges */}
          <div className="flex items-center gap-2 flex-wrap mt-3">
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
          </div>

          {/* Headline */}
          {profile.headline && (
            <p className="text-sm font-semibold text-card-foreground/80 mt-3 leading-snug">{profile.headline}</p>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed line-clamp-3">{profile.bio}</p>
          )}

          {/* Location + Followers/Following/Connections inline */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap mt-3 pb-4 text-[11px] sm:text-xs text-muted-foreground">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0" /> {profile.location}
              </span>
            )}
            {profile.location && <span className="text-border hidden sm:inline">·</span>}
            <button
              onClick={onNavigateToNetwork}
              className="hover:text-foreground transition-colors"
            >
              <span className="font-semibold text-card-foreground">{stats.followers}</span> Followers
            </button>
            <span className="text-border">·</span>
            <button
              onClick={onNavigateToNetwork}
              className="hover:text-foreground transition-colors"
            >
              <span className="font-semibold text-card-foreground">{stats.following}</span> Following
            </button>
            <span className="text-border">·</span>
            <button
              onClick={onNavigateToNetwork}
              className="hover:text-foreground transition-colors"
            >
              <span className="font-semibold text-card-foreground">{stats.connections}</span> Connections
            </button>
            <span className="text-border hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined {format(new Date(profile.created_at), "MMM yyyy")}
            </span>
          </div>
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
