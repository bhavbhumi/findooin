/**
 * AdminGamificationManagement — Full CRUD management for gamification system.
 * Tabs: Overview, Badge Management, Challenge Management, User XP Management.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import {
  Trophy, Star, Award, Search, ChevronLeft, ChevronRight,
  Users, Zap, TrendingUp, Target, Flame, Plus, Pencil, Trash2,
  Calendar, Shield, Settings, BarChart3
} from "lucide-react";

const PAGE_SIZE = 20;
const XP_THRESHOLDS = [0, 100, 300, 700, 1500, 3000];
function getLevel(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) return i;
  }
  return 0;
}
const LEVEL_LABELS = ["Newcomer", "Active", "Contributor", "Expert", "Thought Leader", "Legend"];

const BADGE_CATEGORIES = ["content", "network", "engagement", "streak", "trust", "events", "milestone"];
const BADGE_TIERS = ["bronze", "silver", "gold", "platinum"];
const CRITERIA_TYPES = ["threshold", "count", "streak", "manual"];
const CHALLENGE_ACTION_TYPES = ["post", "like", "comment", "connect", "share", "endorse", "login"];

// ─── Overview Tab ───────────────────────────────────────────────
function OverviewTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: badgeDefs } = useQuery({
    queryKey: ["admin-badge-defs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badge_definitions").select("*").order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: userData, isLoading } = useQuery({
    queryKey: ["admin-gamification-users"],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const { data: xpData } = await supabase.from("user_xp").select("user_id, total_xp, level, current_streak");

      const { data: badgeData } = await supabase.from("user_badges").select("user_id");

      const xpMap: Record<string, { xp: number; level: number; streak: number }> = {};
      (xpData || []).forEach((x: any) => {
        xpMap[x.user_id] = { xp: x.total_xp, level: x.level, streak: x.current_streak };
      });

      const badgeMap: Record<string, number> = {};
      (badgeData || []).forEach((b: any) => {
        badgeMap[b.user_id] = (badgeMap[b.user_id] || 0) + 1;
      });

      return (profiles || []).map((p) => {
        const xpInfo = xpMap[p.id] || { xp: 0, level: 0, streak: 0 };
        return {
          ...p,
          xp: xpInfo.xp,
          level: xpInfo.level,
          level_label: LEVEL_LABELS[xpInfo.level] || "Newcomer",
          badge_count: badgeMap[p.id] || 0,
          streak: xpInfo.streak,
        };
      }).sort((a, b) => b.xp - a.xp);
    },
  });

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
      (u.full_name || "").toLowerCase().includes(s) || (u.display_name || "").toLowerCase().includes(s)
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

  const levelDistribution = useMemo(() => {
    if (!userData) return [];
    const dist: Record<number, number> = {};
    userData.forEach((u) => { dist[u.level] = (dist[u.level] || 0) + 1; });
    return LEVEL_LABELS.map((label, i) => ({ level: i, label, count: dist[i] || 0 }));
  }, [userData]);

  if (isLoading) return <FindooLoader text="Loading gamification data..." />;

  return (
    <div className="space-y-4">
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
                    <Badge variant="outline" className="text-[9px]">L{user.level} · {user.level_label}</Badge>
                    {user.badge_count > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Award className="h-2.5 w-2.5" /> {user.badge_count}
                      </span>
                    )}
                    {user.streak > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                        <Flame className="h-2.5 w-2.5" /> {user.streak}d
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> {user.xp.toLocaleString()}</p>
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

// ─── Badge Management Tab ───────────────────────────────────────
function BadgeManagementTab() {
  const qc = useQueryClient();
  const [editBadge, setEditBadge] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: badges, isLoading } = useQuery({
    queryKey: ["admin-badge-defs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badge_definitions").select("*").order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: earnedCounts } = useQuery({
    queryKey: ["admin-badge-earned-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_badges").select("badge_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((b: any) => { counts[b.badge_id] = (counts[b.badge_id] || 0) + 1; });
      return counts;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (badge: any) => {
      const { id, ...rest } = badge;
      if (id) {
        const { error } = await supabase.from("badge_definitions").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("badge_definitions").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-badge-defs"] });
      toast.success("Badge saved");
      setDialogOpen(false);
      setEditBadge(null);
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("badge_definitions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-badge-defs"] });
      toast.success("Badge deleted");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const openCreate = () => {
    setEditBadge({
      name: "", slug: "", description: "", icon_name: "Award", category: "engagement",
      tier: "bronze", criteria_type: "threshold", criteria_value: 1, criteria_field: "",
      xp_reward: 10, sort_order: (badges?.length || 0) + 1, is_active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (b: any) => {
    setEditBadge({ ...b });
    setDialogOpen(true);
  };

  if (isLoading) return <FindooLoader text="Loading badges..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{badges?.length || 0} badge definitions</p>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5 mr-1" /> New Badge</Button>
      </div>

      <div className="space-y-2">
        {badges?.map((b) => (
          <Card key={b.id} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{b.name}</p>
                  {!b.is_active && <Badge variant="secondary" className="text-[9px]">Inactive</Badge>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[9px] capitalize">{b.tier}</Badge>
                  <Badge variant="outline" className="text-[9px] capitalize">{b.category}</Badge>
                  <span className="text-[10px] text-muted-foreground">{b.criteria_type}: {b.criteria_value}</span>
                  <span className="text-[10px] text-muted-foreground">+{b.xp_reward} XP</span>
                </div>
              </div>
              <div className="text-right shrink-0 mr-2">
                <p className="text-sm font-bold">{earnedCounts?.[b.id] || 0}</p>
                <p className="text-[10px] text-muted-foreground">earned</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                  if (confirm("Delete this badge definition?")) deleteMutation.mutate(b.id);
                }}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditBadge(null); }}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editBadge?.id ? "Edit Badge" : "Create Badge"}</DialogTitle>
          </DialogHeader>
          {editBadge && (
            <BadgeForm badge={editBadge} onChange={setEditBadge} onSave={() => saveMutation.mutate(editBadge)} saving={saveMutation.isPending} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BadgeForm({ badge, onChange, onSave, saving }: { badge: any; onChange: (b: any) => void; onSave: () => void; saving: boolean }) {
  const set = (k: string, v: any) => onChange({ ...badge, [k]: v });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Name</Label><Input value={badge.name} onChange={(e) => set("name", e.target.value)} className="h-8 text-sm" /></div>
        <div><Label className="text-xs">Slug</Label><Input value={badge.slug} onChange={(e) => set("slug", e.target.value)} className="h-8 text-sm" /></div>
      </div>
      <div><Label className="text-xs">Description</Label><Textarea value={badge.description} onChange={(e) => set("description", e.target.value)} className="text-sm min-h-[60px]" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Icon Name</Label><Input value={badge.icon_name} onChange={(e) => set("icon_name", e.target.value)} className="h-8 text-sm" placeholder="e.g. Award, Star" /></div>
        <div>
          <Label className="text-xs">Category</Label>
          <Select value={badge.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{BADGE_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Tier</Label>
          <Select value={badge.tier} onValueChange={(v) => set("tier", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{BADGE_TIERS.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Criteria Type</Label>
          <Select value={badge.criteria_type} onValueChange={(v) => set("criteria_type", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{CRITERIA_TYPES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><Label className="text-xs">Criteria Value</Label><Input type="number" value={badge.criteria_value} onChange={(e) => set("criteria_value", Number(e.target.value))} className="h-8 text-sm" /></div>
        <div><Label className="text-xs">Criteria Field</Label><Input value={badge.criteria_field || ""} onChange={(e) => set("criteria_field", e.target.value)} className="h-8 text-sm" placeholder="e.g. posts" /></div>
        <div><Label className="text-xs">XP Reward</Label><Input type="number" value={badge.xp_reward} onChange={(e) => set("xp_reward", Number(e.target.value))} className="h-8 text-sm" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Sort Order</Label><Input type="number" value={badge.sort_order} onChange={(e) => set("sort_order", Number(e.target.value))} className="h-8 text-sm" /></div>
        <div className="flex items-center gap-2 pt-4">
          <Switch checked={badge.is_active} onCheckedChange={(v) => set("is_active", v)} />
          <Label className="text-xs">Active</Label>
        </div>
      </div>
      <Button className="w-full" onClick={onSave} disabled={saving || !badge.name || !badge.slug}>
        {saving ? "Saving..." : (badge.id ? "Update Badge" : "Create Badge")}
      </Button>
    </div>
  );
}

// ─── Challenge Management Tab ───────────────────────────────────
function ChallengeManagementTab() {
  const qc = useQueryClient();
  const [editChallenge, setEditChallenge] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["admin-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("weekly_challenges").select("*").order("starts_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: progressCounts } = useQuery({
    queryKey: ["admin-challenge-progress-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_challenge_progress").select("challenge_id, completed_at");
      if (error) throw error;
      const counts: Record<string, { participants: number; completed: number }> = {};
      (data || []).forEach((p: any) => {
        if (!counts[p.challenge_id]) counts[p.challenge_id] = { participants: 0, completed: 0 };
        counts[p.challenge_id].participants++;
        if (p.completed_at) counts[p.challenge_id].completed++;
      });
      return counts;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (challenge: any) => {
      const { id, ...rest } = challenge;
      if (id) {
        const { error } = await supabase.from("weekly_challenges").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("weekly_challenges").insert(rest);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-challenges"] });
      toast.success("Challenge saved");
      setDialogOpen(false);
      setEditChallenge(null);
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("weekly_challenges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-challenges"] });
      toast.success("Challenge deleted");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const now = new Date();
  const openCreate = () => {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    setEditChallenge({
      title: "", description: "", action_type: "post", target_count: 3, xp_reward: 50,
      starts_at: startOfWeek.toISOString().slice(0, 16), ends_at: endOfWeek.toISOString().slice(0, 16), is_active: true,
    });
    setDialogOpen(true);
  };

  if (isLoading) return <FindooLoader text="Loading challenges..." />;

  const active = challenges?.filter((c) => c.is_active && new Date(c.ends_at) >= now) || [];
  const past = challenges?.filter((c) => !c.is_active || new Date(c.ends_at) < now) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{active.length} active, {past.length} past</p>
        <Button size="sm" onClick={openCreate}><Plus className="h-3.5 w-3.5 mr-1" /> New Challenge</Button>
      </div>

      {active.length > 0 && (
        <>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Challenges</h3>
          {active.map((c) => <ChallengeRow key={c.id} challenge={c} stats={progressCounts?.[c.id]} onEdit={() => { setEditChallenge({ ...c, starts_at: c.starts_at.slice(0, 16), ends_at: c.ends_at.slice(0, 16) }); setDialogOpen(true); }} onDelete={() => { if (confirm("Delete?")) deleteMutation.mutate(c.id); }} />)}
        </>
      )}
      {past.length > 0 && (
        <>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">Past / Inactive</h3>
          {past.slice(0, 10).map((c) => <ChallengeRow key={c.id} challenge={c} stats={progressCounts?.[c.id]} onEdit={() => { setEditChallenge({ ...c, starts_at: c.starts_at.slice(0, 16), ends_at: c.ends_at.slice(0, 16) }); setDialogOpen(true); }} onDelete={() => { if (confirm("Delete?")) deleteMutation.mutate(c.id); }} />)}
        </>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditChallenge(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editChallenge?.id ? "Edit Challenge" : "Create Challenge"}</DialogTitle>
          </DialogHeader>
          {editChallenge && (
            <ChallengeForm challenge={editChallenge} onChange={setEditChallenge} onSave={() => saveMutation.mutate(editChallenge)} saving={saveMutation.isPending} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChallengeRow({ challenge: c, stats, onEdit, onDelete }: { challenge: any; stats?: { participants: number; completed: number }; onEdit: () => void; onDelete: () => void }) {
  const isActive = c.is_active && new Date(c.ends_at) >= new Date();
  return (
    <Card className="border-border/50">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
          <Target className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{c.title}</p>
            {isActive ? <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Active</Badge> : <Badge variant="secondary" className="text-[9px]">Ended</Badge>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground capitalize">{c.action_type} × {c.target_count}</span>
            <span className="text-[10px] text-muted-foreground">+{c.xp_reward} XP</span>
            {stats && (
              <span className="text-[10px] text-muted-foreground">{stats.participants} joined · {stats.completed} done</span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /></Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ChallengeForm({ challenge, onChange, onSave, saving }: { challenge: any; onChange: (c: any) => void; onSave: () => void; saving: boolean }) {
  const set = (k: string, v: any) => onChange({ ...challenge, [k]: v });
  return (
    <div className="space-y-3">
      <div><Label className="text-xs">Title</Label><Input value={challenge.title} onChange={(e) => set("title", e.target.value)} className="h-8 text-sm" /></div>
      <div><Label className="text-xs">Description</Label><Textarea value={challenge.description} onChange={(e) => set("description", e.target.value)} className="text-sm min-h-[60px]" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">Action Type</Label>
          <Select value={challenge.action_type} onValueChange={(v) => set("action_type", v)}>
            <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{CHALLENGE_ACTION_TYPES.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label className="text-xs">Target Count</Label><Input type="number" value={challenge.target_count} onChange={(e) => set("target_count", Number(e.target.value))} className="h-8 text-sm" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">XP Reward</Label><Input type="number" value={challenge.xp_reward} onChange={(e) => set("xp_reward", Number(e.target.value))} className="h-8 text-sm" /></div>
        <div className="flex items-center gap-2 pt-4">
          <Switch checked={challenge.is_active} onCheckedChange={(v) => set("is_active", v)} />
          <Label className="text-xs">Active</Label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label className="text-xs">Starts At</Label><Input type="datetime-local" value={challenge.starts_at} onChange={(e) => set("starts_at", e.target.value)} className="h-8 text-sm" /></div>
        <div><Label className="text-xs">Ends At</Label><Input type="datetime-local" value={challenge.ends_at} onChange={(e) => set("ends_at", e.target.value)} className="h-8 text-sm" /></div>
      </div>
      <Button className="w-full" onClick={onSave} disabled={saving || !challenge.title}>
        {saving ? "Saving..." : (challenge.id ? "Update Challenge" : "Create Challenge")}
      </Button>
    </div>
  );
}

// ─── User XP Management Tab ────────────────────────────────────
function UserXPManagementTab() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [adjustUser, setAdjustUser] = useState<any>(null);
  const [xpAmount, setXpAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-user-xp-list"],
    queryFn: async () => {
      const { data: xpData, error } = await supabase.from("user_xp")
        .select("user_id, total_xp, level, current_streak, longest_streak, post_streak, streak_multiplier")
        .order("total_xp", { ascending: false });
      if (error) throw error;

      const userIds = (xpData || []).map((x) => x.user_id);
      const { data: profiles } = await supabase.from("profiles")
        .select("id, full_name, display_name")
        .in("id", userIds.length > 0 ? userIds : ["none"]);

      const profileMap: Record<string, any> = {};
      (profiles || []).forEach((p) => { profileMap[p.id] = p; });

      return (xpData || []).map((x) => ({
        ...x,
        name: profileMap[x.user_id]?.display_name || profileMap[x.user_id]?.full_name || "Unknown",
      }));
    },
  });

  const adjustMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      // Get current XP
      const { data: current, error: fetchErr } = await supabase.from("user_xp")
        .select("total_xp, level").eq("user_id", userId).single();
      if (fetchErr) throw fetchErr;

      const newXp = Math.max(0, (current?.total_xp || 0) + amount);
      const newLevel = getLevel(newXp);

      const { error } = await supabase.from("user_xp")
        .update({ total_xp: newXp, level: newLevel, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) throw error;

      // Log to audit
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from("audit_logs").insert({
          user_id: session.user.id,
          action: amount > 0 ? "xp_grant" : "xp_deduct",
          resource_type: "user_xp",
          resource_id: userId,
          metadata: { amount, reason: adjustReason, new_total: newXp },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-xp-list"] });
      toast.success("XP adjusted");
      setAdjustUser(null);
      setXpAmount(0);
      setAdjustReason("");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const resetStreakMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("user_xp")
        .update({ current_streak: 0, post_streak: 0, streak_multiplier: 1, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-xp-list"] });
      toast.success("Streak reset");
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const filtered = useMemo(() => {
    if (!users) return [];
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(s));
  }, [users, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (isLoading) return <FindooLoader text="Loading user XP..." />;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
      </div>

      <div className="space-y-1.5">
        {paged.map((user) => (
          <Card key={user.user_id} className="border-border/50">
            <CardContent className="p-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge variant="outline" className="text-[9px]">L{user.level} · {LEVEL_LABELS[user.level] || "?"}</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Zap className="h-2.5 w-2.5" />{user.total_xp.toLocaleString()} XP</span>
                  {user.current_streak > 0 && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Flame className="h-2.5 w-2.5" />{user.current_streak}d streak</span>
                  )}
                  <span className="text-[10px] text-muted-foreground">×{user.streak_multiplier}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setAdjustUser(user); setXpAmount(0); }}>
                  <Zap className="h-3 w-3 mr-1" /> Adjust XP
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => {
                  if (confirm("Reset streaks for " + user.name + "?")) resetStreakMutation.mutate(user.user_id);
                }}>
                  Reset Streak
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {paged.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No users with XP data</p>
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

      {/* XP Adjust Dialog */}
      <Dialog open={!!adjustUser} onOpenChange={(o) => { if (!o) setAdjustUser(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust XP — {adjustUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Current: {adjustUser?.total_xp?.toLocaleString()} XP (L{adjustUser?.level})</p>
            <div>
              <Label className="text-xs">XP Amount (positive to add, negative to deduct)</Label>
              <Input type="number" value={xpAmount} onChange={(e) => setXpAmount(Number(e.target.value))} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-xs">Reason (for audit)</Label>
              <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="h-8 text-sm" placeholder="e.g. Manual correction" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setAdjustUser(null)}>Cancel</Button>
              <Button className="flex-1" onClick={() => adjustMutation.mutate({ userId: adjustUser.user_id, amount: xpAmount })} disabled={adjustMutation.isPending || xpAmount === 0}>
                {adjustMutation.isPending ? "Applying..." : "Apply"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Export ────────────────────────────────────────────────
export function AdminGamificationManagement() {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1">
        <TabsTrigger value="overview" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" /> Overview</TabsTrigger>
        <TabsTrigger value="badges" className="text-xs gap-1"><Award className="h-3.5 w-3.5" /> Badges</TabsTrigger>
        <TabsTrigger value="challenges" className="text-xs gap-1"><Target className="h-3.5 w-3.5" /> Challenges</TabsTrigger>
        <TabsTrigger value="user-xp" className="text-xs gap-1"><Zap className="h-3.5 w-3.5" /> User XP</TabsTrigger>
      </TabsList>
      <TabsContent value="overview"><OverviewTab /></TabsContent>
      <TabsContent value="badges"><BadgeManagementTab /></TabsContent>
      <TabsContent value="challenges"><ChallengeManagementTab /></TabsContent>
      <TabsContent value="user-xp"><UserXPManagementTab /></TabsContent>
    </Tabs>
  );
}
