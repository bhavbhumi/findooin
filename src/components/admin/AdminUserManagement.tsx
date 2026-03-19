/**
 * AdminUserManagement — Full-featured user management with MIS stats,
 * inline actions, filters, sorting, and pagination.
 */
import { useState, useMemo } from "react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Search, ShieldCheck, Clock, User, Building2, Users, UserCheck,
  MoreHorizontal, Eye, Mail, ShieldOff, ArrowUpDown, ChevronLeft,
  ChevronRight, TrendingUp, UserPlus, Shield, CheckCircle, Activity,
  Zap, Moon, AlertTriangle, FlaskConical, Trash2,
} from "lucide-react";
import { formatDistanceToNow, subDays, isAfter } from "date-fns";
import { FindooLoader } from "@/components/FindooLoader";
import { ROLE_CONFIG } from "@/lib/role-config";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 20;

const verificationBadge: Record<string, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-accent/10 text-accent border-accent/20" },
  pending: { label: "Pending", className: "bg-status-warning/10 text-status-warning border-status-warning/20" },
  unverified: { label: "Unverified", className: "bg-muted text-muted-foreground border-border" },
};

const activityBadge: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  active: { label: "Active", icon: Zap, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  idle: { label: "Idle", icon: Clock, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  inactive: { label: "Inactive", icon: Moon, className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20" },
  dormant: { label: "Dormant", icon: AlertTriangle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

type SortField = "name" | "created_at" | "verification";
type SortDir = "asc" | "desc";

export function AdminUserManagement() {
  const { data: users, isLoading } = useAdminUsers();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isPurging, setIsPurging] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  // ── MIS Stats ──
  const stats = useMemo(() => {
    if (!users) return null;
    const total = users.length;
    const verified = users.filter((u: any) => u.verification_status === "verified").length;
    const last7 = users.filter((u: any) => isAfter(new Date(u.created_at), subDays(new Date(), 7))).length;
    const last30 = users.filter((u: any) => isAfter(new Date(u.created_at), subDays(new Date(), 30))).length;
    const entities = users.filter((u: any) => u.user_type === "entity").length;
    const individuals = total - entities;
    const withOnboarding = users.filter((u: any) => u.onboarding_completed).length;
    const seedCount = users.filter((u: any) => u.is_seed).length;

    const roleCounts: Record<string, number> = {};
    users.forEach((u: any) => {
      u.roles?.forEach((r: any) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });
    });

    const activityCounts: Record<string, number> = { active: 0, idle: 0, inactive: 0, dormant: 0 };
    users.forEach((u: any) => {
      const s = u.activity?.status || "dormant";
      activityCounts[s] = (activityCounts[s] || 0) + 1;
    });

    return { total, verified, last7, last30, entities, individuals, withOnboarding, roleCounts, activityCounts, seedCount };
  }, [users]);

  // Helps admins disambiguate repeated names (not the same email — different accounts)
  const fullNameCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (users || []).forEach((u: any) => {
      const key = (u.full_name || "").trim().toLowerCase();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [users]);

  // ── Filter + Sort + Paginate ──
  const { filtered, totalFiltered, totalPages } = useMemo(() => {
    if (!users) return { filtered: [], totalFiltered: 0, totalPages: 1 };

    let list = [...users];

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u: any) =>
        u.full_name?.toLowerCase().includes(q) ||
        u.display_name?.toLowerCase().includes(q) ||
        u.organization?.toLowerCase().includes(q) ||
        u.id.includes(q)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      list = list.filter((u: any) => u.roles?.some((r: any) => r.role === roleFilter));
    }

    // Verification filter
    if (verificationFilter !== "all") {
      list = list.filter((u: any) => u.verification_status === verificationFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      list = list.filter((u: any) => u.user_type === typeFilter);
    }

    // Activity filter
    if (activityFilter !== "all") {
      list = list.filter((u: any) => (u.activity?.status || "dormant") === activityFilter);
    }

    // Sort
    list.sort((a: any, b: any) => {
      let cmp = 0;
      if (sortField === "name") {
        cmp = (a.full_name || "").localeCompare(b.full_name || "");
      } else if (sortField === "created_at") {
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === "verification") {
        const order: Record<string, number> = { verified: 0, pending: 1, unverified: 2 };
        cmp = (order[a.verification_status] ?? 3) - (order[b.verification_status] ?? 3);
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    const totalFiltered = list.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
    const paginated = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return { filtered: paginated, totalFiltered, totalPages };
  }, [users, search, roleFilter, verificationFilter, typeFilter, activityFilter, sortField, sortDir, page]);

  // Reset page when filters change
  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
    setPage(1);
  };

  // ── Actions ──
  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleToggleStaff = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_staff: !currentStatus })
      .eq("id", userId);
    if (error) {
      toast.error("Failed to update staff status");
    } else {
      toast.success(currentStatus ? "Staff access removed" : "Staff access granted");
    }
  };

  const handlePurgeSeedData = async () => {
    setIsPurging(true);
    try {
      const { data, error } = await supabase.functions.invoke("purge-seed-data", {
        body: { action: "purge", includeBlog: true },
      });
      if (error) throw error;
      toast.success(`Seed data purged: ${data?.seed_users_purged || 0} test users and all their content removed`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    } catch (err: any) {
      toast.error(`Purge failed: ${err.message}`);
    } finally {
      setIsPurging(false);
    }
  };

  if (isLoading) return <FindooLoader text="Loading users..." />;

  return (
    <div className="space-y-5">
      {/* ── MIS Stats ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Users} label="Total Users" value={stats.total} />
          <StatCard icon={CheckCircle} label="Verified" value={stats.verified} subtitle={`${stats.total ? Math.round((stats.verified / stats.total) * 100) : 0}%`} />
          <StatCard icon={UserPlus} label="Last 7 Days" value={stats.last7} accent />
          <StatCard icon={TrendingUp} label="Last 30 Days" value={stats.last30} />
        </div>
      )}

      {/* Role + Activity distribution mini-bar */}
      {stats && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">Roles:</span>
          {Object.entries(stats.roleCounts).map(([role, count]) => {
            const rc = ROLE_CONFIG[role];
            return (
              <Badge key={role} variant="outline" className={`text-[10px] gap-1 ${rc?.bgColor || ""}`}>
                {rc?.label || role} · {count}
              </Badge>
            );
          })}
          <Badge variant="outline" className="text-[10px] gap-1">
            <Building2 className="h-2.5 w-2.5" /> Entities · {stats.entities}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1">
            <User className="h-2.5 w-2.5" /> Individuals · {stats.individuals}
          </Badge>
          <Badge variant="outline" className="text-[10px] gap-1">
            Onboarded · {stats.withOnboarding}/{stats.total}
          </Badge>
          <span className="text-[10px] text-muted-foreground mx-1">|</span>
          <span className="text-xs text-muted-foreground font-medium">Activity:</span>
          {Object.entries(stats.activityCounts).map(([status, count]) => {
            const ab = activityBadge[status];
            if (!ab || !count) return null;
            const AbIcon = ab.icon;
            return (
              <Badge key={status} variant="outline" className={`text-[10px] gap-1 ${ab.className}`}>
                <AbIcon className="h-2.5 w-2.5" /> {ab.label} · {count}
              </Badge>
            );
          })}
          {stats.seedCount > 0 && (
            <>
              <span className="text-[10px] text-muted-foreground mx-1">|</span>
              <Badge variant="outline" className="text-[10px] gap-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20">
                <FlaskConical className="h-2.5 w-2.5" /> Seed · {stats.seedCount}
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-destructive hover:text-destructive gap-0.5" disabled={isPurging}>
                    <Trash2 className="h-2.5 w-2.5" /> {isPurging ? "Purging..." : "Purge"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Purge all seed/test data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all {stats.seedCount} test users (@findoo.test) and ALL their content: posts, comments, connections, messages, jobs, events, listings, blog posts, endorsements, and more. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePurgeSeedData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, purge all test data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      )}

      {/* ── Filters + Search ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, org, or ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-10 h-9"
          />
        </div>

        <Select value={roleFilter} onValueChange={handleFilterChange(setRoleFilter)}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="investor">Investor</SelectItem>
            <SelectItem value="intermediary">Intermediary</SelectItem>
            <SelectItem value="issuer">Issuer</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>

        <Select value={verificationFilter} onValueChange={handleFilterChange(setVerificationFilter)}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="Verification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="unverified">Unverified</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={handleFilterChange(setTypeFilter)}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="entity">Entity</SelectItem>
          </SelectContent>
        </Select>

        <Select value={activityFilter} onValueChange={handleFilterChange(setActivityFilter)}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Activity</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="idle">Idle</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="dormant">Dormant</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Sort Bar ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {totalFiltered} user{totalFiltered !== 1 ? "s" : ""} · Page {page} of {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">Sort:</span>
          {(["created_at", "name", "verification"] as SortField[]).map((f) => (
            <Button
              key={f}
              variant={sortField === f ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs gap-1 px-2"
              onClick={() => toggleSort(f)}
            >
              {f === "created_at" ? "Joined" : f === "name" ? "Name" : "Status"}
              {sortField === f && (
                <ArrowUpDown className={`h-3 w-3 ${sortDir === "asc" ? "rotate-180" : ""} transition-transform`} />
              )}
            </Button>
          ))}
        </div>
      </div>

       {/* ── User List ── */}
      <div className="space-y-1.5">
        {filtered.map((u: any) => {
          const vBadge = verificationBadge[u.verification_status] || verificationBadge.unverified;
          const aBadge = activityBadge[u.activity?.status || "dormant"] || activityBadge.dormant;
          const ActivityIcon = aBadge.icon;

          const fullNameKey = (u.full_name || "").trim().toLowerCase();
          const sameNameCount = fullNameKey ? (fullNameCounts[fullNameKey] || 0) : 0;

          return (
            <Card key={u.id} className={`hover:bg-muted/30 transition-colors ${u.activity?.status === "dormant" ? "opacity-60" : ""} ${u.is_seed ? "border-dashed border-violet-500/30" : ""}`}>
              <CardContent className="py-2.5 px-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className={`h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 ${u.is_seed ? "ring-1 ring-violet-500/40 ring-dashed" : ""}`}>
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {(u.full_name || "?").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-sm truncate max-w-[200px]">
                        {u.user_type === "entity" && u.organization ? u.organization : (u.display_name || u.full_name)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">#{u.id.slice(0, 6)}</span>

                      {sameNameCount > 1 && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-status-warning/10 text-status-warning border-status-warning/20">
                          Duplicate name · {sameNameCount}
                        </Badge>
                      )}

                      {u.is_seed && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20 gap-0.5">
                          <FlaskConical className="h-2.5 w-2.5" /> Test
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-[9px] h-4 px-1 ${vBadge.className}`}>
                        {u.verification_status === "verified" && <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />}
                        {vBadge.label}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] h-4 px-1 capitalize gap-0.5">
                        {u.user_type === "entity" ? <Building2 className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                        {u.user_type}
                      </Badge>
                      {u.is_staff && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1 bg-primary/10 text-primary border-primary/20 gap-0.5">
                          <Shield className="h-2.5 w-2.5" /> Staff
                        </Badge>
                      )}
                      <Badge variant="outline" className={`text-[9px] h-4 px-1 gap-0.5 ${aBadge.className}`}>
                        <ActivityIcon className="h-2.5 w-2.5" /> {aBadge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      {u.roles?.map((r: any) => {
                        const rc = ROLE_CONFIG[r.role];
                        return rc ? (
                          <span key={r.role + (r.sub_type || "")} className={`text-[9px] px-1.5 py-0.5 rounded-full ${rc.bgColor}`}>
                            {rc.label}{r.sub_type ? ` · ${r.sub_type}` : ""}
                          </span>
                        ) : null;
                      })}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        Joined {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                      </span>
                      {u.activity?.last_active_at && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          · <Activity className="h-2.5 w-2.5" />
                          Last active {formatDistanceToNow(new Date(u.activity.last_active_at), { addSuffix: true })}
                        </span>
                      )}
                      {u.location && (
                        <span className="text-[10px] text-muted-foreground">· {u.location}</span>
                      )}
                    </div>
                  </div>

                  {/* Inline actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      title="View Profile"
                      onClick={() => handleViewProfile(u.id)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleViewProfile(u.id)}>
                          <Eye className="h-3.5 w-3.5 mr-2" /> View Full Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          navigator.clipboard.writeText(u.id);
                          toast.success("User ID copied");
                        }}>
                          <User className="h-3.5 w-3.5 mr-2" /> Copy User ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStaff(u.id, !!u.is_staff)}>
                          {u.is_staff ? (
                            <><ShieldOff className="h-3.5 w-3.5 mr-2" /> Remove Staff Access</>
                          ) : (
                            <><Shield className="h-3.5 w-3.5 mr-2" /> Grant Staff Access</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/messages?to=${u.id}`)}>
                          <Mail className="h-3.5 w-3.5 mr-2" /> Send Message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No users match your filters.
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0 text-xs"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs gap-1"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

/** Stat card sub-component */
function StatCard({ icon: Icon, label, value, subtitle, accent }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  subtitle?: string;
  accent?: boolean;
}) {
  return (
    <Card>
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
            accent ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">{value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {label}
              {subtitle && <span className="ml-1 text-accent font-medium">({subtitle})</span>}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
