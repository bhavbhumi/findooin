import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/ui/hover-card";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import {
  UserPlus, MessageSquare, Share2, MapPin, Briefcase, ShieldCheck, Copy,
} from "lucide-react";
import { toast } from "sonner";
import { ROLE_CONFIG } from "@/lib/role-config";

interface QuickContactProps {
  children: React.ReactNode;
  profile: {
    id: string;
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    location: string | null;
    organization: string | null;
    verification_status: string;
  };
  primaryRole?: string | null;
  isOwnProfile: boolean;
  onConnect?: () => void;
  onFollow?: () => void;
  connectionStatus?: any;
}

export const QuickContactOverlay = ({
  children, profile, primaryRole, isOwnProfile, onConnect, onFollow, connectionStatus,
}: QuickContactProps) => {
  const navigate = useNavigate();
  const roleConf = primaryRole ? ROLE_CONFIG[primaryRole] : null;
  const name = profile.display_name || profile.full_name;

  const getInitials = (n: string) => n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.id}`);
    toast.success("Profile link copied");
  };

  const isMutualConnection = connectionStatus?.connected === "accepted";

  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-72 p-0" align="start" sideOffset={8}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <NetworkAvatar
              src={profile.avatar_url}
              initials={getInitials(profile.full_name)}
              size="md"
              roleColor={roleConf?.hslVar}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-card-foreground truncate">{name}</p>
                {profile.verification_status === "verified" && (
                  <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                )}
              </div>
              {profile.headline && (
                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight">{profile.headline}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {profile.organization && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Briefcase className="h-2.5 w-2.5" /> {profile.organization}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <MapPin className="h-2.5 w-2.5" /> {profile.location}
                  </span>
                )}
              </div>
              {roleConf && (
                <Badge variant="outline" className={`text-[9px] mt-1.5 gap-0.5 px-1.5 py-0 ${roleConf.bgColor}`}>
                  {(() => { const Icon = roleConf.icon; return <Icon className="h-2.5 w-2.5" />; })()}
                  {roleConf.label}
                </Badge>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border">
              {connectionStatus?.connected !== "accepted" && connectionStatus?.connected !== "pending" && (
                <Button variant="default" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={onConnect}>
                  <UserPlus className="h-3 w-3" /> Connect
                </Button>
              )}
              {isMutualConnection && (
                <Button variant="default" size="sm" className="h-7 text-[10px] gap-1 flex-1" onClick={() => navigate("/messages")}>
                  <MessageSquare className="h-3 w-3" /> Message
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1" onClick={handleCopy}>
                <Copy className="h-3 w-3" /> Copy
              </Button>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
