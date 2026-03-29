import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calendar, MessageSquare, ArrowUp } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useFeatureRequests, type FeatureRequest } from "@/hooks/useFeedback";
import { cn } from "@/lib/utils";

const SWIMLANE_COLUMNS = [
  { status: "under_review", label: "Under Review", accent: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  { status: "planned", label: "Planned", accent: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30" },
  { status: "in_progress", label: "In Progress", accent: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30" },
  { status: "beta", label: "Beta", accent: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  { status: "released", label: "Released", accent: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" },
] as const;

const HEADER_COLORS: Record<string, string> = {
  under_review: "border-b-amber-500",
  planned: "border-b-blue-500",
  in_progress: "border-b-purple-500",
  beta: "border-b-emerald-500",
  released: "border-b-green-500",
};

function RoadmapCard({ feature, accent }: { feature: FeatureRequest; accent: string }) {
  const totalVotes = feature.inv_votes + feature.int_votes + feature.iss_votes + feature.enb_votes;

  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-2 transition-colors hover:bg-accent/30",
      "bg-card border-border"
    )}>
      <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{feature.title}</p>

      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", accent)}>
          {SWIMLANE_COLUMNS.find(c => c.status === feature.status)?.label}
        </Badge>
        {feature.is_regulatory && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/40 text-destructive">
            SEBI
          </Badge>
        )}
        {feature.expected_quarter && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5">
            <Calendar className="h-2.5 w-2.5" />
            {feature.expected_quarter}
          </Badge>
        )}
      </div>

      {feature.roadmap_rationale && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 italic">
          {feature.roadmap_rationale}
        </p>
      )}

      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
        <span className="flex items-center gap-1">
          <ArrowUp className="h-3 w-3" />
          {totalVotes}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {feature.comment_count}
        </span>
      </div>
    </div>
  );
}

export function RoadmapSwimlane() {
  const { data: features, isLoading, isError, error } = useFeatureRequests({ sortBy: "priority" });

  const columns = useMemo(() => {
    if (!features) return SWIMLANE_COLUMNS.map(c => ({ ...c, items: [] as FeatureRequest[] }));
    return SWIMLANE_COLUMNS.map(col => ({
      ...col,
      items: features.filter(f => f.status === col.status),
    }));
  }, [features]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {SWIMLANE_COLUMNS.map(col => (
          <div key={col.status} className="space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{(error as Error)?.message || "Failed to load roadmap"}</span>
      </div>
    );
  }

  const totalItems = columns.reduce((s, c) => s + c.items.length, 0);

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <span className="text-2xl">🗺️</span>
        </div>
        <h3 className="font-semibold text-foreground mb-1">Roadmap is empty</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Feature requests that move past "Under Review" will appear here.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="w-full">
      <div className="grid grid-cols-5 gap-4 min-w-[900px] pb-4">
        {columns.map(col => (
          <div key={col.status} className="space-y-3">
            {/* Column header */}
            <div className={cn(
              "rounded-lg border border-border border-b-2 bg-muted/30 px-3 py-2 flex items-center justify-between",
              HEADER_COLORS[col.status]
            )}>
              <span className="text-xs font-semibold text-foreground">{col.label}</span>
              <Badge variant="secondary" className="text-[10px] h-5 min-w-[20px] justify-center">
                {col.items.length}
              </Badge>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {col.items.map(feature => (
                <RoadmapCard key={feature.id} feature={feature} accent={col.accent} />
              ))}
              {col.items.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-4 text-center">
                  <p className="text-[11px] text-muted-foreground">No items</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
