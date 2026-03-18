/**
 * OpinionDetailSheet — Full detail view with charts, comments, and role-split analysis.
 */
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, Users, Send, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { formatDistanceToNow, format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  type Opinion, OPINION_CATEGORIES,
  useOpinionVotes, useOpinionComments, useAddOpinionComment, computeVoteResults,
} from "@/hooks/useOpinions";
import { useRole } from "@/contexts/RoleContext";
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { OpinionCard } from "./OpinionCard";

interface OpinionDetailSheetProps {
  opinionId: string | null;
  opinion: Opinion | null;
  open: boolean;
  onClose: () => void;
}

export function OpinionDetailSheet({ opinionId, opinion, open, onClose }: OpinionDetailSheetProps) {
  const { data: votes = [] } = useOpinionVotes(opinionId);
  const { data: comments = [] } = useOpinionComments(opinionId);
  const addComment = useAddOpinionComment();
  const { userId } = useRole();
  const [comment, setComment] = useState("");
  const [tab, setTab] = useState("results");

  if (!opinion) return null;

  const results = computeVoteResults(votes, opinion.options);
  const cat = OPINION_CATEGORIES[opinion.category];
  const isClosed = opinion.status === "closed" || isPast(new Date(opinion.ends_at));

  const pieData = opinion.options.map((opt) => ({
    name: opt.label,
    value: results[opt.label]?.count || 0,
    color: opt.color,
  }));

  const handlePostComment = () => {
    if (!comment.trim() || !opinionId) return;
    addComment.mutate({ opinionId, content: comment.trim() });
    setComment("");
  };

  // Role-wise split
  const roleLabels: Record<string, string> = {
    issuer: "Issuers",
    intermediary: "Intermediaries",
    admin: "Admin",
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px] gap-1">
              {cat.icon} {cat.label}
            </Badge>
            {isClosed && <Badge variant="outline" className="text-[10px]">Closed</Badge>}
          </div>
          <SheetTitle className="text-lg leading-snug">{opinion.title}</SheetTitle>
          {opinion.description && (
            <p className="text-sm text-muted-foreground">{opinion.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {votes.length} voted</span>
            <span>{isClosed ? `Closed ${format(new Date(opinion.ends_at), "PP")}` : `Ends ${formatDistanceToNow(new Date(opinion.ends_at), { addSuffix: true })}`}</span>
          </div>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="w-full grid grid-cols-3 h-9">
            <TabsTrigger value="results" className="text-xs gap-1">
              <BarChart3 className="h-3 w-3" /> Results
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-xs gap-1">
              <PieChart className="h-3 w-3" /> Analysis
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs gap-1">
              <Send className="h-3 w-3" /> Comments ({comments.length})
            </TabsTrigger>
          </TabsList>

          {/* Results Tab */}
          <TabsContent value="results" className="mt-4 space-y-4">
            {/* Percentage bars */}
            <div className="space-y-3">
              {opinion.options.map((opt) => {
                const r = results[opt.label];
                return (
                  <div key={opt.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{opt.label}</span>
                      <span className="font-bold tabular-nums">{r?.percentage || 0}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: opt.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${r?.percentage || 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{r?.count || 0} votes</p>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Analysis Tab: Pie chart + Role split */}
          <TabsContent value="analysis" className="mt-4 space-y-6">
            {/* Donut chart */}
            {votes.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>

                {/* Role-wise split */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-primary" /> Role-wise Breakdown
                  </h4>
                  <div className="grid gap-3">
                    {Object.entries(roleLabels).map(([role, label]) => {
                      const roleVotes = votes.filter((v) => v.voter_role === role);
                      if (!roleVotes.length) return null;
                      return (
                        <div key={role} className="rounded-lg border p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">{label}</span>
                            <Badge variant="secondary" className="text-[10px]">{roleVotes.length} votes</Badge>
                          </div>
                          <div className="flex gap-1">
                            {opinion.options.map((opt) => {
                              const count = roleVotes.filter((v) => v.selected_option === opt.label).length;
                              const pct = roleVotes.length > 0 ? Math.round((count / roleVotes.length) * 100) : 0;
                              return (
                                <div
                                  key={opt.label}
                                  className="h-2 rounded-full transition-all"
                                  style={{
                                    backgroundColor: opt.color,
                                    width: `${Math.max(pct, 2)}%`,
                                    opacity: count > 0 ? 1 : 0.2,
                                  }}
                                  title={`${opt.label}: ${pct}%`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No votes yet — be the first professional to share your opinion
              </div>
            )}
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="mt-4 space-y-4">
            {userId && (
              <div className="flex gap-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="text-sm min-h-[60px] resize-none"
                  maxLength={500}
                />
                <Button
                  size="sm"
                  onClick={handlePostComment}
                  disabled={!comment.trim() || addComment.isPending}
                  className="self-end"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5 rounded-lg border p-3">
                  <AvatarWithFallback
                    src={c.profile?.avatar_url}
                    name={c.profile?.display_name || c.profile?.full_name || "?"}
                    className="h-7 w-7 text-[10px]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium truncate">
                        {c.profile?.display_name || c.profile?.full_name}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No comments yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="mt-6 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {opinion.disclaimer_text || "This is a professional sentiment indicator only. It does not constitute investment advice, a recommendation, or an endorsement. Past opinions do not predict future outcomes. Always consult a SEBI-registered advisor before making investment decisions."}
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
