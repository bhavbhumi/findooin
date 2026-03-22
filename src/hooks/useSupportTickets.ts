/**
 * useSupportTickets — Hooks for support ticket CRUD and replies.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface SupportTicket {
  id: string;
  user_id: string | null;
  subject: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  resolved_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string; display_name: string | null; avatar_url: string | null };
  reply_count?: number;
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_admin_reply: boolean;
  created_at: string;
  profile?: { full_name: string; display_name: string | null; avatar_url: string | null };
}

// ── Admin: all tickets ──────────────────────────────
export function useAdminTickets(statusFilter?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminTickets(statusFilter),
    queryFn: async (): Promise<SupportTicket[]> => {
      let query = supabase
        .from("support_tickets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const userIds = [...new Set((data || []).map((t: any) => t.user_id).filter(Boolean))];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, full_name, display_name, avatar_url").in("id", userIds)
        : { data: [] };

      // Count replies per ticket
      const ticketIds = (data || []).map((t: any) => t.id);
      const { data: replyCounts } = ticketIds.length
        ? await supabase.from("ticket_replies").select("ticket_id").in("ticket_id", ticketIds)
        : { data: [] };

      const replyMap: Record<string, number> = {};
      (replyCounts || []).forEach((r: any) => {
        replyMap[r.ticket_id] = (replyMap[r.ticket_id] || 0) + 1;
      });

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));

      return (data || []).map((t: any) => ({
        ...t,
        profile: t.user_id ? profileMap[t.user_id] || null : null,
        reply_count: replyMap[t.id] || 0,
      }));
    },
    staleTime: 10_000,
  });
}

// ── User: own tickets ──────────────────────────────
export function useMyTickets() {
  return useQuery({
    queryKey: ["my-tickets"],
    queryFn: async (): Promise<SupportTicket[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 10_000,
  });
}

// ── Ticket replies ──────────────────────────────────
export function useTicketReplies(ticketId: string | null) {
  return useQuery({
    queryKey: ["ticket-replies", ticketId],
    enabled: !!ticketId,
    queryFn: async (): Promise<TicketReply[]> => {
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId!)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((r: any) => r.user_id))];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, full_name, display_name, avatar_url").in("id", userIds)
        : { data: [] };

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));

      return (data || []).map((r: any) => ({
        ...r,
        profile: profileMap[r.user_id] || null,
      }));
    },
    staleTime: 5_000,
  });
}

// ── Create ticket ───────────────────────────────────
export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ticket: { subject: string; description: string; category: string; priority: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from("support_tickets").insert({
        user_id: session.user.id,
        subject: ticket.subject,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ticket submitted successfully");
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

// ── Reply to ticket ─────────────────────────────────
export function useReplyToTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, content, isAdmin }: { ticketId: string; content: string; isAdmin: boolean }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from("ticket_replies").insert({
        ticket_id: ticketId,
        user_id: session.user.id,
        content,
        is_admin_reply: isAdmin,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success("Reply sent");
      qc.invalidateQueries({ queryKey: ["ticket-replies", vars.ticketId] });
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}

// ── Update ticket status (admin) ────────────────────
export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ticketId, status, assignedTo }: { ticketId: string; status: string; assignedTo?: string | null }) => {
      const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
      if (assignedTo !== undefined) updates.assigned_to = assignedTo;
      if (status === "resolved") updates.resolved_at = new Date().toISOString();

      const { error } = await supabase.from("support_tickets").update(updates).eq("id", ticketId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ticket updated");
      qc.invalidateQueries({ queryKey: ["admin-tickets"] });
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
    },
    onError: (err: any) => toast.error(err.message),
  });
}
