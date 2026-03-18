/**
 * OpinionsSidebarWidget — Compact "Hot Opinions" widget for Feed sidebar.
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight, Users, TrendingUp } from "lucide-react";
import { useOpinions, OPINION_CATEGORIES, useOpinionVotes, computeVoteResults } from "@/hooks/useOpinions";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

function MiniOpinionRow({ opinion }: { opinion: any }) {
  const { data: votes = [] } = useOpinionVotes(opinion.id);
  const results = computeVoteResults(votes, opinion.options);
  const topOption = opinion.options.reduce((best: any, opt: any) => {
    const pct = results[opt.label]?.percentage || 0;
    return pct > (best.pct || 0) ? { label: opt.label, pct, color: opt.color } : best;
  }, { pct: 0 });

  return (
    <div className="flex items-start justify-between gap-2 py-2 border-b border-border/40 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-snug line-clamp-2">{opinion.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-[9px] h-4 px-1">
            {OPINION_CATEGORIES[opinion.category as keyof typeof OPINION_CATEGORIES]?.icon}
          </Badge>
          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
            <Users className="h-2.5 w-2.5" /> {votes.length}
          </span>
        </div>
      </div>
      {topOption.pct > 0 && (
        <div className="text-right shrink-0">
          <span className="text-sm font-bold tabular-nums" style={{ color: topOption.color }}>
            {topOption.pct}%
          </span>
          <p className="text-[9px] text-muted-foreground">{topOption.label}</p>
        </div>
      )}
    </div>
  );
}

export function OpinionsSidebarWidget() {
  const navigate = useNavigate();
  const { data: opinions, isLoading } = useOpinions(undefined, "active");
  const featured = opinions?.filter((o) => o.is_featured).slice(0, 3) || [];
  const display = featured.length > 0 ? featured : opinions?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-3 px-3">
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent className="px-3 pb-3 space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
        </CardContent>
      </Card>
    );
  }

  if (!display.length) return null;

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardHeader className="pb-1 pt-3 px-3">
        <CardTitle className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          Hot Opinions
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-2">
        {display.map((op) => (
          <div key={op.id} className="cursor-pointer hover:bg-muted/30 -mx-1 px-1 rounded" onClick={() => navigate(`/opinions?id=${op.id}`)}>
            <MiniOpinionRow opinion={op} />
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-[11px] h-7 mt-1 text-primary"
          onClick={() => navigate("/opinions")}
        >
          View all opinions <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
