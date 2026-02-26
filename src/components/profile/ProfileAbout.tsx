import {
  CheckCircle2, UserCheck, BarChart3, Building2, Clock,
  Calendar, Briefcase, MapPin, Globe, Shield, ShieldCheck,
  Award, Languages, GraduationCap, FileCheck, ExternalLink,
  Landmark, Hash, BadgeCheck, TrendingUp, Users, Star,
} from "lucide-react";
import { format } from "date-fns";
import type { ProfileData, RoleData } from "./ProfileHeader";

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

interface ProfileAboutProps {
  profile: ProfileData;
  roles: RoleData[];
  isOwnProfile: boolean;
}

export const ProfileAbout = ({ profile, roles, isOwnProfile }: ProfileAboutProps) => {
  const hasRegulatoryIds = profile.regulatory_ids && Object.keys(profile.regulatory_ids).length > 0;
  const hasCertifications = profile.certifications && profile.certifications.length > 0;
  const hasSpecializations = profile.specializations && profile.specializations.length > 0;
  // Languages is now jsonb (array of objects) or legacy text[]
  const langArray: any[] = Array.isArray(profile.languages) ? profile.languages : [];
  const hasLanguages = langArray.length > 0;
  const hasSocialLinks = profile.social_links && Object.keys(profile.social_links).length > 0;
  const hasAnyDetail = profile.bio || profile.organization || profile.designation || profile.location || profile.website || profile.experience_years || hasRegulatoryIds || hasCertifications || hasSpecializations || hasLanguages;

  return (
    <div className="space-y-4">
      {/* Trust & Verification Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold font-heading text-card-foreground">Trust & Verification</h3>
        </div>
        <div className="p-5 space-y-4">
          {/* Verification Status */}
          <div className="flex items-start gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
              profile.verification_status === "verified" ? "bg-accent/10" : "bg-muted"
            }`}>
              {profile.verification_status === "verified" ? (
                <BadgeCheck className="h-4 w-4 text-accent" />
              ) : profile.verification_status === "pending" ? (
                <Clock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Shield className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground capitalize">
                {profile.verification_status === "verified" ? "Identity Verified" : 
                 profile.verification_status === "pending" ? "Verification Pending" : "Not Yet Verified"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {profile.verification_status === "verified"
                  ? "This profile has been verified through regulatory documentation review."
                  : profile.verification_status === "pending"
                  ? "Verification documents have been submitted and are under review."
                  : isOwnProfile ? "Submit your regulatory documents to earn a verified badge." : "This profile has not been verified yet."}
              </p>
            </div>
          </div>

          {/* Regulatory Registrations */}
          {hasRegulatoryIds && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                <Landmark className="h-3 w-3" /> Regulatory Registrations
              </p>
              <div className="space-y-2.5">
                {Object.entries(profile.regulatory_ids!).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                    <span className="text-xs font-medium text-card-foreground">
                      {regulatoryLabels[key] || key.toUpperCase()}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground tracking-wide">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account Age — trust signal */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Member since {format(new Date(profile.created_at), "MMMM yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))} days on the platform
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Details Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold font-heading text-card-foreground">Professional Details</h3>
        </div>
        <div className="p-5 space-y-4">
          {/* Roles */}
          {roles.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Roles & Capacities</p>
              <div className="flex items-center gap-2 flex-wrap">
                {roles.map((r, i) => {
                  const Icon = roleIcon[r.role];
                  return (
                    <span key={i} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${roleColor[r.role] || ""}`}>
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                      <span className="capitalize">{r.sub_type || r.role}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.organization && (
              <InfoItem icon={Building2} label="Organization" value={profile.organization} />
            )}
            {profile.designation && (
              <InfoItem icon={Briefcase} label="Designation" value={profile.designation} />
            )}
            {profile.location && (
              <InfoItem icon={MapPin} label="Location" value={profile.location} />
            )}
            {profile.experience_years != null && (
              <InfoItem icon={TrendingUp} label="Experience" value={`${profile.experience_years} years`} />
            )}
            <InfoItem icon={Users} label="Account Type" value={profile.user_type} capitalize />
          </div>

          {/* Website */}
          {profile.website && (
            <div className="pt-2 border-t border-border">
              <a
                href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5" />
                {profile.website.replace(/^https?:\/\//, "")}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Expertise & Credentials Card */}
      {(hasSpecializations || hasCertifications || hasLanguages) && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold font-heading text-card-foreground">Expertise & Credentials</h3>
          </div>
          <div className="p-5 space-y-4">
            {/* Specializations */}
            {hasSpecializations && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Specializations</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {profile.specializations!.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs font-medium bg-primary/5 text-primary border border-primary/10 px-2.5 py-1 rounded-full">
                      <Hash className="h-2.5 w-2.5" /> {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {hasCertifications && (
              <div className={hasSpecializations ? "pt-3 border-t border-border" : ""}>
                <p className="text-xs font-medium text-muted-foreground mb-2">Certifications & Qualifications</p>
                <div className="space-y-2">
                  {profile.certifications!.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                      <GraduationCap className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs font-medium text-card-foreground">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {hasLanguages && (
              <div className={(hasSpecializations || hasCertifications) ? "pt-3 border-t border-border" : ""}>
                <p className="text-xs font-medium text-muted-foreground mb-2">Languages</p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {langArray.map((l: any, i: number) => {
                    const name = typeof l === "string" ? l : l.name;
                    const proficiency = typeof l === "object" ? l.proficiency : null;
                    const isMotherTongue = typeof l === "object" ? l.isMotherTongue : false;
                    return (
                      <span key={i} className="inline-flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full">
                        {isMotherTongue ? <Star className="h-3 w-3 fill-current text-gold" /> : <Languages className="h-3 w-3" />}
                        {name}
                        {proficiency && <span className="text-[10px] opacity-60 capitalize">· {proficiency}</span>}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bio / About Me Card */}
      {profile.bio && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold font-heading text-card-foreground">About</h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-card-foreground leading-relaxed whitespace-pre-line">{profile.bio}</p>
          </div>
        </div>
      )}

      {/* Social Links */}
      {hasSocialLinks && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold font-heading text-card-foreground">Links</h3>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-2">
              {Object.entries(profile.social_links!).map(([platform, url]) => (
                <a
                  key={platform}
                  href={String(url).startsWith("http") ? String(url) : `https://${url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span className="capitalize">{platform}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state for own profile */}
      {isOwnProfile && !hasAnyDetail && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-card-foreground">Complete your profile to build trust</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Add your professional details, regulatory registrations, specializations, and certifications to establish credibility on FindOO.
          </p>
        </div>
      )}
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value, capitalize = false }: {
  icon: typeof Briefcase;
  label: string;
  value: string;
  capitalize?: boolean;
}) => (
  <div className="flex items-start gap-2.5 bg-muted/30 rounded-lg px-3 py-2.5">
    <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-sm font-medium text-card-foreground ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  </div>
);
