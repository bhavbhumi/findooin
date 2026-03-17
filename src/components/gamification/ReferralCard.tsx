/**
 * ReferralCard — Generate and share referral links. Shows bonus XP earned.
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Copy, Users, Zap, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReferralCardProps {
  userId: string;
  className?: string;
}

export function ReferralCard({ userId, className }: ReferralCardProps) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [stats, setStats] = useState({ conversions: 0, totalBonus: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  async function loadReferralData() {
    setLoading(true);
    // Get or create referral link
    const { data: existing } = await supabase
      .from("referral_links")
      .select("code")
      .eq("referrer_id", userId)
      .maybeSingle();

    if (existing) {
      setReferralCode(existing.code);
    } else {
      const code = `ref_${userId.slice(0, 8)}_${Date.now().toString(36)}`;
      const { data: created } = await supabase
        .from("referral_links")
        .insert({ referrer_id: userId, code })
        .select("code")
        .single();
      if (created) setReferralCode(created.code);
    }

    // Get conversion stats
    const { data: conversions } = await supabase
      .from("referral_conversions")
      .select("total_bonus_xp")
      .eq("referrer_id", userId);

    if (conversions) {
      setStats({
        conversions: conversions.length,
        totalBonus: conversions.reduce((sum, c) => sum + (c.total_bonus_xp || 0), 0),
      });
    }
    setLoading(false);
  }

  const referralUrl = referralCode
    ? `${window.location.origin}/auth?ref=${referralCode}`
    : "";

  function handleCopy() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: "Join me on FindOO",
        text: "Join FindOO — the professional network for financial services. Use my referral link!",
        url: referralUrl,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  }

  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
        <div className="h-20 animate-pulse bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold text-card-foreground">Invite & Earn</h3>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Invite professionals and earn <span className="font-semibold text-[hsl(var(--gold))]">50 XP</span> per signup + <span className="font-semibold text-[hsl(var(--gold))]">10%</span> of their XP for 30 days!
      </p>

      {/* Referral link */}
      <div className="flex items-center gap-1.5">
        <div className="flex-1 truncate rounded-lg bg-muted px-3 py-2 text-[11px] text-muted-foreground font-mono">
          {referralUrl}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-[hsl(var(--status-success))]" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleShare}
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <p className="text-lg font-bold text-card-foreground">{stats.conversions}</p>
          <p className="text-[10px] text-muted-foreground">Referrals</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <Zap className="h-3.5 w-3.5 text-[hsl(var(--gold))]" />
            <p className="text-lg font-bold text-card-foreground">{stats.totalBonus}</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Bonus XP</p>
        </div>
      </div>
    </div>
  );
}
