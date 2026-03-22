import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables, TablesInsert } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export type Invitation = Tables<"invitations">;

export function useInvitations(filters?: { status?: string; role?: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.adminInvitations(filters as any),
    queryFn: async () => {
      let query = supabase
        .from("invitations")
        .select("*, registry_entities(entity_name, registration_number, source)")
        .order("created_at", { ascending: false });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters?.role && filters.role !== "all") {
        query = query.eq("target_role", filters.role);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitation: Omit<TablesInsert<"invitations">, "created_by"> & { created_by?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("invitations")
        .insert({ ...invitation, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      toast.success("Invitation created");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useBulkCreateInvitations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (invitations: Array<Omit<TablesInsert<"invitations">, "created_by">>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const rows = invitations.map((inv) => ({ ...inv, created_by: user.id }));
      const { data, error } = await supabase
        .from("invitations")
        .insert(rows)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      toast.success(`${data.length} invitations created`);
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<TablesInsert<"invitations">>) => {
      const { data, error } = await supabase
        .from("invitations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useArchiveInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const reactivateDate = new Date();
      reactivateDate.setMonth(reactivateDate.getMonth() + 3);

      const { error } = await supabase
        .from("invitations")
        .update({
          status: "archived",
          archived_at: new Date().toISOString(),
          reactivate_after: reactivateDate.toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      toast.success("Invitation archived (reactivates in 3 months)");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useReactivateInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("invitations")
        .update({
          status: "active",
          reminder_count: 0,
          archived_at: null,
          reactivate_after: null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      toast.success("Invitation reactivated");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useRegistryEntities(search?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.registryEntities(search),
    queryFn: async () => {
      let query = supabase
        .from("registry_entities")
        .select("*")
        .is("matched_user_id", null)
        .order("entity_name")
        .limit(100);

      if (search) {
        query = query.or(`entity_name.ilike.%${search}%,registration_number.ilike.%${search}%,contact_email.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: true,
  });
}
