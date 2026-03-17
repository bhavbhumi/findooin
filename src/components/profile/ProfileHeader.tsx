import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, UserPlus, UserCheck, Users, User, Clock,
  Calendar, Edit3, Briefcase, MessageSquare, MapPin, Globe, Shield, ShieldCheck,
  Share2, Flag, Copy, ExternalLink, UserMinus, Unlink, Compass, Mail,
  Building2,
} from "lucide-react";
import { ROLE_CONFIG } from "@/lib/role-config";
import { format } from "date-fns";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { FlairAvatarWrapper, FlairName } from "@/components/gamification/ProfileFlair";
import { useProfileFlair } from "@/hooks/useProfileFlair";

interface ProfileHeaderProps {
  profile: ProfileData;
  roles: RoleData[];
  stats: ProfileStats;
  isOwnProfile: boolean;
  connectionStatus: any;
  follow: () => void;
  connect: () => void;
  unfollow?: () => void;
  disconnect?: () => void;
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
  languages: any[] | null;
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


function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export const ProfileHeader = ({
  profile, roles, stats, isOwnProfile, connectionStatus, follow, connect, unfollow, disconnect, connLoading, onEditProfile, onNavigateToNetwork,
}: ProfileHeaderProps) => {
  const navigate = useNavigate();
  const { data: flair } = useProfileFlair(profile.id);
  const primaryRole = roles[0]?.role;
  const primaryRoleConf = primaryRole ? ROLE_CONFIG[primaryRole] : null;
  const bannerGradient = primaryRoleConf?.bannerGradient || "from-primary/15 via-primary/8 to-transparent";
  const [reportOpen, setReportOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [bannerError, setBannerError] = useState(false);

  const isEntity = profile.user_type === "entity";
  // For entities: show organization as primary name, full_name as secondary
  const primaryName = isEntity && profile.organization
    ? profile.organization
    : (profile.display_name || profile.full_name);
  const secondaryName = isEntity
    ? null
    : (profile.display_name && profile.display_name !== profile.full_name ? profile.full_name : null);

  const profileUrl = `${window.location.origin}/profile/${profile.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard");
  };

  const handleShareExternal = () => {
    if (navigator.share) {
      navigator.share({
        title: `${primaryName} on FindOO`,
        text: profile.headline || `Check out ${primaryName}'s profile on FindOO`,
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

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    // For now, copy invite link with a toast — real email sending can be added later
    const inviteLink = `${window.location.origin}/auth?ref=${profile.id}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success(`Invite link copied! Share it with ${inviteEmail}`);
    setInviteEmail("");
    setInviteOpen(false);
  };

  const isMutualConnection = connectionStatus.connected === "accepted";

  return (
    <>
      <div className="rounded-xl border border-border bg-card mb-4">
        {/* Banner */}
        <div className={`h-28 sm:h-36 md:h-44 relative rounded-t-xl overflow-hidden`}>
          {profile.banner_url && !bannerError ? (
            <img src={profile.banner_url} alt="Profile banner" className="absolute inset-0 w-full h-full object-cover" onError={() => setBannerError(true)} />
          ) : (
            <>
              {/* Animated gradient cover story */}
              <div className="absolute inset-0" style={{
                background: `linear-gradient(135deg, ${primaryRoleConf?.hslVar || 'hsl(var(--primary))'} 0%, hsl(var(--primary)) 30%, hsl(var(--gold)) 60%, ${primaryRoleConf?.hslVar || 'hsl(var(--accent))'} 100%)`,
                backgroundSize: "300% 300%",
                animation: "gradientShift 8s ease infinite",
                opacity: 0.25,
              }} />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              {/* Mesh pattern overlay */}
              <div className="absolute inset-0 opacity-[0.04]" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 10.5px),
                  repeating-linear-gradient(-45deg, transparent, transparent 10px, currentColor 10px, currentColor 10.5px)`,
              }} />
              {/* Floating dots animation */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full opacity-20"
                    style={{
                      width: `${20 + i * 8}px`,
                      height: `${20 + i * 8}px`,
                      background: primaryRoleConf?.hslVar || 'hsl(var(--primary))',
                      left: `${10 + i * 16}%`,
                      top: `${20 + (i % 3) * 25}%`,
                      animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />

          {/* Top-right banner actions: Share + Report (always visible) */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
            {profile.verification_status === "pending" && (
              <span className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm text-muted-foreground px-2.5 py-1 rounded-full text-xs font-medium shadow-md mr-1">
                <Clock className="h-3.5 w-3.5" /> Pending
              </span>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm text-foreground flex items-center justify-center shadow-md hover:bg-card transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
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
            {!isOwnProfile && (
              <button
                className="h-8 w-8 rounded-full bg-card/80 backdrop-blur-sm text-foreground flex items-center justify-center shadow-md hover:bg-card transition-colors"
                onClick={() => setReportOpen(true)}
              >
                <Flag className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Avatar + Identity — pushed lower with smaller negative margin */}
        <div className="px-4 sm:px-6 relative z-10">
          <div className="flex items-end gap-3 sm:gap-4 -mt-10 sm:-mt-12 md:-mt-14">
            {/* Round avatar overlapping banner */}
            <div className="shrink-0 relative z-10 group">
              <FlairAvatarWrapper avatarBorder={flair?.avatar_border || "none"}>
                <AvatarWithFallback
                  src={profile.avatar_url}
                  initials={getInitials(isEntity && profile.organization ? profile.organization : profile.full_name)}
                  className="h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 rounded-full overflow-hidden border-[3px] border-card shadow-lg"
                  textClassName="text-xl sm:text-2xl md:text-3xl"
                  roleColor={primaryRoleConf?.hslVar}
                />
              </FlairAvatarWrapper>
              {isOwnProfile && (
                <button
                  onClick={onEditProfile}
                  className="absolute bottom-0 right-0 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md border-2 border-card hover:bg-primary/90 transition-colors"
                  title="Edit Profile"
                >
                  <Edit3 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              )}
            </div>

            {/* Row 1: Name + Badge + Role Tag */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg md:text-xl font-bold font-heading text-card-foreground leading-tight break-words">
                  <FlairName nameEffect={flair?.name_effect || "none"}>
                    {primaryName}
                  </FlairName>
                </h1>
                {profile.verification_status === "verified" && (
                  <span className="inline-flex items-center gap-0.5 text-accent">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="text-[10px] sm:text-xs font-semibold">Verified</span>
                  </span>
                )}
                <Badge variant="outline" className="text-[10px] sm:text-xs capitalize gap-0.5 px-1.5 py-0">
                  {isEntity ? <Building2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <User className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                  {profile.user_type}
                </Badge>
                {primaryRoleConf && (() => {
                  const Icon = primaryRoleConf.icon;
                  return (
                    <span className={`inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 rounded-full border ${primaryRoleConf.bgColor}`}
                      title={primaryRoleConf.label}
                    >
                      <Icon className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </span>
                  );
                })()}
              </div>

              {/* Row 2: Contextual secondary info per profile type */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap mt-1 text-xs text-muted-foreground">
                {isEntity ? (
                  <>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3 shrink-0" /> Rep: {profile.full_name}
                    </span>
                    {profile.designation && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3 shrink-0" /> {profile.designation}
                      </span>
                    )}
                  </>
                ) : (
                  <>
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
                    {secondaryName && (
                      <span className="text-muted-foreground">({secondaryName})</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {!isOwnProfile && (
              <>
                {connectionStatus.following ? (
                  <Button variant="secondary" size="sm" className="gap-1.5" onClick={unfollow} disabled={connLoading}>
                    <UserCheck className="h-3.5 w-3.5" /> Following
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={follow} disabled={connLoading}>
                    <UserPlus className="h-3.5 w-3.5" /> Follow
                  </Button>
                )}
                {connectionStatus.connected === "accepted" ? (
                  <Button variant="secondary" size="sm" className="gap-1.5" onClick={disconnect} disabled={connLoading}>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-9 w-9 ${isMutualConnection ? "text-foreground" : "text-muted-foreground opacity-50 cursor-not-allowed"}`}
                  disabled={!isMutualConnection}
                  title={isMutualConnection ? "Send message" : "You must be connected to message"}
                  onClick={() => isMutualConnection && navigate("/messages")}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Own profile: Invite & Discover */}
            {isOwnProfile && (
              <>
                <Button variant="default" size="sm" className="gap-1.5" onClick={() => setInviteOpen(true)}>
                  <Mail className="h-3.5 w-3.5" /> Invite
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/discover")}>
                  <Compass className="h-3.5 w-3.5" /> Discover
                </Button>
              </>
            )}
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
            <button onClick={onNavigateToNetwork} className="hover:text-foreground transition-colors">
              <span className="font-semibold text-card-foreground">{stats.followers}</span> Followers
            </button>
            <span className="text-border">·</span>
            <button onClick={onNavigateToNetwork} className="hover:text-foreground transition-colors">
              <span className="font-semibold text-card-foreground">{stats.following}</span> Following
            </button>
            <span className="text-border">·</span>
            <button onClick={onNavigateToNetwork} className="hover:text-foreground transition-colors">
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
              <Button key={reason} variant="outline" className="w-full justify-start text-sm h-10" onClick={handleReport}>
                {reason}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to FindOO</DialogTitle>
            <DialogDescription>
              Invite a colleague or contact to join the FindOO platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="default" className="flex-1 gap-1.5" onClick={handleInvite}>
                <Mail className="h-3.5 w-3.5" /> Send Invite Link
              </Button>
              <Button variant="outline" onClick={() => {
                const inviteLink = `${window.location.origin}/auth?ref=${profile.id}`;
                navigator.clipboard.writeText(inviteLink);
                toast.success("Invite link copied to clipboard");
              }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              An invite link will be copied to your clipboard. You can share it via email or messaging.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
