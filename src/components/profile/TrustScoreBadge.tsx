import { useMemo } from "react";
import { Shield, ShieldCheck, TrendingUp, Star } from "lucide-react";
import type { ProfileData, ProfileStats } from "./ProfileHeader";

interface TrustScoreBadgeProps {
  profile: ProfileData;
  stats: ProfileStats;
  endorsementCount: number;
}

export const TrustScoreBadge = ({ profile, stats, endorsementCount }: TrustScoreBadgeProps) => {
  const { score, level, color } = useMemo(() => {
    let s = 0;

    // Verification (max 30)
    if (profile.verification_status === "verified") s += 30;
    else if (profile.verification_status === "pending") s += 10;

    // Account age (max 15) — 1 point per 30 days, capped
    const ageDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));
    s += Math.min(Math.floor(ageDays / 30), 15);

    // Network (max 20)
    s += Math.min(stats.connections * 2, 10);
    s += Math.min(stats.followers, 10);

    // Content (max 15)
    s += Math.min(stats.posts * 2, 15);

    // Endorsements (max 10)
    s += Math.min(endorsementCount * 2, 10);

    // Profile completeness proxy (max 10)
    let fields = 0;
    if (profile.headline) fields++;
    if (profile.bio) fields++;
    if (profile.organization) fields++;
    if (profile.specializations?.length) fields++;
    if (profile.certifications?.length) fields++;
    if (profile.regulatory_ids && Object.keys(profile.regulatory_ids).length > 0) fields++;
    if (profile.avatar_url) fields++;
    s += Math.min(fields * 1.5, 10);

    const score = Math.min(Math.round(s), 100);
    let level = "Newcomer";
    let color = "text-muted-foreground";
    if (score >= 80) { level = "Trusted"; color = "text-accent"; }
    else if (score >= 60) { level = "Established"; color = "text-primary"; }
    else if (score >= 40) { level = "Growing"; color = "text-gold"; }
    else if (score >= 20) { level = "Building"; color = "text-muted-foreground"; }

    return { score, level, color };
  }, [profile, stats, endorsementCount]);

  const Icon = score >= 60 ? ShieldCheck : Shield;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Star className="h-3.5 w-3.5 text-gold" />
        <h3 className="text-xs font-semibold font-heading text-card-foreground uppercase tracking-wider">Trust Score</h3>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className={`h-14 w-14 rounded-full border-[3px] flex items-center justify-center shrink-0 ${
            score >= 80 ? "border-accent bg-accent/10" :
            score >= 60 ? "border-primary bg-primary/10" :
            score >= 40 ? "border-gold bg-gold/10" :
            "border-muted bg-muted"
          }`}>
            <span className={`text-lg font-bold font-heading ${color}`}>{score}</span>
          </div>
          <div>
            <p className={`text-sm font-semibold ${color}`}>{level}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Based on verification, activity, network & endorsements
            </p>
          </div>
        </div>

        {/* Score breakdown bars */}
        <div className="mt-3 space-y-1.5">
          <ScoreBar label="Verification" value={profile.verification_status === "verified" ? 100 : profile.verification_status === "pending" ? 33 : 0} />
          <ScoreBar label="Network" value={Math.min((stats.connections * 10 + stats.followers * 5), 100)} />
          <ScoreBar label="Content" value={Math.min(stats.posts * 13, 100)} />
          <ScoreBar label="Endorsements" value={Math.min(endorsementCount * 20, 100)} />
        </div>
      </div>
    </div>
  );
};

const ScoreBar = ({ label, value }: { label: string; value: number }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] text-muted-foreground w-20 shrink-0">{label}</span>
    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
      <div
        className="h-full bg-primary rounded-full transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);
