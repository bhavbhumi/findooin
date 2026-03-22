/**
 * useContacts — Manages imported phone contacts for the current user.
 * Supports importing, matching against existing users, and tracking invite status.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface UserContact {
  id: string;
  user_id: string;
  contact_name: string | null;
  phone_number: string;
  email: string | null;
  matched_user_id: string | null;
  invite_status: string;
  invited_at: string | null;
  invited_via: string | null;
  created_at: string;
}

export interface ContactInput {
  name?: string;
  phone: string;
  email?: string;
}

/** Normalize phone to digits-only with country code */
function normalizePhone(raw: string): string {
  let digits = raw.replace(/[^\d+]/g, "");
  // Indian numbers without country code
  if (digits.startsWith("0")) digits = "+91" + digits.slice(1);
  if (!digits.startsWith("+")) digits = "+91" + digits;
  return digits;
}

export function useContacts() {
  const { userId } = useRole();
  const qc = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["user-contacts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_contacts")
        .select("*")
        .eq("user_id", userId)
        .order("contact_name", { ascending: true });
      if (error) throw error;
      return (data || []) as UserContact[];
    },
    enabled: !!userId,
  });

  const importContacts = useMutation({
    mutationFn: async (inputs: ContactInput[]) => {
      if (!userId) throw new Error("Not authenticated");

      const normalized = inputs
        .filter((c) => c.phone && c.phone.trim().length >= 7)
        .map((c) => ({
          user_id: userId,
          contact_name: c.name?.trim() || null,
          phone_number: normalizePhone(c.phone),
          email: c.email?.trim() || null,
          invite_status: "not_invited",
        }));

      if (normalized.length === 0) throw new Error("No valid contacts to import");

      // Upsert to handle duplicates gracefully
      const { data, error } = await supabase
        .from("user_contacts")
        .upsert(normalized, { onConflict: "user_id,phone_number", ignoreDuplicates: true })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-contacts", userId] }),
  });

  const markInvited = useMutation({
    mutationFn: async ({ contactId, channel }: { contactId: string; channel: string }) => {
      const { error } = await supabase
        .from("user_contacts")
        .update({
          invite_status: "invited",
          invited_at: new Date().toISOString(),
          invited_via: channel,
        })
        .eq("id", contactId)
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user-contacts", userId] }),
  });

  const stats = {
    total: contacts.length,
    invited: contacts.filter((c) => c.invite_status === "invited").length,
    matched: contacts.filter((c) => c.matched_user_id).length,
    notInvited: contacts.filter((c) => c.invite_status === "not_invited").length,
  };

  return {
    contacts,
    isLoading,
    importContacts,
    markInvited,
    stats,
  };
}
