import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TeamAffiliation {
  id: string;
  user_id: string;
  entity_profile_id: string;
  designation: string;
  department: string | null;
  branch_location: string | null;
  status: "pending" | "verified" | "rejected" | "departed";
  requested_at: string;
  verified_at: string | null;
  // joined profile fields
  member_name?: string;
  member_avatar?: string | null;
  member_headline?: string | null;
  member_verification?: string;
}

export interface EntityLocation {
  id: string;
  entity_profile_id: string;
  location_type: string;
  label: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  is_headquarters: boolean;
}

/** Fetch team members for an entity profile */
export function useEntityTeam(entityProfileId: string | undefined) {
  return useQuery({
    queryKey: ["entity-team", entityProfileId],
    enabled: !!entityProfileId,
    queryFn: async (): Promise<TeamAffiliation[]> => {
      if (!entityProfileId) return [];
      const { data, error } = await supabase
        .from("team_affiliations")
        .select("*")
        .eq("entity_profile_id", entityProfileId)
        .order("verified_at", { ascending: false, nullsFirst: false });
      if (error) throw error;

      if (!data?.length) return [];

      // Fetch member profiles
      const userIds = data.map((a: any) => a.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, headline, verification_status")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return data.map((a: any) => {
        const p = profileMap.get(a.user_id);
        return {
          ...a,
          member_name: p?.display_name || p?.full_name || "Unknown",
          member_avatar: p?.avatar_url || null,
          member_headline: p?.headline || null,
          member_verification: p?.verification_status || "unverified",
        };
      });
    },
    staleTime: 60_000,
  });
}

/** Fetch entity locations (custom + from registry) */
export function useEntityLocations(entityProfileId: string | undefined) {
  return useQuery({
    queryKey: ["entity-locations", entityProfileId],
    enabled: !!entityProfileId,
    queryFn: async (): Promise<{ custom: EntityLocation[]; registry: any[] }> => {
      if (!entityProfileId) return { custom: [], registry: [] };

      // Fetch custom locations
      const { data: custom } = await supabase
        .from("entity_locations")
        .select("*")
        .eq("entity_profile_id", entityProfileId)
        .order("is_headquarters", { ascending: false });

      // Fetch registry addresses for this entity (matched_user_id)
      const { data: registryData } = await supabase
        .from("registry_entities")
        .select("id, entity_name, address, city, state, pincode, registration_category, source")
        .eq("matched_user_id", entityProfileId);

      return {
        custom: (custom as EntityLocation[]) || [],
        registry: registryData || [],
      };
    },
    staleTime: 120_000,
  });
}

/** Request affiliation with an entity */
export function useRequestAffiliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      entity_profile_id: string;
      designation: string;
      department?: string;
      branch_location?: string;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase.from("team_affiliations").insert({
        user_id: session.user.id,
        entity_profile_id: params.entity_profile_id,
        designation: params.designation,
        department: params.department || null,
        branch_location: params.branch_location || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success("Affiliation request sent");
      qc.invalidateQueries({ queryKey: ["entity-team", vars.entity_profile_id] });
    },
    onError: (err: any) => {
      if (err.message?.includes("duplicate")) {
        toast.error("You already have a pending or active affiliation with this entity");
      } else {
        toast.error("Failed to send request");
      }
    },
  });
}

/** Entity admin: verify/reject affiliation */
export function useManageAffiliation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; action: "verified" | "rejected" | "departed"; entityProfileId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const updates: any = { status: params.action };
      if (params.action === "verified") {
        updates.verified_at = new Date().toISOString();
        updates.verified_by = session.user.id;
      }
      if (params.action === "departed") {
        updates.departed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("team_affiliations")
        .update(updates)
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      toast.success(`Affiliation ${vars.action}`);
      qc.invalidateQueries({ queryKey: ["entity-team", vars.entityProfileId] });
    },
    onError: () => toast.error("Action failed"),
  });
}
