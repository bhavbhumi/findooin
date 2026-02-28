import { useState } from "react";
import { useAdminUsers } from "@/hooks/useAdmin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShieldCheck, Clock, User, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { FindooLoader } from "@/components/FindooLoader";
import { ROLE_CONFIG } from "@/lib/role-config";

const verificationBadge: Record<string, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-accent/10 text-accent border-accent/20" },
  pending: { label: "Pending", className: "bg-status-warning/10 text-status-warning border-status-warning/20" },
  unverified: { label: "Unverified", className: "bg-muted text-muted-foreground border-border" },
};

export function AdminUserManagement() {
  const { data: users, isLoading } = useAdminUsers();
  const [search, setSearch] = useState("");

  if (isLoading) return <FindooLoader text="Loading users..." />;

  const filtered = (users || []).filter((u: any) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.display_name?.toLowerCase().includes(q) ||
      u.organization?.toLowerCase().includes(q) ||
      u.id.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name, org, or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} users</p>

      <div className="space-y-2">
        {filtered.map((u: any) => {
          const vBadge = verificationBadge[u.verification_status] || verificationBadge.unverified;
          return (
            <Card key={u.id}>
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-muted-foreground">
                        {(u.full_name || "?").slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm truncate">
                        {u.user_type === "entity" && u.organization ? u.organization : (u.display_name || u.full_name)}
                      </span>
                      <Badge variant="outline" className={`text-[10px] ${vBadge.className}`}>
                        {u.verification_status === "verified" && <ShieldCheck className="h-2.5 w-2.5 mr-0.5" />}
                        {vBadge.label}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize gap-0.5">
                        {u.user_type === "entity" ? <Building2 className="h-2.5 w-2.5" /> : <User className="h-2.5 w-2.5" />}
                        {u.user_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {u.roles?.map((r: any) => {
                        const rc = ROLE_CONFIG[r.role];
                        return rc ? (
                          <span key={r.role} className={`text-[10px] px-1.5 py-0.5 rounded-full ${rc.bgColor}`}>
                            {rc.label}{r.sub_type ? ` · ${r.sub_type}` : ""}
                          </span>
                        ) : null;
                      })}
                      <span className="text-[10px] text-muted-foreground">
                        Joined {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
