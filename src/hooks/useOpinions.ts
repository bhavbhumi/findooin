/**
 * useOpinions — Hook for fetching, voting, and managing professional opinions.
 * SEBI 2026 compliant: content_intent classification, voter credential enrichment.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export type OpinionFormat = "binary" | "multiple_choice" | "scale" | "over_under";
export type OpinionStatus = "draft" | "active" | "closed" | "archived";
export type ContentIntent = "education" | "sentiment_signal" | "awareness";
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
  content_intent: ContentIntent;
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
  /** Enriched voter profile for credential display */
  voter_profile?: {
    verification_status: string;
    certifications: string[] | null;
    regulatory_ids: Record<string, string> | null;
    user_type: string;
  };
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

/** Sentiment Trust Score — credential-weighted quality of the aggregate signal */
export interface SentimentTrustScore {
  score: number; // 0-100
  level: string; // "High Authority" | "Moderate Authority" | "Low Authority"
  verifiedVoterPct: number;
  certifiedVoterPct: number;
  totalCredentialWeight: number;
}

export const CONTENT_INTENT_LABELS: Record<ContentIntent, { label: string; icon: string; description: string }> = {
  education: { label: "Education", icon: "📚", description: "Educational content for awareness" },
  sentiment_signal: { label: "Sentiment Signal", icon: "📊", description: "Aggregated professional sentiment" },
  awareness: { label: "Awareness", icon: "💡", description: "Industry awareness and discussion" },
};

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
    queryKey: QUERY_KEYS.opinions(category, status),
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
        content_intent: d.content_intent || "sentiment_signal",
        options: typeof d.options === "string" ? JSON.parse(d.options) : d.options,
      })) as Opinion[];
    },
  });
}

export function useOpinionDetail(opinionId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.opinionDetail(opinionId),
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
        content_intent: data.content_intent || "sentiment_signal",
        options: typeof data.options === "string" ? JSON.parse(data.options) : data.options,
      } as Opinion;
    },
  });
}

export function useOpinionVotes(opinionId: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.opinionVotes(opinionId),
    enabled: !!opinionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opinion_votes")
        .select("*")
        .eq("opinion_id", opinionId!);
      if (error) throw error;

      if (!data?.length) return [] as OpinionVote[];

      // Enrich with voter credentials for RE disclosure & trust scoring
      const voterIds = [...new Set(data.map((v: any) => v.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, verification_status, certifications, regulatory_ids, user_type")
        .in("id", voterIds);

      const profileMap = new Map(profiles?.map((p: any) => [p.id, p]));

      return (data || []).map((v: any) => ({
        ...v,
        voter_profile: profileMap.get(v.user_id) || undefined,
      })) as OpinionVote[];
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

/** Compute Sentiment Trust Score based on voter credentials */
export function computeSentimentTrustScore(votes: OpinionVote[]): SentimentTrustScore {
  if (!votes.length) return { score: 0, level: "No Data", verifiedVoterPct: 0, certifiedVoterPct: 0, totalCredentialWeight: 0 };

  let totalWeight = 0;
  let verifiedCount = 0;
  let certifiedCount = 0;

  votes.forEach((v) => {
    let weight = 1; // base
    if (v.voter_profile?.verification_status === "verified") {
      weight += 2;
      verifiedCount++;
    }
    if (v.voter_profile?.certifications?.length) {
      weight += 1;
      certifiedCount++;
    }
    if (v.voter_profile?.regulatory_ids && Object.keys(v.voter_profile.regulatory_ids).length > 0) {
      weight += 1.5;
    }
    totalWeight += weight;
  });

  const maxPossibleWeight = votes.length * 5.5; // max per voter
  const score = Math.min(Math.round((totalWeight / maxPossibleWeight) * 100), 100);
  const verifiedVoterPct = Math.round((verifiedCount / votes.length) * 100);
  const certifiedVoterPct = Math.round((certifiedCount / votes.length) * 100);

  let level = "Low Authority";
  if (score >= 70) level = "High Authority";
  else if (score >= 40) level = "Moderate Authority";

  return { score, level, verifiedVoterPct, certifiedVoterPct, totalCredentialWeight: Math.round(totalWeight * 10) / 10 };
}

/** Extract unique license types from voter profiles for RE disclosure */
export function extractVoterCredentials(votes: OpinionVote[]): string[] {
  const creds = new Set<string>();
  votes.forEach((v) => {
    if (v.voter_profile?.regulatory_ids) {
      const ids = v.voter_profile.regulatory_ids;
      if (ids.amfi_arn) creds.add("AMFI ARN");
      if (ids.sebi_ria) creds.add("SEBI RIA");
      if (ids.sebi_ra) creds.add("SEBI RA");
      if (ids.irdai_license) creds.add("IRDAI Licensed");
      if (ids.ca_membership) creds.add("ICAI CA");
      if (ids.rbi_license) creds.add("RBI Licensed");
      if (ids.nism_cert) creds.add("NISM Certified");
      if (ids.cfa_charter) creds.add("CFA Charter");
    }
    if (v.voter_profile?.certifications?.length) {
      v.voter_profile.certifications.forEach((c) => creds.add(c));
    }
  });
  return Array.from(creds).slice(0, 8); // cap display
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
      const { data, error } = await supabase.from("opinions").insert({
        ...opinion,
        created_by: user.id,
        content_intent: opinion.content_intent || "sentiment_signal",
        disclaimer_text: opinion.disclaimer_text || DEFAULT_DISCLAIMER,
        options: JSON.stringify(opinion.options || FORMAT_DEFAULTS.binary),
      }).select("id").single();
      if (error) throw error;

      // SEBI 2026: scan title + description for coded messaging
      if (data) {
        const { detectCodedMessaging } = await import("@/lib/coded-messaging-detector");
        const scanText = `${opinion.title} ${opinion.description || ''}`;
        const result = detectCodedMessaging(scanText);
        if (result.flagged) {
          await supabase.from("moderation_flags" as any).insert({
            resource_type: 'opinion',
            resource_id: (data as any).id,
            author_id: user.id,
            content_excerpt: scanText.slice(0, 500),
            detection_summary: result.summary,
            matched_patterns: result.matches,
            severity: result.severity,
            status: 'pending',
          } as any);
        }
      }
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
