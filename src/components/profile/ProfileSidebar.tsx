import {
  ShieldCheck, BadgeCheck, Shield, Clock, Calendar, Landmark,
  Award, Hash, GraduationCap, Languages, Star, Globe, ExternalLink,
  Users, UserPlus, Link2, MapPin, Briefcase, TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import type { ProfileData, RoleData, ProfileStats } from "./ProfileHeader";
import { VerificationRequestForm } from "@/components/admin/VerificationRequestForm";

const regulatoryLabels: Record<string, string> = {
  sebi: "SEBI Registration",
  rbi: "RBI License",
  irdai: "IRDAI Registration",
  amfi: "AMFI ARN",
  pfrda: "PFRDA Registration",
  nse: "NSE Membership",
  bse: "BSE Membership",
  gstin: "GSTIN",
  cin: "CIN",
  pan: "PAN",
};

interface ProfileSidebarProps {
  profile: ProfileData;
  roles: RoleData[];
  stats: ProfileStats;
  isOwnProfile: boolean;
  onNavigateToNetwork?: () => void;
}

export const ProfileSidebar = ({ profile, roles, stats, isOwnProfile, onNavigateToNetwork }: ProfileSidebarProps) => {
  const hasRegulatoryIds = profile.regulatory_ids && Object.keys(profile.regulatory_ids).length > 0;
  const hasCertifications = profile.certifications && profile.certifications.length > 0;
  const hasSpecializations = profile.specializations && profile.specializations.length > 0;
  const langArray: any[] = Array.isArray(profile.languages) ? profile.languages : [];
  const hasLanguages = langArray.length > 0;
  const hasSocialLinks = profile.social_links && Object.keys(profile.social_links).length > 0;

  return (
    <div className="space-y-4">
      {/* Network Stats Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">Network</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <StatItem label="Followers" value={stats.followers} onClick={onNavigateToNetwork} />
            <StatItem label="Following" value={stats.following} onClick={onNavigateToNetwork} />
            <StatItem label="Connections" value={stats.connections} onClick={onNavigateToNetwork} />
            <StatItem label="Posts" value={stats.posts} />
          </div>
        </div>
      </div>

      {/* Trust & Verification */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">Trust</h3>
        </div>
        <div className="p-4 space-y-3">
          {/* Verification Status */}
          <div className="flex items-start gap-2.5">
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
              profile.verification_status === "verified" ? "bg-accent/10" : "bg-muted"
            }`}>
              {profile.verification_status === "verified" ? (
                <BadgeCheck className="h-3.5 w-3.5 text-accent" />
              ) : profile.verification_status === "pending" ? (
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-card-foreground capitalize">
                {profile.verification_status === "verified" ? "Verified" :
                 profile.verification_status === "pending" ? "Pending" : "Unverified"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                {profile.verification_status === "verified"
                  ? "Identity verified via documents."
                  : profile.verification_status === "pending"
                  ? "Under review."
                  : isOwnProfile ? "Submit docs for verification." : "Not verified."}
              </p>
              {isOwnProfile && profile.verification_status !== "verified" && roles.some(r => r.role === "issuer" || r.role === "intermediary") && (
                <div className="mt-2">
                  <VerificationRequestForm userId={profile.id} currentStatus={profile.verification_status} />
                </div>
              )}
            </div>
          </div>

          {/* Regulatory IDs */}
          {hasRegulatoryIds && (
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Landmark className="h-3 w-3" /> Registrations
              </p>
              <div className="space-y-1.5">
                {Object.entries(profile.regulatory_ids!).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-muted/50 rounded-lg px-2.5 py-1.5">
                    <span className="text-[10px] font-medium text-card-foreground">
                      {regulatoryLabels[key] || key.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member since */}
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
            <p className="text-[10px] text-muted-foreground">
              Member since {format(new Date(profile.created_at), "MMM yyyy")}
            </p>
          </div>
        </div>
      </div>

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
      {(hasSpecializations || hasCertifications || hasLanguages) && (
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
