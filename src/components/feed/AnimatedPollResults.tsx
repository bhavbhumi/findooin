import { motion } from "framer-motion";
import { memo } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PollOption {
  id: string;
  option_text: string;
  vote_count: number;
}

interface AnimatedPollResultsProps {
  options: PollOption[];
  userVoteId?: string | null;
  totalVotes: number;
}

const BAR_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-status-info",
  "bg-gold",
  "bg-status-highlight",
];

export const AnimatedPollResults = memo(({ options, userVoteId, totalVotes }: AnimatedPollResultsProps) => {
  if (!options || options.length === 0) return null;

  const maxVotes = Math.max(...options.map((o) => o.vote_count), 1);

  return (
    <div className="space-y-2 mb-3">
      {options.map((option, idx) => {
        const pct = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
        const isUserVote = option.id === userVoteId;
        const isLeading = option.vote_count === maxVotes && totalVotes > 0;

        return (
          <div key={option.id} className="relative">
            <div className={cn(
              "relative rounded-lg border px-3 py-2 overflow-hidden transition-all duration-200",
              isUserVote
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-secondary/20"
            )}>
              {/* Animated fill bar */}
              <motion.div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-lg opacity-15",
                  BAR_COLORS[idx % BAR_COLORS.length]
                )}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: idx * 0.1 }}
              />

              {/* Content */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {isUserVote && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  )}
                  <span className={cn(
                    "text-xs truncate",
                    isLeading ? "font-semibold text-card-foreground" : "text-muted-foreground"
                  )}>
                    {option.option_text}
                  </span>
                </div>
                <motion.span
                  className={cn(
                    "text-xs font-semibold tabular-nums shrink-0",
                    isLeading ? "text-primary" : "text-muted-foreground"
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                >
                  {pct}%
                </motion.span>
              </div>
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-muted-foreground text-right">
        {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
      </p>
    </div>
  );
});

AnimatedPollResults.displayName = "AnimatedPollResults";
