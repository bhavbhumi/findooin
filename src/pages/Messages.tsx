import { useEffect, useState, useRef, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useMessages, MESSAGE_CATEGORIES, type MessageCategory } from "@/hooks/useMessages";
import { useRole } from "@/contexts/RoleContext";
import { useUserActivityStatus } from "@/hooks/useAdmin";
import AppNavbar from "@/components/AppNavbar";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, MessageSquare, CheckCheck, Search, Circle, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";

/* ── Date separator helper ── */
function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d, yyyy");
}

type ConvFilter = "all" | "unread";

const Messages = () => {
  usePageMeta({ title: "Messages" });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { activeRole } = useRole();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<MessageCategory>("general");
  const [convFilter, setConvFilter] = useState<ConvFilter>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    messages,
    loading,
    sending,
    otherTyping,
    selectedUserId,
    selectedProfile,
    recipientRoles,
    totalUnread,
    openConversation,
    closeConversation,
    sendMessage,
    handleTyping,
  } = useMessages(currentUserId);

  const { data: recipientActivity } = useUserActivityStatus(selectedUserId);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setCurrentUserId(session.user.id);
    });
  }, []);

  // Auto-open conversation from ?user= URL param
  const targetUserParam = searchParams.get("user");
  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (targetUserParam && currentUserId && !loading && !hasAutoOpened.current) {
      hasAutoOpened.current = true;
      openConversation(targetUserParam);
      if (searchParams.has("user")) {
        setSearchParams({}, { replace: true });
      }
    }
  }, [targetUserParam, currentUserId, loading, openConversation, searchParams, setSearchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  const handleSend = useCallback(async () => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage, activeCategory);
    setNewMessage("");
  }, [newMessage, activeCategory, sendMessage]);

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const filteredConversations = conversations.filter((c) => {
    if (convFilter === "unread" && c.unread_count === 0) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.display_name?.toLowerCase().includes(q);
  });

  const recipientIsInvestorOnly = recipientRoles.length > 0 && recipientRoles.length === 1 && recipientRoles[0] === "investor";
  const allowedCategories = recipientIsInvestorOnly
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

  // If recipient is investor-only, force category to general
  useEffect(() => {
    if (recipientIsInvestorOnly) setActiveCategory("general");
  }, [recipientIsInvestorOnly]);

  /* ── Group messages by date for separators ── */
  const messagesInCategory = messages.filter((msg) => (msg.category || "general") === activeCategory);
  const groupedMessages: { type: "date" | "msg"; date?: string; msg?: typeof messages[0] }[] = [];
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
        "flex-1 min-h-0 container max-w-4xl mx-auto md:pt-4 md:px-4 md:pb-4 pb-[4.5rem]",
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
                  <Button variant="ghost" size="icon" className="md:hidden shrink-0 h-8 w-8" onClick={closeConversation}>
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

                {/* Inactive user warning */}
                {recipientActivity && (recipientActivity.status === "inactive" || recipientActivity.status === "dormant") && (
                  <div className="mx-2.5 mt-1.5 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      This user has been {recipientActivity.status} for {recipientActivity.days_inactive} days and may not respond.
                    </p>
                  </div>
                )}
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
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
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
