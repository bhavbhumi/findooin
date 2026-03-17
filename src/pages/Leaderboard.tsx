import AppLayout from "@/components/AppLayout";
import { useLeaderboard } from "@/hooks/useGamification";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import { StreakIndicator } from "@/components/gamification/StreakIndicator";
import { FlairName, FlairAvatarWrapper } from "@/components/gamification/ProfileFlair";
import { useProfileFlair } from "@/hooks/useProfileFlair";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Trophy, Medal, Crown, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PageTransition } from "@/components/PageTransition";

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const RANK_ICONS = [Crown, Medal, Trophy];
const RANK_COLORS = ["hsl(46, 65%, 52%)", "hsl(220, 10%, 65%)", "hsl(30, 50%, 50%)"];

export default function Leaderboard() {
  usePageMeta({ title: "Leaderboard | FindOO", description: "Top contributors on FindOO" });
  const { data: entries, isLoading } = useLeaderboard(50);

  return (
    <AppLayout maxWidth="max-w-3xl">
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Trophy className="h-6 w-6 text-gold" />
            <h1 className="text-2xl font-bold font-heading text-card-foreground">Leaderboard</h1>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : !entries?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No XP earned yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <LeaderboardRow key={entry.user_id} entry={entry} rank={index + 1} />
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}

function LeaderboardRow({ entry, rank }: { entry: any; rank: number }) {
  const isTop3 = rank <= 3;
  const RankIcon = isTop3 ? RANK_ICONS[rank - 1] : null;
  const { data: flair } = useProfileFlair(entry.user_id);

  return (
    <Link
      to={`/profile/${entry.user_id}`}
      className={`flex items-center gap-3 rounded-xl border p-3 sm:p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${
        isTop3
          ? "border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/5"
          : "border-border bg-card hover:border-primary/15"
      }`}
    >
      {/* Rank */}
      <div className="w-8 text-center shrink-0">
        {RankIcon ? (
          <RankIcon className="h-5 w-5 mx-auto" style={{ color: RANK_COLORS[rank - 1] }} />
        ) : (
          <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
        )}
      </div>

      {/* Avatar with flair */}
      <FlairAvatarWrapper avatarBorder={flair?.avatar_border || "none"}>
        <AvatarWithFallback
          src={entry.profile.avatar_url}
          initials={getInitials(entry.profile.full_name)}
          className="h-10 w-10 rounded-full"
        />
      </FlairAvatarWrapper>

      {/* Name + Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-card-foreground truncate">
            <FlairName nameEffect={flair?.name_effect || "none"}>
              {entry.profile.display_name || entry.profile.full_name}
            </FlairName>
          </span>
          <LevelBadge level={entry.level} size="xs" />
        </div>
        {entry.current_streak > 0 && (
          <StreakIndicator streak={entry.current_streak} className="mt-0.5" />
        )}
      </div>

      {/* XP */}
      <div className="flex items-center gap-1 shrink-0">
        <Zap className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
        <span className="text-sm font-bold text-card-foreground">
          {entry.total_xp.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
