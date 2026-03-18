/**
 * AdminMessagesManagement — Admin view for message oversight & abuse monitoring.
 * Tabs: "All Messages" and "Abuse Monitor" (flagged senders cross-referenced with reports).
 */
import { useState, useMemo } from "react";
import { ResourceModeration } from "./ResourceModeration";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import {
  MessageSquare, Search, ChevronLeft, ChevronRight, Users, Flag,
  Trash2, Clock, Mail, AlertTriangle, CheckCircle2, Shield, ShieldAlert,
  Ban, UserX
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PAGE_SIZE = 20;

const categoryColors: Record<string, string> = {
  general: "bg-muted text-muted-foreground border-border",
  professional: "bg-primary/10 text-primary border-primary/20",
  introduction: "bg-accent/10 text-accent border-accent/20",
  event: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
};

export function AdminMessagesManagement() {
  // Count flagged senders for badge
  const { data: reportsData } = useQuery({
    queryKey: ["admin-message-reports"],
    queryFn: async () => {
      const { data } = await supabase.from("reports").select("reported_user_id, status").eq("status", "pending");
      return data || [];
    },
  });
  const flaggedCount = new Set((reportsData || []).filter(r => r.reported_user_id).map(r => r.reported_user_id)).size;

  const { data: msgReportCount } = useQuery({
    queryKey: ["admin-resource-reports-count", "message"],
    queryFn: async () => {
      const { count } = await supabase.from("reports").select("id", { count: "exact", head: true }).eq("resource_type", "message").eq("status", "pending");
      return count || 0;
    },
  });

  return (
    <Tabs defaultValue="messages" className="space-y-4">
      <TabsList>
        <TabsTrigger value="messages" className="gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" /> All Messages
        </TabsTrigger>
        <TabsTrigger value="reports" className="gap-1.5">
          <Flag className="h-3.5 w-3.5" /> Reports
          {(msgReportCount || 0) > 0 && (
            <Badge variant="destructive" className="text-[9px] h-4 px-1 ml-1">{msgReportCount}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="abuse" className="gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5" /> Abuse Monitor
          {flaggedCount > 0 && (
            <Badge variant="destructive" className="text-[9px] h-4 px-1 ml-1">
              {flaggedCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="messages" className="mt-0">
        <MessagesTab />
      </TabsContent>
      <TabsContent value="reports" className="mt-0">
        <ResourceModeration resourceType="message" />
      </TabsContent>
      <TabsContent value="abuse" className="mt-0">
        <AbuseMonitorTab />
      </TabsContent>
    </Tabs>
  );
}

function MessagesTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      // Fetch user profiles
      const userIds = [...new Set((messages || []).flatMap((m) => [m.sender_id, m.receiver_id]))];
      const { data: profiles } = userIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, display_name").in("id", userIds)
        : { data: [] };
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

      // Get reported user IDs
      const { data: reports } = await supabase.from("reports").select("reported_user_id, status");
      const reportedUserIds = new Set((reports || []).filter((r) => r.reported_user_id).map((r) => r.reported_user_id));

      return (messages || []).map((m) => ({
        ...m,
        sender_profile: profileMap[m.sender_id] || null,
        receiver_profile: profileMap[m.receiver_id] || null,
        sender_reported: reportedUserIds.has(m.sender_id),
      }));
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Message deleted");
    },
  });

  const filtered = useMemo(() => {
    if (!messagesData) return [];
    return messagesData.filter((m) => {
      if (categoryFilter !== "all" && m.category !== categoryFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return m.content.toLowerCase().includes(s) ||
          (m.sender_profile?.full_name || "").toLowerCase().includes(s) ||
          (m.receiver_profile?.full_name || "").toLowerCase().includes(s);
      }
      return true;
    });
  }, [messagesData, search, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    if (!messagesData) return { total: 0, uniqueSenders: 0, flaggedSenders: 0, unread: 0, categories: 0 };
    const senders = new Set(messagesData.map((m) => m.sender_id));
    const flagged = messagesData.filter((m) => m.sender_reported);
    const categories = new Set(messagesData.map((m) => m.category));
    return {
      total: messagesData.length,
      uniqueSenders: senders.size,
      flaggedSenders: new Set(flagged.map((m) => m.sender_id)).size,
      unread: messagesData.filter((m) => !m.read).length,
      categories: categories.size,
    };
  }, [messagesData]);

  if (isLoading) return <FindooLoader text="Loading messages..." />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Messages", value: stats.total, icon: MessageSquare },
          { label: "Unique Senders", value: stats.uniqueSenders, icon: Users },
          { label: "Flagged Senders", value: stats.flaggedSenders, icon: AlertTriangle, highlight: stats.flaggedSenders > 0 },
          { label: "Unread", value: stats.unread, icon: Mail },
          { label: "Categories", value: stats.categories, icon: Shield },
        ].map((s) => (
          <Card key={s.label} className={`border-border/50 ${s.highlight ? "border-destructive/40" : ""}`}>
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className={`h-4 w-4 shrink-0 ${s.highlight ? "text-destructive" : "text-muted-foreground"}`} />
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search messages..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="introduction">Introduction</SelectItem>
            <SelectItem value="event">Event</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} message{filtered.length !== 1 ? "s" : ""}</p>

      {/* Message list */}
      <div className="space-y-1.5">
        {paged.map((msg) => {
          const sender = msg.sender_profile as any;
          const receiver = msg.receiver_profile as any;
          return (
            <Card key={msg.id} className={`border-border/50 ${msg.sender_reported ? "border-l-2 border-l-destructive" : ""}`}>
              <CardContent className="p-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{sender?.display_name || sender?.full_name || "Unknown"}</span>
                        {" → "}
                        <span className="font-medium text-foreground">{receiver?.display_name || receiver?.full_name || "Unknown"}</span>
                      </p>
                      <Badge variant="outline" className={`text-[9px] ${categoryColors[msg.category] || ""}`}>
                        {msg.category}
                      </Badge>
                      {msg.sender_reported && (
                        <Badge variant="destructive" className="text-[9px] gap-0.5">
                          <AlertTriangle className="h-2.5 w-2.5" /> Flagged sender
                        </Badge>
                      )}
                      {!msg.read && (
                        <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/20">Unread</Badge>
                      )}
                    </div>
                    <p className="text-sm mt-1 truncate max-w-lg">{msg.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive shrink-0" onClick={() => deleteMessage.mutate(msg.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {paged.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No messages found</p>
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

/**
 * AbuseMonitorTab — Shows flagged senders (users with pending reports)
 * and their recent message history for abuse investigation.
 */
function AbuseMonitorTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: abuseData, isLoading } = useQuery({
    queryKey: ["admin-abuse-monitor"],
    queryFn: async () => {
      // Get all reported users with pending reports
      const { data: reports } = await supabase
        .from("reports")
        .select("reported_user_id, reason, description, status, created_at")
        .not("reported_user_id", "is", null)
        .order("created_at", { ascending: false });

      if (!reports?.length) return [];

      // Get unique flagged user IDs
      const flaggedIds = [...new Set(reports.map(r => r.reported_user_id).filter(Boolean))] as string[];
      
      // Fetch profiles for flagged users
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, organization, verification_status")
        .in("id", flaggedIds);
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

      // Fetch recent messages FROM flagged users
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .in("sender_id", flaggedIds)
        .order("created_at", { ascending: false })
        .limit(500);

      // Get receiver profiles
      const receiverIds = [...new Set((messages || []).map(m => m.receiver_id))];
      const { data: receiverProfiles } = receiverIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, display_name").in("id", receiverIds)
        : { data: [] };
      const receiverMap = Object.fromEntries((receiverProfiles || []).map(p => [p.id, p]));

      // Group by flagged user
      const grouped = flaggedIds.map(userId => {
        const userReports = reports.filter(r => r.reported_user_id === userId);
        const userMessages = (messages || []).filter(m => m.sender_id === userId);
        const profile = profileMap[userId];
        const pendingCount = userReports.filter(r => r.status === "pending").length;
        const totalCount = userReports.length;
        return {
          userId,
          profile,
          pendingCount,
          totalCount,
          latestReportReason: userReports[0]?.reason || "Unknown",
          recentMessages: userMessages.slice(0, 5).map(m => ({
            ...m,
            receiver_profile: receiverMap[m.receiver_id] || null,
          })),
          messageCount: userMessages.length,
        };
      });

      // Sort by pending report count desc
      grouped.sort((a, b) => b.pendingCount - a.pendingCount || b.totalCount - a.totalCount);
      return grouped;
    },
  });

  const filtered = useMemo(() => {
    if (!abuseData) return [];
    if (!search) return abuseData;
    const s = search.toLowerCase();
    return abuseData.filter(d =>
      d.profile?.full_name?.toLowerCase().includes(s) ||
      d.profile?.organization?.toLowerCase().includes(s) ||
      d.latestReportReason.toLowerCase().includes(s)
    );
  }, [abuseData, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const paged = filtered.slice((page - 1) * 10, page * 10);

  if (isLoading) return <FindooLoader text="Loading abuse data..." />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Flagged Users", value: abuseData?.length || 0, icon: UserX, highlight: (abuseData?.length || 0) > 0 },
          { label: "Pending Reports", value: abuseData?.reduce((s, d) => s + d.pendingCount, 0) || 0, icon: Flag, highlight: true },
          { label: "Messages from Flagged", value: abuseData?.reduce((s, d) => s + d.messageCount, 0) || 0, icon: MessageSquare },
        ].map(s => (
          <Card key={s.label} className={s.highlight ? "border-destructive/40" : ""}>
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className={`h-4 w-4 shrink-0 ${s.highlight ? "text-destructive" : "text-muted-foreground"}`} />
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search flagged users..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
      </div>

      {/* Flagged users list */}
      {paged.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No flagged users found</p>
            <p className="text-xs mt-1">Users appear here when they have been reported by others</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paged.map(entry => (
            <Card key={entry.userId} className={`border-l-2 ${entry.pendingCount > 0 ? "border-l-destructive" : "border-l-status-warning"}`}>
              <CardContent className="p-0">
                {/* User header */}
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/30">
                  <AvatarWithFallback
                    src={entry.profile?.avatar_url || undefined}
                    initials={(entry.profile?.full_name || "U").slice(0, 2).toUpperCase()}
                    className="h-9 w-9 text-xs"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{entry.profile?.display_name || entry.profile?.full_name || "Unknown User"}</span>
                      {entry.profile?.organization && (
                        <span className="text-[10px] text-muted-foreground">• {entry.profile.organization}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="destructive" className="text-[9px] gap-0.5">
                        <Flag className="h-2.5 w-2.5" /> {entry.pendingCount} pending
                      </Badge>
                      <Badge variant="outline" className="text-[9px]">
                        {entry.totalCount} total reports
                      </Badge>
                      <Badge variant="outline" className="text-[9px] bg-muted">
                        <MessageSquare className="h-2.5 w-2.5 mr-0.5" /> {entry.messageCount} messages
                      </Badge>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    Latest: {entry.latestReportReason}
                  </span>
                </div>

                {/* Recent messages from this user */}
                {entry.recentMessages.length > 0 && (
                  <div className="px-4 py-2 space-y-1.5">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Recent messages
                    </p>
                    {entry.recentMessages.map(msg => {
                      const receiver = msg.receiver_profile as any;
                      return (
                        <div key={msg.id} className="rounded border border-border bg-background p-2">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
                            <span>To: <span className="font-medium text-foreground">{receiver?.display_name || receiver?.full_name || "Unknown"}</span></span>
                            <Badge variant="outline" className={`text-[8px] ${categoryColors[msg.category] || ""}`}>{msg.category}</Badge>
                            <span className="ml-auto flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" /> {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs text-foreground line-clamp-2">{msg.content}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
