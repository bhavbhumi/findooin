import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string;
  website: string | null;
  industry: string;
  entity_type: string;
  registry_entity_id: string | null;
  claimed_by: string | null;
  claimed_at: string | null;
  is_verified: boolean;
  employee_count_range: string | null;
  founded_year: number | null;
  created_at: string;
}

export interface OrgBranch {
  id: string;
  org_id: string;
  branch_name: string;
  branch_type: string;
  address_line: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  is_headquarters: boolean;
}

export interface OrgDepartment {
  id: string;
  org_id: string;
  name: string;
  description: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  department_id: string | null;
  branch_id: string | null;
  designation: string;
  employment_type: string;
  status: "pending" | "verified" | "rejected" | "alumni";
  joined_at: string | null;
  left_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  // joined data
  profile?: { full_name: string; avatar_url: string | null; headline: string | null };
  department?: { name: string } | null;
  branch?: { branch_name: string; city: string | null } | null;
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function useOrganization(slugOrId?: string) {
  return useQuery({
    queryKey: ["organization", slugOrId],
    enabled: !!slugOrId,
    queryFn: async () => {
      // Try slug first, then id
      let { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slugOrId!)
        .maybeSingle();

      if (!data && !error) {
        ({ data, error } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", slugOrId!)
          .maybeSingle());
      }
      if (error) throw error;
      return data as Organization | null;
    },
  });
}

export function useOrgBranches(orgId?: string) {
  return useQuery({
    queryKey: ["org-branches", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_branches")
        .select("*")
        .eq("org_id", orgId!)
        .order("is_headquarters", { ascending: false });
      if (error) throw error;
      return data as OrgBranch[];
    },
  });
}

export function useOrgDepartments(orgId?: string) {
  return useQuery({
    queryKey: ["org-departments", orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("org_departments")
        .select("*")
        .eq("org_id", orgId!)
        .order("name");
      if (error) throw error;
      return data as OrgDepartment[];
    },
  });
}

export function useOrgMembers(orgId?: string, statusFilter?: string) {
  return useQuery({
    queryKey: ["org-members", orgId, statusFilter],
    enabled: !!orgId,
    queryFn: async () => {
      let query = supabase
        .from("org_members")
        .select(`
          *,
          profile:profiles!org_members_user_id_fkey(full_name, avatar_url, headline),
          department:org_departments(name),
          branch:org_branches(branch_name, city)
        `)
        .eq("org_id", orgId!);

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter as "pending" | "verified" | "rejected" | "alumni");
      }
      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as OrgMember[];
    },
  });
}

export function useMyOrgMemberships() {
  return useQuery({
    queryKey: ["my-org-memberships"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from("org_members")
        .select("*, organization:organizations(id, name, slug, logo_url, is_verified)")
        .eq("user_id", user.id);
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string; website?: string; entity_type?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const slug = slugify(input.name);
      const { data, error } = await supabase
        .from("organizations")
        .insert({
          name: input.name,
          slug,
          description: input.description || "",
          website: input.website || null,
          entity_type: input.entity_type || "company",
          claimed_by: user.id,
          claimed_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-org-memberships"] });
      toast.success("Organization created");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useClaimMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { org_id: string; designation: string; department_id?: string; branch_id?: string; joined_at?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("org_members")
        .insert({
          org_id: input.org_id,
          user_id: user.id,
          designation: input.designation,
          department_id: input.department_id || null,
          branch_id: input.branch_id || null,
          joined_at: input.joined_at || null,
          status: "pending",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-org-memberships"] });
      toast.success("Membership claim submitted — pending org admin approval");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useVerifyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, action, reason }: { memberId: string; action: "verified" | "rejected" | "alumni"; reason?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const update: Record<string, unknown> = {
        status: action,
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (reason) update.rejection_reason = reason;
      const { error } = await supabase
        .from("org_members")
        .update(update)
        .eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["org-members"] });
      toast.success(`Member ${vars.action}`);
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useManageBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<OrgBranch> & { org_id: string }) => {
      const { id: _id, ...rest } = input;
      if (input.id) {
        const { error } = await supabase.from("org_branches").update(rest).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("org_branches").insert({ ...rest, branch_name: rest.branch_name || "" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-branches"] });
      toast.success("Branch saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useManageDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; org_id: string; name: string; description?: string }) => {
      if (input.id) {
        const { error } = await supabase.from("org_departments").update({ name: input.name, description: input.description || "" }).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("org_departments").insert({ org_id: input.org_id, name: input.name, description: input.description || "" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["org-departments"] });
      toast.success("Department saved");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
