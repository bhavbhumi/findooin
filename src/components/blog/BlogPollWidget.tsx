import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Vote, CheckCircle2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  usePollOptions,
  useUserPollVotes,
  useCastPollVote,
} from "@/hooks/useBlogInteractions";

interface Props {
  blogPostId: string;
}

export function BlogPollWidget({ blogPostId }: Props) {
  const [userId, setUserId] = useState<string>();
  const { data: options, isLoading } = usePollOptions(blogPostId);
  const { data: userVotes } = useUserPollVotes(blogPostId, userId);
  const castVote = useCastPollVote(blogPostId);

  const [selected, setSelected] = useState<string[]>([]);
  const hasVoted = (userVotes || []).length > 0;
  const isMulti = options?.[0]?.is_multi_select ?? false;
  const totalVotes = (options || []).reduce((sum, o) => sum + o.vote_count, 0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id));
  }, []);

  useEffect(() => {
    if (userVotes && userVotes.length > 0) {
      setSelected(userVotes);
    }
  }, [userVotes]);

  function handleSingleSelect(optionId: string) {
    setSelected([optionId]);
  }

  function handleMultiToggle(optionId: string) {
    setSelected((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  }

  async function handleVote() {
    if (!userId) {
      toast.error("Please sign in to vote");
      return;
    }
    if (selected.length === 0) {
      toast.error("Please select an option");
      return;
    }
    try {
      await castVote.mutateAsync({ optionIds: selected, userId });
      toast.success("Vote recorded!");
    } catch (err: any) {
      toast.error(err.message || "Failed to vote");
    }
  }

  if (isLoading || !options || options.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6 my-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-chart-4/15 text-chart-4">
          <Vote className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          {isMulti ? "Select all that apply" : "Cast your vote"}
        </h3>
        {totalVotes > 0 && (
          <span className="ml-auto text-xs text-muted-foreground">
            {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {options
          .sort((a, b) => a.position - b.position)
          .map((option) => {
            const pct = totalVotes > 0 ? Math.round((option.vote_count / totalVotes) * 100) : 0;
            const isSelected = selected.includes(option.id);
            const showResults = hasVoted;

            return (
              <motion.div
                key={option.id}
                className={`relative rounded-lg border transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30"
                }`}
                whileTap={{ scale: 0.99 }}
              >
                {/* Result bar background */}
                {showResults && (
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary/10"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                )}

                <button
                  className="relative w-full flex items-center gap-3 p-3.5 text-left"
                  onClick={() =>
                    hasVoted
                      ? null
                      : isMulti
                      ? handleMultiToggle(option.id)
                      : handleSingleSelect(option.id)
                  }
                  disabled={hasVoted && !castVote.isPending}
                >
                  {!hasVoted && (
                    <>
                      {isMulti ? (
                        <Checkbox
                          checked={isSelected}
                          className="shrink-0"
                          onCheckedChange={() => handleMultiToggle(option.id)}
                        />
                      ) : (
                        <div
                          className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            isSelected ? "border-primary" : "border-muted-foreground/40"
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {showResults && isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  )}

                  <span className="text-sm font-medium text-card-foreground flex-1">
                    {option.option_text}
                  </span>

                  {showResults && (
                    <span className="text-sm font-semibold text-foreground shrink-0">
                      {pct}%
                    </span>
                  )}
                </button>
              </motion.div>
            );
          })}
      </div>

      {!hasVoted && (
        <div className="mt-4 flex items-center gap-3">
          {userId ? (
            <Button
              onClick={handleVote}
              disabled={selected.length === 0 || castVote.isPending}
              className="gap-1.5"
            >
              <Vote className="h-4 w-4" />
              {castVote.isPending ? "Voting..." : "Submit Vote"}
            </Button>
          ) : (
            <Button variant="outline" asChild className="gap-1.5">
              <a href="/auth">
                <LogIn className="h-4 w-4" />
                Sign in to vote
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
