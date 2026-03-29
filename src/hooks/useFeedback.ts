/**
 * useFeedback — TanStack Query hook for the Feedback Engine.
 *
 * Manages feature requests: fetching, voting/unvoting, creating, and filtering.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";

export type FeatureStatus = "under_review" | "planned" | "in_progress" | "beta" | "released" | "rejected";
export type FeatureCategory = "ui_ux" | "investment" | "insurance" | "compliance" | "community" | "data" | "jobs";
export type FeatureSortBy = "priority" | "recent" | "comments";

export interface FeatureFilters {
  status?: FeatureStatus | "all";
  category?: FeatureCategory | "all";
  sortBy?: FeatureSortBy;
}

export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  workaround: string;
  impact_tags: string[];
  is_regulatory: boolean;
  beneficiary_roles: string[];
  is_anonymous: boolean;
  status: FeatureStatus;
  category: FeatureCategory;
  author_id: string;
  inv_votes: number;
  int_votes: number;
  iss_votes: number;
  enb_votes: number;
  comment_count: number;
  priority_score: number;
  expected_quarter: string | null;
  roadmap_rationale: string | null;
  pinned: boolean;
  pin_label: string | null;
  rejection_reason: string | null;
  merged_into_id: string | null;
  is_seeded: boolean;
  avg_satisfaction: number;
  satisfaction_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  author_profile?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    verification_status: string;
  };
  author_roles?: string[];
  user_voted?: boolean;
  user_satisfaction?: { rating: number; sentiment: string } | null;
}

export interface CreateFeatureInput {
  title: string;
  description: string;
  workaround: string;
  impact_tags: string[];
  is_regulatory: boolean;
  beneficiary_roles: string[];
  is_anonymous: boolean;
  category: FeatureCategory;
}

// ─── Fetch features ───
export function useFeatureRequests(filters: FeatureFilters = {}) {
  const { userId } = useRole();

  return useQuery({
    queryKey: QUERY_KEYS.featureRequests(filters as Record<string, string | undefined>),
    queryFn: async () => {
      let query = supabase
        .from("feature_requests")
        .select("*")
        .is("merged_into_id", null);

      if (filters.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }
      if (filters.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      // Sorting
      if (filters.sortBy === "comments") {
        query = query.order("comment_count", { ascending: false });
      } else if (filters.sortBy === "recent") {
        query = query.order("created_at", { ascending: false });
      } else {
        // Default: priority (pinned first, then score)
        query = query.order("pinned", { ascending: false }).order("priority_score", { ascending: false });
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;

      // Fetch author profiles in batch
      const authorIds = [...new Set((data || []).map((f: any) => f.author_id))];
      const { data: profiles } = authorIds.length
        ? await supabase.from("profiles").select("id, full_name, display_name, avatar_url, verification_status").in("id", authorIds)
        : { data: [] };

      // Fetch author roles
      const { data: roles } = authorIds.length
        ? await supabase.from("user_roles").select("user_id, role").in("user_id", authorIds)
        : { data: [] };

      // Fetch current user's votes
      let userVotes: string[] = [];
      if (userId) {
        const { data: votes } = await supabase
          .from("feature_votes")
          .select("feature_id")
          .eq("user_id", userId);
        userVotes = (votes || []).map((v: any) => v.feature_id);
      }

      // Fetch current user's satisfaction ratings
      let userSatisfactions = new Map<string, { rating: number; sentiment: string }>();
      if (userId) {
        const { data: ratings } = await supabase
          .from("feature_satisfaction_ratings")
          .select("feature_id, rating, sentiment")
          .eq("user_id", userId);
        (ratings || []).forEach((r: any) => {
          userSatisfactions.set(r.feature_id, { rating: r.rating, sentiment: r.sentiment });
        });
      }

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      const roleMap = new Map<string, string[]>();
      (roles || []).forEach((r: any) => {
        const arr = roleMap.get(r.user_id) || [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      });

      return (data || []).map((f: any) => ({
        ...f,
        author_profile: profileMap.get(f.author_id) || null,
        author_roles: roleMap.get(f.author_id) || ["investor"],
        user_voted: userVotes.includes(f.id),
        user_satisfaction: userSatisfactions.get(f.id) || null,
      })) as FeatureRequest[];
    },
    enabled: !!userId,
  });
}

// ─── Vote / Unvote ───
export function useFeatureVote() {
  const { activeRole, userId } = useRole();
  const queryClient = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async ({ featureId, action }: { featureId: string; action: "vote" | "unvote" }) => {
      if (!userId) throw new Error("Not authenticated");

      if (action === "vote") {
        const { error } = await supabase.from("feature_votes").insert({
          feature_id: featureId,
          user_id: userId,
          role_at_vote: activeRole,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("feature_votes")
          .delete()
          .eq("feature_id", featureId)
          .eq("user_id", userId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Vote failed");
    },
  });

  return voteMutation;
}

// ─── Create Feature ───
export function useCreateFeature() {
  const { userId, activeRole } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateFeatureInput) => {
      if (!userId) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("feature_requests")
        .insert({
          ...input,
          author_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-vote on own feature
      await supabase.from("feature_votes").insert({
        feature_id: data.id,
        user_id: userId,
        role_at_vote: activeRole,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Feature request submitted!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit feature request");
    },
  });
}

// ─── Duplicate search ───
export function useFeatureDuplicateSearch(searchTerm: string) {
  return useQuery({
    queryKey: QUERY_KEYS.featureDuplicateSearch(searchTerm),
    queryFn: async () => {
      if (searchTerm.length < 3) return [];
      const { data, error } = await supabase
        .from("feature_requests")
        .select("id, title, status, priority_score")
        .ilike("title", `%${searchTerm}%`)
        .is("merged_into_id", null)
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: searchTerm.length >= 3,
  });
}

// ─── Feature Comments ───
export interface FeatureComment {
  id: string;
  feature_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  upvote_count: number;
  created_at: string;
  profile?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    verification_status: string;
  };
  roles?: string[];
  user_upvoted?: boolean;
  replies?: FeatureComment[];
}

export function useFeatureComments(featureId: string | null) {
  const { userId } = useRole();

  return useQuery({
    queryKey: QUERY_KEYS.featureComments(featureId || undefined),
    queryFn: async () => {
      if (!featureId) return [];

      const { data, error } = await supabase
        .from("feature_comments")
        .select("*")
        .eq("feature_id", featureId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((c: any) => c.user_id))];
      const { data: profiles } = userIds.length
        ? await supabase.from("profiles").select("id, full_name, display_name, avatar_url, verification_status").in("id", userIds)
        : { data: [] };
      const { data: roles } = userIds.length
        ? await supabase.from("user_roles").select("user_id, role").in("user_id", userIds)
        : { data: [] };

      let userUpvotes: string[] = [];
      if (userId) {
        const commentIds = (data || []).map((c: any) => c.id);
        if (commentIds.length) {
          const { data: upvotes } = await supabase
            .from("comment_upvotes")
            .select("comment_id")
            .eq("user_id", userId)
            .in("comment_id", commentIds);
          userUpvotes = (upvotes || []).map((u: any) => u.comment_id);
        }
      }

      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      const roleMap = new Map<string, string[]>();
      (roles || []).forEach((r: any) => {
        const arr = roleMap.get(r.user_id) || [];
        arr.push(r.role);
        roleMap.set(r.user_id, arr);
      });

      const comments = (data || []).map((c: any) => ({
        ...c,
        profile: profileMap.get(c.user_id) || null,
        roles: roleMap.get(c.user_id) || ["investor"],
        user_upvoted: userUpvotes.includes(c.id),
      })) as FeatureComment[];

      // Thread: group replies under parents
      const topLevel: FeatureComment[] = [];
      const replyMap = new Map<string, FeatureComment[]>();

      comments.forEach(c => {
        if (c.parent_id) {
          const arr = replyMap.get(c.parent_id) || [];
          arr.push(c);
          replyMap.set(c.parent_id, arr);
        } else {
          topLevel.push(c);
        }
      });

      topLevel.forEach(c => {
        c.replies = replyMap.get(c.id) || [];
      });

      return topLevel;
    },
    enabled: !!featureId,
  });
}

// ─── Add Comment ───
export function useAddFeatureComment() {
  const { userId } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ featureId, content, parentId }: { featureId: string; content: string; parentId?: string }) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase.from("feature_comments").insert({
        feature_id: featureId,
        user_id: userId,
        content: content.trim(),
        parent_id: parentId || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureComments(vars.featureId) });
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to post comment"),
  });
}

// ─── Upvote Comment ───
export function useCommentUpvote() {
  const { userId } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, featureId, action }: { commentId: string; featureId: string; action: "upvote" | "remove" }) => {
      if (!userId) throw new Error("Not authenticated");
      if (action === "upvote") {
        const { error } = await supabase.from("comment_upvotes").insert({ comment_id: commentId, user_id: userId });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("comment_upvotes").delete().eq("comment_id", commentId).eq("user_id", userId);
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureComments(vars.featureId) });
    },
    onError: (err: any) => toast.error(err.message || "Failed to upvote"),
  });
}

// ─── Satisfaction Rating ───
export function useSatisfactionRating() {
  const { userId } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      featureId,
      rating,
      sentiment,
    }: {
      featureId: string;
      rating: number;
      sentiment: "positive" | "negative";
    }) => {
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("feature_satisfaction_ratings")
        .upsert(
          { feature_id: featureId, user_id: userId, rating, sentiment, updated_at: new Date().toISOString() },
          { onConflict: "feature_id,user_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to rate"),
  });
}

export function useRemoveSatisfactionRating() {
  const { userId } = useRole();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ featureId }: { featureId: string }) => {
      if (!userId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("feature_satisfaction_ratings")
        .delete()
        .eq("feature_id", featureId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-requests"] });
    },
    onError: (err: any) => toast.error(err.message || "Failed to remove rating"),
  });
}
