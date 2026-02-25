import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, Search, BarChart3, UserCheck as UserCheckIcon, Building2,
} from "lucide-react";
import AppNavbar from "@/components/AppNavbar";

interface DiscoverUser {
  id: string;
  full_name: string;
  display_name: string | null;
  user_type: string;
  bio: string | null;
  avatar_url: string | null;
  verification_status: string;
  roles: { role: string; sub_type: string | null }[];
}

const roleIcon: Record<string, typeof BarChart3> = {
  investor: BarChart3,
  intermediary: UserCheckIcon,
  issuer: Building2,
};

const roleColor: Record<string, string> = {
  investor: "bg-investor/10 text-investor",
  intermediary: "bg-intermediary/10 text-intermediary",
  issuer: "bg-issuer/10 text-issuer",
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const Discover = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<DiscoverUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      loadUsers(session.user.id);
    });
  }, [navigate]);

  const loadUsers = async (currentUserId: string) => {
    setLoading(true);
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").neq("id", currentUserId),
      supabase.from("user_roles").select("*"),
    ]);

    const roleMap = new Map<string, { role: string; sub_type: string | null }[]>();
    rolesRes.data?.forEach((r) => {
      if (!roleMap.has(r.user_id)) roleMap.set(r.user_id, []);
      roleMap.get(r.user_id)!.push({ role: r.role, sub_type: r.sub_type });
    });

    const mapped: DiscoverUser[] = (profilesRes.data || []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      display_name: p.display_name,
      user_type: p.user_type,
      bio: p.bio,
      avatar_url: p.avatar_url,
      verification_status: p.verification_status,
      roles: roleMap.get(p.id) || [],
    }));
    setUsers(mapped);
    setLoading(false);
  };

  const filtered = users.filter((u) => {
    const nameMatch = (u.display_name || u.full_name).toLowerCase().includes(search.toLowerCase());
    const roleMatch = !roleFilter || u.roles.some((r) => r.role === roleFilter);
    return nameMatch && roleMatch;
  });

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AppNavbar />

      <div className="container py-6 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold font-heading text-foreground mb-4">Discover People</h1>

        {/* Search & filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-2">
            {["investor", "intermediary", "issuer"].map((r) => (
              <Button key={r} variant={roleFilter === r ? "default" : "outline"} size="sm" onClick={() => setRoleFilter(roleFilter === r ? null : r)} className="capitalize text-xs">
                {r}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-1.5 flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground text-sm">No users found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((user) => (
              <Link key={user.id} to={`/profile/${user.id}`} className="block rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0 overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                    ) : (
                      getInitials(user.full_name)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-card-foreground text-sm truncate">
                        {user.display_name || user.full_name}
                      </span>
                      {user.verification_status === "verified" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-accent shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {user.roles.map((r, i) => {
                        const Icon = roleIcon[r.role];
                        return (
                          <span key={i} className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleColor[r.role] || ""}`}>
                            {Icon && <Icon className="h-2.5 w-2.5" />}
                            {r.sub_type || r.role}
                          </span>
                        );
                      })}
                    </div>
                    {user.bio && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{user.bio}</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Discover;
