import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import AppNavbar from "@/components/AppNavbar";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, MessageSquare, CheckCheck, Search, Filter, Circle } from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";

const MESSAGE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "sales", label: "Sales" },
  { value: "ops", label: "Ops" },
  { value: "accounts", label: "Accounts" },
  { value: "support", label: "Support" },
  { value: "complaint", label: "Complaint" },
] as const;

type MessageCategory = typeof MESSAGE_CATEGORIES[number]["value"];

interface Conversation {
  user_id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_online?: boolean;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  category: MessageCategory;
}

/* ── Date separator helper ── */
function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

/* ── Conversation filter tabs ── */
type ConvFilter = "all" | "unread";

const Messages = () => {
  const navigate = useNavigate();
  const { activeRole } = useRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<MessageCategory>("general");
  const [convFilter, setConvFilter] = useState<ConvFilter>("all");
  const [isTyping, setIsTyping] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<{ full_name: string; display_name: string | null; avatar_url: string | null } | null>(null);
  const [recipientRoles, setRecipientRoles] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setCurrentUserId(session.user.id);
      loadConversations(session.user.id);
    });
  }, []);

  // Realtime for new messages
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
          if (selectedUserId && (msg.sender_id === selectedUserId || msg.receiver_id === selectedUserId)) {
            setMessages((prev) => [...prev, msg]);
            if (msg.receiver_id === currentUserId) {
              supabase.from("messages").update({ read: true }).eq("id", msg.id).then(() => {});
            }
          }
          loadConversations(currentUserId);
        }
      })
      // Listen for read receipt updates
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const updated = payload.new as Message;
        if (updated.sender_id === currentUserId) {
          setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, read: updated.read } : m));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, selectedUserId]);

  // Typing indicator via presence
  useEffect(() => {
    if (!currentUserId || !selectedUserId) return;
    const roomId = [currentUserId, selectedUserId].sort().join("-");
    const channel = supabase.channel(`typing:${roomId}`, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const otherPresence = state[selectedUserId];
        setOtherTyping(!!(otherPresence as any)?.[0]?.typing);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, selectedUserId]);

  const broadcastTyping = useCallback((typing: boolean) => {
    if (!currentUserId || !selectedUserId) return;
    const roomId = [currentUserId, selectedUserId].sort().join("-");
    const channel = supabase.channel(`typing:${roomId}`);
    channel.track({ typing });
  }, [currentUserId, selectedUserId]);

  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      broadcastTyping(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      broadcastTyping(false);
    }, 2000);
  }, [isTyping, broadcastTyping]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const loadConversations = async (uid: string) => {
    setLoading(true);
    const { data: allMsgs } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: false });

    if (!allMsgs || allMsgs.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convMap = new Map<string, { last_message: string; last_message_at: string; unread_count: number }>();
    allMsgs.forEach((m: any) => {
      const otherUser = m.sender_id === uid ? m.receiver_id : m.sender_id;
      if (!convMap.has(otherUser)) {
        convMap.set(otherUser, { last_message: m.content, last_message_at: m.created_at, unread_count: 0 });
      }
      if (m.receiver_id === uid && !m.read) {
        convMap.get(otherUser)!.unread_count++;
      }
    });

    const otherIds = Array.from(convMap.keys());
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, display_name, avatar_url")
      .in("id", otherIds);

    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]));

    const convList: Conversation[] = otherIds
      .map((id) => {
        const p = profileMap.get(id);
        const c = convMap.get(id)!;
        return {
          user_id: id,
          full_name: p?.full_name || "Unknown",
          display_name: p?.display_name || null,
          avatar_url: p?.avatar_url || null,
          ...c,
        };
      })
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    setConversations(convList);
    setLoading(false);
  };

  const openConversation = async (userId: string) => {
    if (!currentUserId) return;
    setSelectedUserId(userId);
    const conv = conversations.find((c) => c.user_id === userId);
    setSelectedProfile(conv ? { full_name: conv.full_name, display_name: conv.display_name, avatar_url: conv.avatar_url } : null);

    // Fetch recipient's roles to determine allowed message categories
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = rolesData?.map((r) => r.role) || ["investor"];
    setRecipientRoles(roles);
    // If recipient is investor-only, force category to general
    const isInvestorOnly = roles.length === 1 && roles[0] === "investor";
    if (isInvestorOnly || activeRole === "investor") setActiveCategory("general");

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true });

    setMessages((data as Message[]) || []);

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", userId)
      .eq("receiver_id", currentUserId)
      .eq("read", false);

    loadConversations(currentUserId);
  };

  const sendMessage = useCallback(async () => {
    if (!currentUserId || !selectedUserId || !newMessage.trim() || sending) return;
    setSending(true);
    setIsTyping(false);
    broadcastTyping(false);
    await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: selectedUserId,
      content: newMessage.trim(),
      category: activeCategory,
    } as any);
    setNewMessage("");
    setSending(false);
  }, [currentUserId, selectedUserId, newMessage, sending, activeCategory, broadcastTyping]);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const filteredConversations = conversations.filter((c) => {
    if (convFilter === "unread" && c.unread_count === 0) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.display_name?.toLowerCase().includes(q);
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  // Restrict to general-only if sender is investor OR recipient is investor-only
  const recipientIsInvestorOnly = recipientRoles.length > 0 && recipientRoles.length === 1 && recipientRoles[0] === "investor";
  const senderIsInvestor = activeRole === "investor";
  const restrictToGeneral = senderIsInvestor || recipientIsInvestorOnly;
  const allowedCategories = restrictToGeneral
    ? MESSAGE_CATEGORIES.filter((c) => c.value === "general")
    : MESSAGE_CATEGORIES;

  const categoryColor: Record<string, string> = {
    general: "",
    sales: "bg-accent/10 text-accent border-accent/20",
    ops: "bg-primary/10 text-primary border-primary/20",
    accounts: "bg-intermediary/10 text-intermediary border-intermediary/20",
    support: "bg-issuer/10 text-issuer border-issuer/20",
    complaint: "bg-destructive/10 text-destructive border-destructive/20",
  };

  /* ── Group messages by date for separators ── */
  const messagesInCategory = messages.filter((msg) => (msg.category || "general") === activeCategory);
  const groupedMessages: { type: "date" | "msg"; date?: string; msg?: Message }[] = [];
  let lastDate = "";
  messagesInCategory.forEach((msg) => {
    const dateLabel = getDateLabel(msg.created_at);
    if (dateLabel !== lastDate) {
      groupedMessages.push({ type: "date", date: dateLabel });
      lastDate = dateLabel;
    }
    groupedMessages.push({ type: "msg", msg });
  });

  return (
    <div className="h-screen flex flex-col bg-background">
      <AppNavbar />
      <div className={cn(
        "flex-1 min-h-0 container max-w-4xl mx-auto md:pt-4 md:px-4 md:pb-4 pb-16",
        selectedUserId ? "px-0 pt-0" : "px-2 pt-2"
      )}>
        <div className={cn(
          "flex bg-card overflow-hidden h-full",
          selectedUserId ? "md:rounded-xl md:border md:border-border" : "rounded-xl border border-border"
        )}>
          {/* Conversation list */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col shrink-0 ${selectedUserId ? "hidden md:flex" : "flex"}`}>
            <div className="p-3 border-b border-border space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-heading text-foreground">Messages</h2>
                {totalUnread > 0 && (
                  <Badge variant="secondary" className="text-[10px]">{totalUnread} unread</Badge>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
              {/* Filter tabs */}
              <div className="flex gap-1">
                <button
                  onClick={() => setConvFilter("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                    convFilter === "all" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  All
                </button>
                <button
                  onClick={() => setConvFilter("unread")}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors",
                    convFilter === "unread" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  Unread {totalUnread > 0 && `(${totalUnread})`}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-3 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {convFilter === "unread" ? "No unread conversations" : "No conversations yet"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.user_id}
                    onClick={() => openConversation(conv.user_id)}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left ${
                      selectedUserId === conv.user_id ? "bg-muted/70" : ""
                    }`}
                  >
                    <div className="relative">
                      <NetworkAvatar src={conv.avatar_url} initials={getInitials(conv.full_name)} size="sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={cn("text-sm truncate", conv.unread_count > 0 ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                          {conv.display_name || conv.full_name}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: false })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={cn("text-xs truncate flex-1", conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground")}>
                          {conv.last_message}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="h-4 min-w-4 px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col min-w-0 ${!selectedUserId ? "hidden md:flex" : "flex"}`}>
            {selectedUserId && selectedProfile ? (
              <>
                {/* Chat header */}
                <div className="p-2.5 border-b border-border flex items-center gap-2.5">
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-8 w-8" onClick={() => setSelectedUserId(null)}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div className="relative">
                    <NetworkAvatar src={selectedProfile.avatar_url} initials={getInitials(selectedProfile.full_name)} size="sm" className="!h-8 !w-8 text-xs" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">
                      {selectedProfile.display_name || selectedProfile.full_name}
                    </p>
                    {otherTyping && (
                      <p className="text-[10px] text-accent animate-pulse">typing...</p>
                    )}
                  </div>
                </div>

                {/* Category tabs */}
                <div className="flex items-center gap-0.5 px-2.5 py-1.5 border-b border-border overflow-x-auto scrollbar-hide">
                  {allowedCategories.map((cat) => {
                    const catMsgCount = messages.filter((m) => (m.category || "general") === cat.value).length;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setActiveCategory(cat.value)}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors border",
                          activeCategory === cat.value
                            ? categoryColor[cat.value] || "bg-foreground/10 text-foreground border-foreground/20"
                            : "text-muted-foreground border-transparent hover:bg-muted/50"
                        )}
                      >
                        {cat.label}
                        {catMsgCount > 0 && (
                          <span className="ml-1 text-[9px] opacity-60">{catMsgCount}</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Messages with date separators */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {groupedMessages.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-12">
                      <p className="text-xs text-muted-foreground">No messages in {MESSAGE_CATEGORIES.find(c => c.value === activeCategory)?.label}</p>
                    </div>
                  )}
                  {groupedMessages.map((item, idx) => {
                    if (item.type === "date") {
                      return (
                        <div key={`date-${idx}`} className="flex items-center gap-3 py-2">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[10px] text-muted-foreground font-medium">{item.date}</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                      );
                    }
                    const msg = item.msg!;
                    const isMine = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-3 py-1.5",
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        )}>
                          <p className="text-[13px] leading-snug break-words">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : ""}`}>
                            <span className={`text-[10px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                              {format(new Date(msg.created_at), "h:mm a")}
                            </span>
                            {isMine && (
                              <CheckCheck className={cn("h-3 w-3", msg.read ? "text-accent" : "text-primary-foreground/40")} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Typing indicator */}
                  {otherTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-2.5 border-t border-border space-y-1.5">
                  {activeCategory !== "general" && (
                    <Badge variant="outline" className={cn("text-[10px]", categoryColor[activeCategory])}>
                      {MESSAGE_CATEGORIES.find(c => c.value === activeCategory)?.label}
                    </Badge>
                  )}
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      placeholder={`Type a message${activeCategory !== "general" ? ` (${MESSAGE_CATEGORIES.find(c => c.value === activeCategory)?.label})` : ""}...`}
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      className="flex-1 h-9 text-[13px]"
                      autoFocus
                    />
                    <Button type="submit" size="icon" className="h-9 w-9" disabled={!newMessage.trim() || sending}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-foreground font-semibold">Select a conversation</p>
                  <p className="text-sm text-muted-foreground mt-1">Choose from your existing conversations or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
