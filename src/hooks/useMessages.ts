/**
 * useMessages — Messaging hook with Supabase Realtime.
 *
 * Owns all messaging data access: conversations list, message thread,
 * realtime channel subscriptions, typing presence, read receipts,
 * and send logic. Extracts inline Supabase calls from Messages.tsx
 * to follow the hook-per-module pattern.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeText } from "@/lib/sanitize";
import { useCodedMessagingGuard } from "@/hooks/useCodedMessagingGuard";

const MESSAGE_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "sales", label: "Sales" },
  { value: "ops", label: "Ops" },
  { value: "accounts", label: "Accounts" },
  { value: "support", label: "Support" },
  { value: "complaint", label: "Complaint" },
] as const;

type MessageCategory = (typeof MESSAGE_CATEGORIES)[number]["value"];

export interface Conversation {
  user_id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  is_online?: boolean;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  category: MessageCategory;
}

export { MESSAGE_CATEGORIES };
export type { MessageCategory };

export function useMessages(currentUserId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<{
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [recipientRoles, setRecipientRoles] = useState<string[]>([]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { scanAndFlag } = useCodedMessagingGuard();

  /* ── Load conversations ── */
  const loadConversations = useCallback(async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_conversations", { p_user_id: uid });

    if (error || !data) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const convList: Conversation[] = ((data as any[]) || []).map((c: any) => ({
      user_id: c.user_id,
      full_name: c.full_name || "Unknown",
      display_name: c.display_name || null,
      avatar_url: c.avatar_url || null,
      last_message: c.last_message || "",
      last_message_at: c.last_message_at || "",
      unread_count: Number(c.unread_count) || 0,
    }));

    setConversations(convList);
    setLoading(false);
  }, []);

  /* ── Initial load ── */
  useEffect(() => {
    if (currentUserId) loadConversations(currentUserId);
  }, [currentUserId, loadConversations]);

  /* ── Realtime: new messages + read receipts ── */
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
  }, [currentUserId, selectedUserId, loadConversations]);

  /* ── Typing presence ── */
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

  useEffect(() => {
    if (!currentUserId || !selectedUserId) {
      typingChannelRef.current = null;
      return;
    }
    const roomId = [currentUserId, selectedUserId].sort().join("-");
    typingChannelRef.current = supabase.channel(`typing:${roomId}`);
  }, [currentUserId, selectedUserId]);

  const broadcastTyping = useCallback((typing: boolean) => {
    typingChannelRef.current?.track({ typing });
  }, []);

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

  /* ── Open a conversation ── */
  const openConversation = useCallback(async (userId: string) => {
    if (!currentUserId) return;
    setSelectedUserId(userId);

    const conv = conversations.find((c) => c.user_id === userId);
    if (!conv) {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, display_name, avatar_url")
        .eq("id", userId)
        .single();
      if (profileData) {
        setSelectedProfile({
          full_name: profileData.full_name,
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url,
        });
      }
    } else {
      setSelectedProfile({
        full_name: conv.full_name,
        display_name: conv.display_name,
        avatar_url: conv.avatar_url,
      });
    }

    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = rolesData?.map((r) => r.role) || ["investor"];
    setRecipientRoles(roles);

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
  }, [currentUserId, conversations, loadConversations]);

  /* ── Send a message ── */
  const sendMessage = useCallback(async (content: string, category: MessageCategory) => {
    if (!currentUserId || !selectedUserId || !content.trim() || sending) return;
    setSending(true);
    setIsTyping(false);
    broadcastTyping(false);

    const { data: msgData } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: selectedUserId,
      content: sanitizeText(content.trim()),
      category,
    } as any).select("id").single();

    if (msgData) {
      scanAndFlag({
        resourceType: "message",
        resourceId: (msgData as any).id,
        authorId: currentUserId,
        content: content.trim(),
      });
    }

    setSending(false);
  }, [currentUserId, selectedUserId, sending, broadcastTyping, scanAndFlag]);

  /* ── Close conversation (go back to list) ── */
  const closeConversation = useCallback(() => {
    setSelectedUserId(null);
    setSelectedProfile(null);
    setMessages([]);
    setRecipientRoles([]);
  }, []);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  return {
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
    loadConversations,
    MESSAGE_CATEGORIES,
  };
}
