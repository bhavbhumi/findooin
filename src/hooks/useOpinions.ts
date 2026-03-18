/**
 * useOpinions — Hook for fetching, voting, and managing professional opinions.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export type OpinionFormat = "binary" | "multiple_choice" | "scale" | "over_under";
export type OpinionStatus = "draft" | "active" | "closed" | "archived";
export type OpinionCategory =
  | "rbi_monetary_policy"
  | "markets_indices"
  | "regulatory_sebi"
  | "insurance_irdai"
  | "mutual_funds_amfi"
  | "banking_nbfc"
  | "macro_india"
  | "global_impact";

export interface OpinionOption {
  label: string;
  color: string;
}

export interface Opinion {
  id: string;
  title: string;
  description: string;
  category: OpinionCategory;
  format: OpinionFormat;
  options: OpinionOption[];
  status: OpinionStatus;
  created_by: string;
  starts_at: string;
  ends_at: string;
  is_featured: boolean;
  disclaimer_text: string | null;
  participation_count: number;
  comment_count: number;
  like_count: number;
  share_count: number;
  created_at: string;
  updated_at: string;
}

export interface OpinionVote {
  id: string;
  opinion_id: string;
  user_id: string;
  selected_option: string;
  voter_role: string;
  is_public: boolean;
  created_at: string;
}

export interface OpinionComment {
  id: string;
  opinion_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profile?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export interface VoteResults {
  [optionLabel: string]: {
    count: number;
    percentage: number;
    byRole: { [role: string]: number };
  };
}

export const OPINION_CATEGORIES: Record<OpinionCategory, { label: string; icon: string }> = {
  rbi_monetary_policy: { label: "RBI & Monetary Policy", icon: "🏦" },
  markets_indices: { label: "Markets & Indices", icon: "📈" },
  regulatory_sebi: { label: "Regulatory & SEBI", icon: "⚖️" },
  insurance_irdai: { label: "Insurance & IRDAI", icon: "🛡️" },
  mutual_funds_amfi: { label: "Mutual Funds & AMFI", icon: "💰" },
  banking_nbfc: { label: "Banking & NBFCs", icon: "🏛️" },
  macro_india: { label: "Macro India", icon: "🇮🇳" },
  global_impact: { label: "Global Impact", icon: "🌍" },
};

export const DURATION_PRESETS = [
  { label: "24 Hours", hours: 24 },
  { label: "3 Days", hours: 72 },
  { label: "1 Week", hours: 168 },
  { label: "2 Weeks", hours: 336 },
  { label: "1 Month", hours: 720 },
];

export const FORMAT_DEFAULTS: Record<OpinionFormat, OpinionOption[]> = {
  binary: [
    { label: "Yes", color: "#22c55e" },
    { label: "No", color: "#ef4444" },
  ],
  multiple_choice: [
    { label: "Option A", color: "#3b82f6" },
    { label: "Option B", color: "#8b5cf6" },
    { label: "Option C", color: "#f59e0b" },
  ],
  scale: [
    { label: "Very Bullish", color: "#16a34a" },
    { label: "Bullish", color: "#22c55e" },
    { label: "Neutral", color: "#94a3b8" },
    { label: "Bearish", color: "#ef4444" },
    { label: "Very Bearish", color: "#dc2626" },
  ],
  over_under: [
    { label: "Over", color: "#22c55e" },
    { label: "Under", color: "#ef4444" },
  ],
};

const DEFAULT_DISCLAIMER = "This is a professional sentiment indicator only. It does not constitute investment advice, a recommendation, or an endorsement. Past opinions do not predict future outcomes. Always consult a SEBI-registered advisor before making investment decisions.";

export function useOpinions(category?: OpinionCategory, status?: OpinionStatus) {
  return useQuery({
    queryKey: ["opinions", category, status],
    queryFn: async () => {
      let query = supabase
        .from("opinions")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (category) query = query.eq("category", category);
      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((d: any) => ({
        ...d,
        options: typeof d.options === "string" ? JSON.parse(d.options) : d.options,
      })) as Opinion[];
    },
  });
}

export function useOpinionDetail(opinionId: string | null) {
  return useQuery({
    queryKey: ["opinion-detail", opinionId],
    enabled: !!opinionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opinions")
        .select("*")
        .eq("id", opinionId!)
        .single();
      if (error) throw error;
      return {
        ...data,
        options: typeof data.options === "string" ? JSON.parse(data.options) : data.options,
      } as Opinion;
    },
  });
}

export function useOpinionVotes(opinionId: string | null) {
  return useQuery({
    queryKey: ["opinion-votes", opinionId],
    enabled: !!opinionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opinion_votes")
        .select("*")
        .eq("opinion_id", opinionId!);
      if (error) throw error;
      return (data || []) as OpinionVote[];
    },
  });
}

export function useOpinionComments(opinionId: string | null) {
  return useQuery({
    queryKey: ["opinion-comments", opinionId],
    enabled: !!opinionId,
    queryFn: async () => {
      const { data: comments, error } = await supabase
        .from("opinion_comments")
        .select("*")
        .eq("opinion_id", opinionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;

      if (!comments?.length) return [];

      const authorIds = [...new Set(comments.map((c: any) => c.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url")
        .in("id", authorIds);

      const profileMap = new Map(profiles?.map((p: any) => [p.id, p]));
      return comments.map((c: any) => ({
        ...c,
        profile: profileMap.get(c.author_id) || { full_name: "Unknown", display_name: null, avatar_url: null },
      })) as OpinionComment[];
    },
  });
}

export function computeVoteResults(votes: OpinionVote[], options: OpinionOption[]): VoteResults {
  const total = votes.length;
  const results: VoteResults = {};
  options.forEach((opt) => {
    const matching = votes.filter((v) => v.selected_option === opt.label);
    const byRole: { [role: string]: number } = {};
    matching.forEach((v) => {
      byRole[v.voter_role] = (byRole[v.voter_role] || 0) + 1;
    });
    results[opt.label] = {
      count: matching.length,
      percentage: total > 0 ? Math.round((matching.length / total) * 100) : 0,
      byRole,
    };
  });
  return results;
}

export function useCastVote() {
  const qc = useQueryClient();
  const { activeRole } = useRole();

  return useMutation({
    mutationFn: async ({ opinionId, selectedOption, isPublic }: { opinionId: string; selectedOption: string; isPublic: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("opinion_votes").insert({
        opinion_id: opinionId,
        user_id: user.id,
        selected_option: selectedOption,
        voter_role: activeRole,
        is_public: isPublic,
      });
      if (error) throw error;

      // participation count updated via query invalidation
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["opinion-votes", vars.opinionId] });
      qc.invalidateQueries({ queryKey: ["opinions"] });
      toast.success("Your professional opinion has been recorded");
    },
    onError: (err: any) => {
      if (err.message?.includes("duplicate")) {
        toast.error("You have already voted on this opinion");
      } else {
        toast.error("Failed to cast vote");
      }
    },
  });
}

export function useRemoveVote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ opinionId }: { opinionId: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("opinion_votes")
        .delete()
        .eq("opinion_id", opinionId)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["opinion-votes", vars.opinionId] });
      qc.invalidateQueries({ queryKey: ["opinions"] });
      toast.info("Vote removed");
    },
  });
}

export function useAddOpinionComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ opinionId, content }: { opinionId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("opinion_comments").insert({
        opinion_id: opinionId,
        author_id: user.id,
        content,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["opinion-comments", vars.opinionId] });
      toast.success("Comment posted");
    },
  });
}

export function useOpinionInteraction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ opinionId, type }: { opinionId: string; type: "like" | "share" | "bookmark" }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("opinion_interactions").insert({
        opinion_id: opinionId,
        user_id: user.id,
        interaction_type: type,
      });
      if (error) {
        if (error.message?.includes("duplicate")) {
          // Remove interaction (toggle)
          await supabase
            .from("opinion_interactions")
            .delete()
            .eq("opinion_id", opinionId)
            .eq("user_id", user.id)
            .eq("interaction_type", type);
        } else throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opinions"] });
    },
  });
}

export function useCreateOpinion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (opinion: Partial<Opinion> & { title: string; ends_at: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("opinions").insert({
        ...opinion,
        created_by: user.id,
        disclaimer_text: opinion.disclaimer_text || DEFAULT_DISCLAIMER,
        options: JSON.stringify(opinion.options || FORMAT_DEFAULTS.binary),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opinions"] });
      toast.success("Opinion created successfully");
    },
    onError: () => {
      toast.error("Failed to create opinion");
    },
  });
}

export function useUpdateOpinion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Opinion> & { id: string }) => {
      const payload: any = { ...updates };
      if (updates.options) payload.options = JSON.stringify(updates.options);
      const { error } = await supabase.from("opinions").update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opinions"] });
      toast.success("Opinion updated");
    },
  });
}

export function useDeleteOpinion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("opinions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opinions"] });
      toast.success("Opinion deleted");
    },
  });
}

export { DEFAULT_DISCLAIMER };
