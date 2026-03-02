import { useMemo } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { ProfileData, RoleData } from "./ProfileHeader";

interface ProfileCompletenessRingProps {
  profile: ProfileData;
  roles: RoleData[];
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

const FIELDS = [
  { key: "avatar_url", label: "Profile photo", weight: 15 },
  { key: "banner_url", label: "Cover image", weight: 5 },
  { key: "headline", label: "Headline", weight: 15 },
  { key: "bio", label: "Bio / About", weight: 10 },
  { key: "organization", label: "Organization", weight: 10 },
  { key: "designation", label: "Designation", weight: 10 },
  { key: "location", label: "Location", weight: 5 },
  { key: "specializations", label: "Specializations", weight: 10 },
  { key: "certifications", label: "Certifications", weight: 5 },
  { key: "regulatory_ids", label: "Regulatory IDs", weight: 10 },
  { key: "website", label: "Website", weight: 5 },
] as const;

function isFieldFilled(profile: ProfileData, key: string): boolean {
  const val = (profile as any)[key];
  if (val === null || val === undefined || val === "") return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val).length > 0;
  return true;
}

export const ProfileCompletenessRing = ({ profile, roles, isOwnProfile, onEditProfile }: ProfileCompletenessRingProps) => {
  const { score, missing } = useMemo(() => {
    let total = 0;
    let filled = 0;
    const missing: string[] = [];
    FIELDS.forEach((f) => {
      total += f.weight;
      if (isFieldFilled(profile, f.key)) {
        filled += f.weight;
      } else {
        missing.push(f.label);
      }
    });
    // Bonus for roles
    if (roles.length > 0) filled += 0; // roles are required, not bonus
    return { score: Math.round((filled / total) * 100), missing };
  }, [profile, roles]);

  const radius = 38;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "hsl(var(--accent))" : score >= 50 ? "hsl(var(--gold))" : "hsl(var(--destructive))";

  // Always show — visitors see read-only version

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">
          Profile Strength
        </h3>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-4">
          {/* Ring */}
          <div className="relative shrink-0">
            <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
              <circle cx="44" cy="44" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
              <circle
                cx="44" cy="44" r={radius} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={circumference} strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold font-heading text-card-foreground">{score}%</span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-card-foreground">
              {score >= 100 ? "All Star!" : score >= 80 ? "Almost there!" : score >= 50 ? "Good progress" : "Just getting started"}
            </p>
            {missing.length > 0 && isOwnProfile && (
              <div className="mt-2 space-y-1">
                {missing.slice(0, 3).map((m) => (
                  <div key={m} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <AlertCircle className="h-3 w-3 text-gold shrink-0" />
                    <span>Add {m}</span>
                  </div>
                ))}
                {missing.length > 3 && (
                  <p className="text-[10px] text-muted-foreground">+{missing.length - 3} more</p>
                )}
              </div>
            )}
            {isOwnProfile && score < 100 && onEditProfile && (
              <button
                onClick={onEditProfile}
                className="mt-2 text-xs font-medium text-primary hover:underline"
              >
                Complete profile →
              </button>
            )}
            {score === 100 && (
              <div className="flex items-center gap-1 mt-1 text-xs text-accent font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Profile complete!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
