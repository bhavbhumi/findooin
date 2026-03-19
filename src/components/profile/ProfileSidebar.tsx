import {
  Award, Hash, GraduationCap, Globe, ExternalLink,
  Link2, MapPin, Briefcase, TrendingUp,
} from "lucide-react";
import type { ProfileData, RoleData, ProfileStats } from "./ProfileHeader";

interface ProfileSidebarProps {
  profile: ProfileData;
  roles: RoleData[];
  stats: ProfileStats;
  isOwnProfile: boolean;
  onNavigateToNetwork?: () => void;
  canViewNetwork?: boolean;
}

export const ProfileSidebar = ({ profile, roles, stats, isOwnProfile, onNavigateToNetwork, canViewNetwork = true }: ProfileSidebarProps) => {
  const hasRegulatoryIds = profile.regulatory_ids && Object.keys(profile.regulatory_ids).length > 0;
  const hasCertifications = profile.certifications && profile.certifications.length > 0;
  const hasSpecializations = profile.specializations && profile.specializations.length > 0;
  const hasSocialLinks = profile.social_links && Object.keys(profile.social_links).length > 0;

  return (
    <div className="space-y-4">
      {/* Quick Info */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">Info</h3>
        </div>
        <div className="p-4 space-y-2.5">
          {profile.location && (
            <div className="flex items-center gap-2 text-xs text-card-foreground">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate">{profile.location}</span>
            </div>
          )}
          {profile.organization && (
            <div className="flex items-center gap-2 text-xs text-card-foreground">
              <Briefcase className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate">{profile.organization}</span>
            </div>
          )}
          {profile.experience_years != null && (
            <div className="flex items-center gap-2 text-xs text-card-foreground">
              <TrendingUp className="h-3 w-3 text-muted-foreground shrink-0" />
              <span>{profile.experience_years} years experience</span>
            </div>
          )}
          {profile.website && (
            <a
              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-primary hover:underline"
            >
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate">{profile.website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="h-2.5 w-2.5 shrink-0" />
            </a>
          )}
        </div>
      </div>

      {/* Expertise & Credentials */}
      {(hasSpecializations || hasCertifications) && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">Expertise</h3>
          </div>
          <div className="p-4 space-y-3">
            {hasSpecializations && (
              <div>
                <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Specializations</p>
                <div className="flex flex-wrap gap-1">
                  {profile.specializations!.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-full">
                      <Hash className="h-2 w-2" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {hasCertifications && (
              <div className={hasSpecializations ? "pt-2 border-t border-border" : ""}>
                <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Certifications</p>
                <div className="space-y-1">
                  {profile.certifications!.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-muted/50 rounded-lg px-2.5 py-1.5">
                      <GraduationCap className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-[10px] font-medium text-card-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hasLanguages && (
              <div className={(hasSpecializations || hasCertifications) ? "pt-2 border-t border-border" : ""}>
                <p className="text-[10px] font-medium text-muted-foreground mb-1.5">Languages</p>
                <div className="flex flex-wrap gap-1">
                  {langArray.map((l: any, i: number) => {
                    const name = typeof l === "string" ? l : l.name;
                    const proficiency = typeof l === "object" ? l.proficiency : null;
                    const isMotherTongue = typeof l === "object" ? l.isMotherTongue : false;
                    return (
                      <span key={i} className="inline-flex items-center gap-0.5 text-[10px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">
                        {isMotherTongue ? <Star className="h-2.5 w-2.5 fill-current text-gold" /> : <Languages className="h-2.5 w-2.5" />}
                        {name}
                        {proficiency && <span className="opacity-60 capitalize">· {proficiency}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Links */}
      {hasSocialLinks && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
            <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">Links</h3>
          </div>
          <div className="p-4 space-y-2">
            {Object.entries(profile.social_links!).map(([platform, url]) => (
              <a
                key={platform}
                href={String(url).startsWith("http") ? String(url) : `https://${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                <span className="capitalize">{platform}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatItem = ({ label, value, onClick }: { label: string; value: number; onClick?: () => void }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className="text-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors disabled:cursor-default"
  >
    <p className="text-lg font-bold text-card-foreground leading-none">{value}</p>
    <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
  </button>
);
