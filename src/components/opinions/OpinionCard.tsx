/**
 * OpinionCard — Polymarket-inspired sentiment card with login gating.
 */
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, Share2, Clock, Users, Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, isPast, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  type Opinion, type OpinionVote, type VoteResults,
  OPINION_CATEGORIES, computeVoteResults,
  useOpinionVotes, useCastVote, useRemoveVote, useOpinionInteraction,
} from "@/hooks/useOpinions";
import { useRole } from "@/contexts/RoleContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface OpinionCardProps {
  opinion: Opinion;
  onOpenDetail?: (id: string) => void;
  compact?: boolean;
}

export function OpinionCard({ opinion, onOpenDetail, compact }: OpinionCardProps) {
  const navigate = useNavigate();
  const { activeRole, hasRole, userId } = useRole();
  const { data: votes = [] } = useOpinionVotes(opinion.id);
  const castVote = useCastVote();
  const removeVote = useRemoveVote();
  const interact = useOpinionInteraction();

  const [isPublicVote, setIsPublicVote] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
  }, []);

  const cat = OPINION_CATEGORIES[opinion.category];
  const isExpired = isPast(new Date(opinion.ends_at));
  const isClosed = opinion.status === "closed" || isExpired;
  const hoursLeft = differenceInHours(new Date(opinion.ends_at), new Date());
  const results = computeVoteResults(votes, opinion.options);
  const totalVotes = votes.length;
  const myVote = votes.find((v) => v.user_id === userId);

  const canVote = loggedIn && !isClosed && !myVote && (
    hasRole("intermediary") || hasRole("issuer") || hasRole("admin")
  );
  const isInvestor = hasRole("investor") && !hasRole("intermediary") && !hasRole("issuer") && !hasRole("admin");

  const handleVote = (optionLabel: string) => {
    if (!loggedIn) {
      navigate("/auth");
      return;
    }
    if (!canVote) {
      if (isInvestor) {
        toast.info("Investors can react but cannot vote. Only Intermediaries & Issuers can cast professional opinions.");
      }
      return;
    }
    castVote.mutate({ opinionId: opinion.id, selectedOption: optionLabel, isPublic: isPublicVote });
  };

  const handleRemoveVote = () => {
    removeVote.mutate({ opinionId: opinion.id });
  };

  const handleInteract = (type: "like" | "share") => {
    if (!loggedIn) {
      navigate("/auth");
      return;
    }
    interact.mutate({ opinionId: opinion.id, type });
    if (type === "share") {
      navigator.clipboard.writeText(`${window.location.origin}/opinions?id=${opinion.id}`);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "group overflow-hidden transition-all hover:shadow-lg cursor-pointer border-border/60",
          opinion.is_featured && "ring-1 ring-primary/20",
          compact && "shadow-sm"
        )}
        onClick={() => onOpenDetail?.(opinion.id)}
      >
        <CardContent className={cn("p-4", compact && "p-3")}>
          {/* Category + Status */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-[10px] font-normal gap-1">
              {cat.icon} {cat.label}
            </Badge>
            {opinion.is_featured && (
              <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">🔥 Featured</Badge>
            )}
            {isClosed ? (
              <Badge variant="outline" className="text-[10px] text-muted-foreground">Closed</Badge>
            ) : hoursLeft <= 24 ? (
              <Badge variant="destructive" className="text-[10px] gap-0.5">
                <Clock className="h-2.5 w-2.5" /> {hoursLeft}h left
              </Badge>
            ) : null}
          </div>

          {/* Title */}
          <h3 className={cn(
            "font-semibold text-foreground leading-snug mb-3",
            compact ? "text-sm" : "text-base"
          )}>
            {opinion.title}
          </h3>

          {/* Result Bars */}
          <div className="space-y-2 mb-3" onClick={(e) => e.stopPropagation()}>
            {opinion.options.map((opt) => {
              const result = results[opt.label];
              const pct = result?.percentage || 0;
              const isMyChoice = myVote?.selected_option === opt.label;

              return (
                <button
                  key={opt.label}
                  onClick={() => canVote ? handleVote(opt.label) : undefined}
                  disabled={!canVote && loggedIn}
                  className={cn(
                    "w-full relative rounded-lg border transition-all text-left",
                    canVote && "hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                    isMyChoice && "border-primary ring-1 ring-primary/30",
                    !canVote && loggedIn && "cursor-default",
                    !loggedIn && "cursor-pointer hover:border-primary/30"
                  )}
                >
                  {/* Background bar */}
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-15"
                    style={{ backgroundColor: opt.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                  <div className="relative flex items-center justify-between px-3 py-2">
                    <span className={cn(
                      "text-sm font-medium",
                      isMyChoice && "text-primary"
                    )}>
                      {opt.label}
                      {isMyChoice && " ✓"}
                    </span>
                    <span className="text-sm font-bold tabular-nums">
                      {totalVotes > 0 ? `${pct}%` : "—"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Vote controls for eligible users */}
          {canVote && (
            <div className="flex items-center gap-3 mb-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1.5">
                <Switch
                  id={`public-${opinion.id}`}
                  checked={isPublicVote}
                  onCheckedChange={setIsPublicVote}
                  className="scale-75"
                />
                <Label htmlFor={`public-${opinion.id}`} className="text-[10px] text-muted-foreground cursor-pointer flex items-center gap-1">
                  {isPublicVote ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {isPublicVote ? "Public vote" : "Anonymous"}
                </Label>
              </div>
            </div>
          )}

          {myVote && !isClosed && (
            <div className="mb-2" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" onClick={handleRemoveVote} className="text-[10px] h-6 text-muted-foreground">
                Change my vote
              </Button>
            </div>
          )}

          {/* Login CTA */}
          {!loggedIn && (
            <div className="mb-3" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="w-full text-xs gap-1.5"
              >
                <Lock className="h-3 w-3" /> Sign in to participate
              </Button>
            </div>
          )}

          {/* Footer: stats + interactions */}
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {totalVotes} voted
                  </span>
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">
                  {totalVotes} professionals have cast their opinion
                </TooltipContent>
              </Tooltip>
              <span>
                {isClosed ? "Closed" : `Ends ${formatDistanceToNow(new Date(opinion.ends_at), { addSuffix: true })}`}
              </span>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleInteract("like")}>
                <Heart className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onOpenDetail?.(opinion.id)}>
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleInteract("share")}>
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          {!compact && (
            <div className="mt-2 flex items-start gap-1.5 px-2 py-1.5 rounded bg-muted/30 border border-border/40">
              <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-muted-foreground leading-tight">
                {opinion.disclaimer_text || "Professional sentiment indicator only. Not investment advice."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
