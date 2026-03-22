/**
 * useBlogInteractions — Hooks for interactive polls and surveys on blog posts.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

/* ── Types ── */
export interface PollOption {
  id: string;
  blog_post_id: string;
  option_text: string;
  position: number;
  is_multi_select: boolean;
  vote_count: number;
}

export interface SurveyQuestion {
  id: string;
  blog_post_id: string;
  question_text: string;
  question_type: "single_choice" | "multi_choice" | "text";
  position: number;
  required: boolean;
  options: SurveyOption[];
}

export interface SurveyOption {
  id: string;
  question_id: string;
  option_text: string;
  position: number;
  response_count: number;
}

/* ── Poll Options + Vote Counts ── */
export function usePollOptions(blogPostId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.blogPollOptions(blogPostId),
    queryFn: async () => {
      const { data: options, error } = await supabase
        .from("blog_poll_options")
        .select("*")
        .eq("blog_post_id", blogPostId)
        .order("position");
      if (error) throw error;

      // Get vote counts per option
      const { data: votes, error: vErr } = await supabase
        .from("blog_poll_votes")
        .select("option_id")
        .eq("blog_post_id", blogPostId);
      if (vErr) throw vErr;

      const voteCounts: Record<string, number> = {};
      (votes || []).forEach((v: any) => {
        voteCounts[v.option_id] = (voteCounts[v.option_id] || 0) + 1;
      });

      return (options || []).map((o: any) => ({
        ...o,
        vote_count: voteCounts[o.id] || 0,
      })) as PollOption[];
    },
    enabled: !!blogPostId,
  });
}

/* ── User's existing poll votes ── */
export function useUserPollVotes(blogPostId: string, userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.blogPollUserVotes(blogPostId, userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_poll_votes")
        .select("option_id")
        .eq("blog_post_id", blogPostId)
        .eq("user_id", userId!);
      if (error) throw error;
      return (data || []).map((v: any) => v.option_id as string);
    },
    enabled: !!blogPostId && !!userId,
  });
}

/* ── Cast poll vote ── */
export function useCastPollVote(blogPostId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ optionIds, userId }: { optionIds: string[]; userId: string }) => {
      // Delete existing votes first
      await supabase
        .from("blog_poll_votes")
        .delete()
        .eq("blog_post_id", blogPostId)
        .eq("user_id", userId);

      // Insert new votes
      const rows = optionIds.map((oid) => ({
        blog_post_id: blogPostId,
        option_id: oid,
        user_id: userId,
      }));
      const { error } = await supabase.from("blog_poll_votes").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-poll-options", blogPostId] });
      qc.invalidateQueries({ queryKey: ["blog-poll-user-votes", blogPostId] });
      qc.invalidateQueries({ queryKey: ["blog-poll-stats"] });
    },
  });
}

/* ── Survey Questions + Options + Response Counts ── */
export function useSurveyQuestions(blogPostId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.blogSurveyQuestions(blogPostId),
    queryFn: async () => {
      const { data: questions, error } = await supabase
        .from("blog_survey_questions")
        .select("*")
        .eq("blog_post_id", blogPostId)
        .order("position");
      if (error) throw error;

      const qIds = (questions || []).map((q: any) => q.id);
      if (qIds.length === 0) return [];

      const { data: options, error: oErr } = await supabase
        .from("blog_survey_options")
        .select("*")
        .in("question_id", qIds)
        .order("position");
      if (oErr) throw oErr;

      // Response counts
      const { data: responses, error: rErr } = await supabase
        .from("blog_survey_responses")
        .select("question_id, option_id")
        .eq("blog_post_id", blogPostId);
      if (rErr) throw rErr;

      const respCounts: Record<string, number> = {};
      (responses || []).forEach((r: any) => {
        if (r.option_id) {
          respCounts[r.option_id] = (respCounts[r.option_id] || 0) + 1;
        }
      });

      return (questions || []).map((q: any) => ({
        ...q,
        options: (options || [])
          .filter((o: any) => o.question_id === q.id)
          .map((o: any) => ({ ...o, response_count: respCounts[o.id] || 0 })),
      })) as SurveyQuestion[];
    },
    enabled: !!blogPostId,
  });
}

/* ── Check if user already submitted survey ── */
export function useUserSurveySubmitted(blogPostId: string, userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.blogSurveySubmitted(blogPostId, userId),
    queryFn: async () => {
      const { count, error } = await supabase
        .from("blog_survey_responses")
        .select("id", { count: "exact", head: true })
        .eq("blog_post_id", blogPostId)
        .eq("user_id", userId!);
      if (error) throw error;
      return (count || 0) > 0;
    },
    enabled: !!blogPostId && !!userId,
  });
}

/* ── Submit survey responses ── */
export function useSubmitSurvey(blogPostId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      answers,
      userId,
    }: {
      answers: { questionId: string; optionIds?: string[]; textResponse?: string }[];
      userId: string;
    }) => {
      const rows = answers.flatMap((a) => {
        if (a.optionIds && a.optionIds.length > 0) {
          return a.optionIds.map((oid) => ({
            blog_post_id: blogPostId,
            question_id: a.questionId,
            option_id: oid,
            text_response: null,
            user_id: userId,
          }));
        }
        return [
          {
            blog_post_id: blogPostId,
            question_id: a.questionId,
            option_id: null,
            text_response: a.textResponse || null,
            user_id: userId,
          },
        ];
      });
      const { error } = await supabase.from("blog_survey_responses").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-survey-questions", blogPostId] });
      qc.invalidateQueries({ queryKey: ["blog-survey-submitted", blogPostId] });
      qc.invalidateQueries({ queryKey: ["blog-survey-stats"] });
    },
  });
}

/* ── Aggregate stats for listing cards ── */
export function useBlogPollStats() {
  return useQuery({
    queryKey: QUERY_KEYS.blogPollStats(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_poll_votes")
        .select("blog_post_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((v: any) => {
        counts[v.blog_post_id] = (counts[v.blog_post_id] || 0) + 1;
      });
      return counts;
    },
  });
}

export function useBlogSurveyStats() {
  return useQuery({
    queryKey: ["blog-survey-stats"],
    queryFn: async () => {
      // Count unique users per blog_post_id
      const { data, error } = await supabase
        .from("blog_survey_responses")
        .select("blog_post_id, user_id");
      if (error) throw error;
      const userSets: Record<string, Set<string>> = {};
      (data || []).forEach((r: any) => {
        if (!userSets[r.blog_post_id]) userSets[r.blog_post_id] = new Set();
        userSets[r.blog_post_id].add(r.user_id);
      });
      const counts: Record<string, number> = {};
      Object.entries(userSets).forEach(([k, v]) => {
        counts[k] = v.size;
      });
      return counts;
    },
  });
}
