import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Eye, FileText, Shield, User, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
  profile?: { full_name: string; avatar_url: string | null; display_name: string | null };
}

const actionIcons: Record<string, typeof Activity> = {
  view_docs: Eye,
  admin_action: Shield,
  default: Activity,
};

const actionColors: Record<string, string> = {
  view_docs: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  admin_action: "bg-destructive/10 text-destructive",
  login: "bg-green-500/10 text-green-600 dark:text-green-400",
};

export function AdminAuditLog() {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  const { data: logs, isLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: async (): Promise<AuditLog[]> => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      const userIds = [...new Set((data || []).map((l: any) => l.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, display_name")
        .in("id", userIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));
      return (data || []).map((l: any) => ({ ...l, profile: profileMap[l.user_id] || null }));
    },
    staleTime: 15_000,
  });

  const actionTypes = useMemo(() => {
    if (!logs) return [];
    return [...new Set(logs.map(l => l.action))];
  }, [logs]);

  const filtered = useMemo(() => {
    if (!logs) return [];
    return logs.filter(l => {
      const matchesAction = filterAction === "all" || l.action === filterAction;
      const matchesSearch = !search || 
        l.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.resource_type.toLowerCase().includes(search.toLowerCase()) ||
        JSON.stringify(l.metadata).toLowerCase().includes(search.toLowerCase());
      return matchesAction && matchesSearch;
    });
  }, [logs, filterAction, search]);

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Events", value: logs?.length || 0, icon: Activity },
          { label: "Doc Views", value: logs?.filter(l => l.action === "view_docs").length || 0, icon: Eye },
          { label: "Unique Users", value: new Set(logs?.map(l => l.user_id) || []).size, icon: User },
          { label: "Today", value: logs?.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length || 0, icon: FileText },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <s.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold font-heading">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionTypes.map(a => (
              <SelectItem key={a} value={a}>{a.replace(/_/g, " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Log entries */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Activity Log ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading audit logs...</div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">No audit logs found</div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(log => {
                  const Icon = actionIcons[log.action] || actionIcons.default;
                  const colorClass = actionColors[log.action] || "bg-muted text-muted-foreground";
                  return (
                    <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <AvatarWithFallback
                            src={log.profile?.avatar_url || undefined}
                            initials={(log.profile?.full_name || "U").slice(0, 2).toUpperCase()}
                            className="h-5 w-5 text-[8px]"
                          />
                          <span className="text-sm font-medium text-foreground truncate">
                            {log.profile?.display_name || log.profile?.full_name || "Unknown"}
                          </span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            {log.action.replace(/_/g, " ")}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {log.resource_type}
                          </Badge>
                        </div>
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                            {Object.entries(log.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                        {format(new Date(log.created_at), "MMM d, HH:mm")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
