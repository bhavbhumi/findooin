import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Sparkles, Wrench, Bug, ThumbsUp, Heart, PartyPopper } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";

interface ChangelogEntry {
  id: string;
  version: string;
  release_date: string;
  features_added: string[];
  improvements: string[];
  bug_fixes: string[];
  created_at: string;
  user_reaction?: string | null;
  reaction_counts: Record<string, number>;
}

const REACTION_ICONS: Record<string, { icon: typeof ThumbsUp; label: string }> = {
  thumbsup: { icon: ThumbsUp, label: "👍" },
  love: { icon: Heart, label: "❤️" },
  celebrate: { icon: PartyPopper, label: "🎉" },
};

function parseJsonArray(val: Json): string[] {
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === "string");
  return [];
}

function useChangelog() {
  const { userId } = useRole();

  return useQuery({
    queryKey: ["changelog-entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .order("release_date", { ascending: false })
        .limit(50);
      if (error) throw error;

      const entryIds = (data || []).map((e: any) => e.id);

      // Fetch all reactions for these entries
      const { data: reactions } = entryIds.length
        ? await supabase.from("changelog_reactions").select("*").in("changelog_id", entryIds)
        : { data: [] };

      // Fetch user's own reactions
      let userReactions: Record<string, string> = {};
      if (userId && entryIds.length) {
        const { data: ur } = await supabase
          .from("changelog_reactions")
          .select("changelog_id, reaction_type")
          .eq("user_id", userId)
          .in("changelog_id", entryIds);
        (ur || []).forEach((r: any) => { userReactions[r.changelog_id] = r.reaction_type; });
      }

      // Aggregate reaction counts
      const countMap = new Map<string, Record<string, number>>();
      (reactions || []).forEach((r: any) => {
        const m = countMap.get(r.changelog_id) || {};
        m[r.reaction_type] = (m[r.reaction_type] || 0) + 1;
        countMap.set(r.changelog_id, m);
      });

      return (data || []).map((e: any) => ({
        ...e,
        features_added: parseJsonArray(e.features_added),
        improvements: parseJsonArray(e.improvements),
        bug_fixes: parseJsonArray(e.bug_fixes),
        user_reaction: userReactions[e.id] || null,
        reaction_counts: countMap.get(e.id) || {},
      })) as ChangelogEntry[];
    },
  });
}

function useToggleReaction() {
  const { userId } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ changelogId, reactionType }: { changelogId: string; reactionType: string }) => {
      if (!userId) throw new Error("Not authenticated");

      // Delete existing reaction first
      await supabase
        .from("changelog_reactions")
        .delete()
        .eq("changelog_id", changelogId)
        .eq("user_id", userId);

      // Insert new one if not toggling off
      const { error } = await supabase.from("changelog_reactions").insert({
        changelog_id: changelogId,
        user_id: userId,
        reaction_type: reactionType,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["changelog-entries"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to react"),
  });
}

export function ChangelogTimeline() {
  const { data: entries, isLoading, isError, error } = useChangelog();
  const toggleReaction = useToggleReaction();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{(error as Error)?.message || "Failed to load changelog"}</span>
      </div>
    );
  }

  if (!entries?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="font-semibold text-foreground mb-1">No changelog entries yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Release notes will appear here as findoo ships new updates.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border hidden sm:block" />

      <div className="space-y-6">
        {entries.map((entry) => (
          <div key={entry.id} className="relative sm:pl-10">
            {/* Timeline dot */}
            <div className="absolute left-2.5 top-5 h-3 w-3 rounded-full bg-primary border-2 border-background hidden sm:block" />

            <div className="rounded-lg border border-border bg-card p-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">{entry.version}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.release_date), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              {/* Sections */}
              {entry.features_added.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    New Features
                  </div>
                  <ul className="space-y-1 pl-5">
                    {entry.features_added.map((f, i) => (
                      <li key={i} className="text-sm text-foreground list-disc">{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.improvements.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    <Wrench className="h-3.5 w-3.5" />
                    Improvements
                  </div>
                  <ul className="space-y-1 pl-5">
                    {entry.improvements.map((f, i) => (
                      <li key={i} className="text-sm text-foreground list-disc">{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.bug_fixes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Bug className="h-3.5 w-3.5" />
                    Bug Fixes
                  </div>
                  <ul className="space-y-1 pl-5">
                    {entry.bug_fixes.map((f, i) => (
                      <li key={i} className="text-sm text-foreground list-disc">{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reactions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {Object.entries(REACTION_ICONS).map(([key, { label }]) => {
                  const count = entry.reaction_counts[key] || 0;
                  const isActive = entry.user_reaction === key;
                  return (
                    <Button
                      key={key}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 px-2 text-xs gap-1",
                        isActive && "bg-primary/10 text-primary"
                      )}
                      onClick={() => toggleReaction.mutate({ changelogId: entry.id, reactionType: key })}
                    >
                      <span>{label}</span>
                      {count > 0 && <span>{count}</span>}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
