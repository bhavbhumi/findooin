/**
 * AdminGamificationManagement — Admin overview for gamification system.
 * Shows XP leaderboard, badge stats, and level distribution.
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FindooLoader } from "@/components/FindooLoader";
import {
  Trophy, Star, Award, Search, ChevronLeft, ChevronRight,
  Users, Zap, TrendingUp, Target, Flame
} from "lucide-react";

const PAGE_SIZE = 20;

// XP thresholds per level (mirrors lib/gamification.ts)
const XP_THRESHOLDS = [0, 100, 300, 700, 1500, 3000];
function getLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i;
  }
  return 0;
}
const LEVEL_LABELS = ["Newcomer", "Active", "Contributor", "Expert", "Thought Leader", "Legend"];

export function AdminGamificationManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Badge definitions
  const { data: badgeDefs } = useQuery({
    queryKey: ["admin-badge-defs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badge_definitions").select("*").order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  // User XP data via post_interactions, connections, etc. — aggregate from gamification signals
  const { data: userData, isLoading } = useQuery({
    queryKey: ["admin-gamification-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Get all social proof events (level_up, badge_earned)
      const { data: spEvents } = await supabase
        .from("social_proof_events")
        .select("user_id, event_type, event_data");

      // Aggregate XP from social proof events
      const xpMap: Record<string, number> = {};
      const badgeMap: Record<string, number> = {};
      const levelMap: Record<string, number> = {};

      (spEvents || []).forEach((e) => {
        const data = e.event_data as any;
        if (e.event_type === "level_up" && data?.level) {
          levelMap[e.user_id] = Math.max(levelMap[e.user_id] || 0, data.level);
        }
        if (e.event_type === "badge_earned") {
          badgeMap[e.user_id] = (badgeMap[e.user_id] || 0) + 1;
        }
        if (data?.xp) {
          xpMap[e.user_id] = (xpMap[e.user_id] || 0) + (data.xp || 0);
        }
      });

      // Get interaction counts per user for XP estimation
      const { data: interactions } = await supabase
        .from("post_interactions")
        .select("user_id");
      const { data: postData } = await supabase
        .from("posts")
        .select("author_id");
      const { data: connData } = await supabase
        .from("connections")
        .select("from_user_id")
        .eq("status", "accepted");

      const activityXp: Record<string, number> = {};
      (interactions || []).forEach((i) => {
        activityXp[i.user_id] = (activityXp[i.user_id] || 0) + 5;
      });
      (postData || []).forEach((p) => {
        activityXp[p.author_id] = (activityXp[p.author_id] || 0) + 20;
      });
      (connData || []).forEach((c) => {
        activityXp[c.from_user_id] = (activityXp[c.from_user_id] || 0) + 10;
      });

      return (profiles || []).map((p) => {
        const totalXp = Math.max(xpMap[p.id] || 0, activityXp[p.id] || 0);
        const level = levelMap[p.id] || getLevel(totalXp);
        return {
          ...p,
          xp: totalXp,
          level,
          level_label: LEVEL_LABELS[level] || "Newcomer",
          badge_count: badgeMap[p.id] || 0,
        };
      }).sort((a, b) => b.xp - a.xp);
    },
  });

  // Referral stats
  const { data: referralStats } = useQuery({
    queryKey: ["admin-referral-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("referral_conversions").select("id, total_bonus_xp");
      if (error) throw error;
      return {
        count: (data || []).length,
        totalBonusXp: (data || []).reduce((s, r) => s + (r.total_bonus_xp || 0), 0),
      };
    },
  });

  const filtered = useMemo(() => {
    if (!userData) return [];
    if (!search) return userData;
    const s = search.toLowerCase();
    return userData.filter((u) =>
      (u.full_name || "").toLowerCase().includes(s) ||
      (u.display_name || "").toLowerCase().includes(s)
    );
  }, [userData, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    if (!userData) return { totalUsers: 0, totalXp: 0, avgLevel: 0, topLevel: 0, activeBadges: 0 };
    const leveled = userData.filter((u) => u.level > 0);
    return {
      totalUsers: userData.length,
      totalXp: userData.reduce((s, u) => s + u.xp, 0),
      avgLevel: leveled.length > 0 ? (leveled.reduce((s, u) => s + u.level, 0) / leveled.length).toFixed(1) : "0",
      topLevel: Math.max(...userData.map((u) => u.level), 0),
      activeBadges: badgeDefs?.filter((b) => b.is_active).length || 0,
    };
  }, [userData, badgeDefs]);

  // Level distribution
  const levelDistribution = useMemo(() => {
    if (!userData) return [];
    const dist: Record<number, number> = {};
    userData.forEach((u) => { dist[u.level] = (dist[u.level] || 0) + 1; });
    return LEVEL_LABELS.map((label, i) => ({ level: i, label, count: dist[i] || 0 }));
  }, [userData]);

  if (isLoading) return <FindooLoader text="Loading gamification data..." />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Users", value: stats.totalUsers, icon: Users },
          { label: "Total XP", value: stats.totalXp.toLocaleString(), icon: Zap },
          { label: "Avg Level", value: stats.avgLevel, icon: TrendingUp },
          { label: "Active Badges", value: stats.activeBadges, icon: Award },
          { label: "Referrals", value: referralStats?.count || 0, icon: Target },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Level Distribution */}
      <Card className="border-border/50">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-sm font-semibold">Level Distribution</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="flex gap-2 flex-wrap">
            {levelDistribution.map((d) => (
              <div key={d.level} className="flex items-center gap-1.5 bg-muted/50 rounded-md px-2.5 py-1.5">
                <span className="text-[10px] text-muted-foreground">L{d.level}</span>
                <span className="text-xs font-medium">{d.label}</span>
                <Badge variant="secondary" className="text-[9px] h-4 px-1">{d.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* XP Leaderboard */}
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">XP Leaderboard</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
      </div>

      <div className="space-y-1.5">
        {paged.map((user, idx) => {
          const rank = (page - 1) * PAGE_SIZE + idx + 1;
          return (
            <Card key={user.id} className="border-border/50">
              <CardContent className="p-2.5 flex items-center gap-3">
                <span className={`text-xs font-bold w-6 text-center ${rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                  {rank <= 3 ? ["🥇", "🥈", "🥉"][rank - 1] : `#${rank}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.display_name || user.full_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[9px]">
                      L{user.level} · {user.level_label}
                    </Badge>
                    {user.badge_count > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Award className="h-2.5 w-2.5" /> {user.badge_count} badge{user.badge_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold flex items-center gap-1">
                    <Zap className="h-3 w-3 text-primary" /> {user.xp.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">XP</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {paged.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No users found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
