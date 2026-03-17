/**
 * AdminSupportDashboard — Full support ticket management for admins.
 * Features: ticket queue, status filters, detail/reply panel, SLA indicators.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Ticket, Clock, CheckCircle2, AlertTriangle, MessageSquare, Send, User, XCircle } from "lucide-react";
import { useAdminTickets, useTicketReplies, useReplyToTicket, useUpdateTicketStatus, type SupportTicket } from "@/hooks/useSupportTickets";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  in_progress: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  resolved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  closed: "bg-muted text-muted-foreground border-border",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  high: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  urgent: "bg-destructive/10 text-destructive",
};

function getSlaHours(priority: string) {
  switch (priority) {
    case "urgent": return 4;
    case "high": return 12;
    case "medium": return 24;
    case "low": return 72;
    default: return 24;
  }
}

function isSlaBreached(ticket: SupportTicket) {
  if (ticket.status === "resolved" || ticket.status === "closed") return false;
  const slaMs = getSlaHours(ticket.priority) * 3600_000;
  return Date.now() - new Date(ticket.created_at).getTime() > slaMs;
}

export function AdminSupportDashboard() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const { data: tickets = [], isLoading } = useAdminTickets(statusFilter);

  const filtered = tickets.filter((t) =>
    !searchQuery ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
    breached: tickets.filter(isSlaBreached).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={<Ticket className="h-4 w-4" />} label="Total" value={stats.total} />
        <StatCard icon={<Clock className="h-4 w-4 text-amber-500" />} label="Open" value={stats.open} />
        <StatCard icon={<MessageSquare className="h-4 w-4 text-blue-500" />} label="In Progress" value={stats.inProgress} />
        <StatCard icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} label="Resolved" value={stats.resolved} />
        <StatCard icon={<AlertTriangle className="h-4 w-4 text-destructive" />} label="SLA Breach" value={stats.breached} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="in_progress">Active</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Ticket list */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading tickets...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No tickets found</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground truncate">{ticket.subject}</span>
                      {isSlaBreached(ticket) && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">SLA</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{ticket.profile?.full_name || "Anonymous"}</span>
                      <span>·</span>
                      <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                      {ticket.reply_count ? (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" /> {ticket.reply_count}</span>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[ticket.priority] || ""}`}>
                      {ticket.priority}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[ticket.status] || ""}`}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail sheet */}
      <TicketDetailSheet ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <p className="text-xl font-bold font-heading">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketDetailSheet({ ticket, onClose }: { ticket: SupportTicket | null; onClose: () => void }) {
  const { data: replies = [], isLoading: repliesLoading } = useTicketReplies(ticket?.id || null);
  const replyMutation = useReplyToTicket();
  const updateStatus = useUpdateTicketStatus();
  const [replyText, setReplyText] = useState("");

  const handleReply = () => {
    if (!replyText.trim() || !ticket) return;
    replyMutation.mutate({ ticketId: ticket.id, content: replyText.trim(), isAdmin: true }, {
      onSuccess: () => setReplyText(""),
    });
  };

  const handleStatusChange = (status: string) => {
    if (!ticket) return;
    updateStatus.mutate({ ticketId: ticket.id, status });
  };

  return (
    <Sheet open={!!ticket} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle className="text-base font-bold pr-6">{ticket?.subject}</SheetTitle>
        </SheetHeader>

        {ticket && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Meta */}
            <div className="px-4 py-3 space-y-2 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{ticket.profile?.full_name || "Anonymous"}</span>
                <span>·</span>
                <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={`text-[10px] ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</Badge>
                <Badge variant="outline" className="text-[10px]">{ticket.category}</Badge>
                {isSlaBreached(ticket) && <Badge variant="destructive" className="text-[10px]">SLA Breached</Badge>}
              </div>
              {ticket.description && (
                <p className="text-sm text-muted-foreground mt-1">{ticket.description}</p>
              )}

              {/* Status controls */}
              <div className="flex items-center gap-2 pt-1">
                <Select value={ticket.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-8 text-xs w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Replies */}
            <ScrollArea className="flex-1 px-4 py-3">
              {repliesLoading ? (
                <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
              ) : replies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No replies yet</p>
              ) : (
                <div className="space-y-3">
                  {replies.map((r) => (
                    <div key={r.id} className={`rounded-lg p-3 text-sm ${r.is_admin_reply ? "bg-primary/5 border border-primary/10 ml-4" : "bg-muted mr-4"}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{r.profile?.full_name || "User"}</span>
                        {r.is_admin_reply && <Badge variant="secondary" className="text-[9px] px-1">Admin</Badge>}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{r.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Reply input */}
            {ticket.status !== "closed" && (
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[60px] text-sm resize-none"
                    onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) handleReply(); }}
                  />
                  <Button size="icon" className="shrink-0 self-end" onClick={handleReply} disabled={!replyText.trim() || replyMutation.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
