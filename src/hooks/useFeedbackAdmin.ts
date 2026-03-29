/**
 * Admin hooks for Feedback Engine — status updates, pin, merge, reject, seed, edit actions.
 * Includes voter notification on status changes.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import type { FeatureStatus } from "./useFeedback";
import moduleSpecs from "@/data/module-specs";

const STATUS_LABELS: Record<string, string> = {
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  beta: "Beta",
  released: "Released",
  rejected: "Rejected",
};

/** Notify all voters of a feature about a status change */
async function notifyVoters(featureId: string, featureTitle: string, newStatus: string, actorId: string) {
  // Get all voters for this feature (excluding the actor)
  const { data: voters } = await supabase
    .from("feature_votes")
    .select("user_id")
    .eq("feature_id", featureId)
    .neq("user_id", actorId);

  if (!voters?.length) return;

  const uniqueUserIds = [...new Set(voters.map(v => v.user_id))];
  const statusLabel = STATUS_LABELS[newStatus] || newStatus;
  const message = `Feature "${featureTitle}" has moved to ${statusLabel}`;

  // Also notify the author
  const { data: feature } = await supabase
    .from("feature_requests")
    .select("author_id")
    .eq("id", featureId)
    .single();

  if (feature?.author_id && feature.author_id !== actorId && !uniqueUserIds.includes(feature.author_id)) {
    uniqueUserIds.push(feature.author_id);
  }

  // Batch insert notifications
  const notifications = uniqueUserIds.map(userId => ({
    user_id: userId,
    type: "feature_status",
    message,
    actor_id: actorId,
    reference_id: featureId,
    reference_type: "feature_request",
  }));

  await supabase.from("notifications").insert(notifications);
}

// ─── Update feature status ───
export function useAdminUpdateStatus() {
  const { userId } = useRole();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      featureId,
      newStatus,
      notes,
      expectedQuarter,
      roadmapRationale,
    }: {
      featureId: string;
      newStatus: FeatureStatus;
      notes?: string;
      expectedQuarter?: string;
      roadmapRationale?: string;
    }) => {
      if (!userId) throw new Error("Not authenticated");

      // Get current status and title for history + notifications
      const { data: current } = await supabase
        .from("feature_requests")
        .select("status, title")
        .eq("id", featureId)
        .single();

      // Update the feature
      const updates: Record<string, any> = { status: newStatus, updated_at: new Date().toISOString() };
      if (expectedQuarter !== undefined) updates.expected_quarter = expectedQuarter || null;
      if (roadmapRationale !== undefined) updates.roadmap_rationale = roadmapRationale || null;

      const { error } = await supabase
        .from("feature_requests")
        .update(updates)
        .eq("id", featureId);
      if (error) throw error;

      // Record status history
      await supabase.from("feature_status_history").insert({
        feature_id: featureId,
        old_status: current?.status || null,
        new_status: newStatus,
        changed_by: userId,
        notes: notes || null,
      });

      // Notify voters
      if (current?.title) {
        await notifyVoters(featureId, current.title, newStatus, userId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Status updated — voters notified");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update status"),
  });
}

// ─── Reject feature ───
export function useAdminReject() {
  const { userId } = useRole();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ featureId, reason }: { featureId: string; reason: string }) => {
      if (!userId) throw new Error("Not authenticated");
      if (!reason.trim()) throw new Error("Rejection reason is required");

      const { data: current } = await supabase
        .from("feature_requests")
        .select("status, title")
        .eq("id", featureId)
        .single();

      const { error } = await supabase
        .from("feature_requests")
        .update({
          status: "rejected" as any,
          rejection_reason: reason.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", featureId);
      if (error) throw error;

      await supabase.from("feature_status_history").insert({
        feature_id: featureId,
        old_status: current?.status || null,
        new_status: "rejected" as any,
        changed_by: userId,
        notes: `Rejected: ${reason.trim()}`,
      });

      // Notify voters about rejection
      if (current?.title) {
        await notifyVoters(featureId, current.title, "rejected", userId);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Feature rejected — voters notified");
    },
    onError: (err: any) => toast.error(err.message || "Failed to reject"),
  });
}

// ─── Pin / Unpin ───
export function useAdminPin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ featureId, pinned, pinLabel }: { featureId: string; pinned: boolean; pinLabel?: string }) => {
      const { error } = await supabase
        .from("feature_requests")
        .update({ pinned, pin_label: pinned ? (pinLabel || "Pinned") : null })
        .eq("id", featureId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Pin updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update pin"),
  });
}

// ─── Merge features ───
export function useAdminMerge() {
  const { userId } = useRole();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ sourceId, targetId }: { sourceId: string; targetId: string }) => {
      if (!userId) throw new Error("Not authenticated");
      if (sourceId === targetId) throw new Error("Cannot merge into itself");

      const { data: source } = await supabase
        .from("feature_requests")
        .select("inv_votes, int_votes, iss_votes, enb_votes")
        .eq("id", sourceId)
        .single();

      const totalVotes = source
        ? source.inv_votes + source.int_votes + source.iss_votes + source.enb_votes
        : 0;

      const { error } = await supabase
        .from("feature_requests")
        .update({ merged_into_id: targetId, updated_at: new Date().toISOString() })
        .eq("id", sourceId);
      if (error) throw error;

      await supabase.from("feature_merge_log").insert({
        source_feature_id: sourceId,
        target_feature_id: targetId,
        merged_by: userId,
        source_votes_transferred: totalVotes,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Features merged");
    },
    onError: (err: any) => toast.error(err.message || "Failed to merge"),
  });
}

// ─── Create Changelog Entry ───
export function useCreateChangelog() {
  const { userId } = useRole();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      version: string;
      releaseDate: string;
      featuresAdded: string[];
      improvements: string[];
      bugFixes: string[];
    }) => {
      if (!userId) throw new Error("Not authenticated");

      const { error } = await supabase.from("changelog_entries").insert({
        version: input.version,
        release_date: input.releaseDate,
        features_added: input.featuresAdded.filter(Boolean) as any,
        improvements: input.improvements.filter(Boolean) as any,
        bug_fixes: input.bugFixes.filter(Boolean) as any,
        created_by: userId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["changelog-entries"] });
      toast.success("Changelog entry published");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create changelog entry"),
  });
}

// ─── Seed modules from module-specs ───
const MODULE_CATEGORY_MAP: Record<string, string> = {
  overview: "ui_ux",
  users: "community",
  verification: "compliance",
  audit: "compliance",
  feed: "community",
  jobs: "jobs",
  events: "community",
  listings: "investment",
  messages: "community",
  opinions: "community",
  gamification: "community",
  invitations: "community",
  registry: "data",
  sales: "data",
  campaigns: "community",
  email: "community",
  notifications: "ui_ux",
  blog: "community",
  moderation: "compliance",
  support: "ui_ux",
  kb: "ui_ux",
  monitoring: "data",
  scorecard: "data",
  security: "compliance",
  module_audit: "data",
  seo: "data",
  patent: "data",
  features: "ui_ux",
  billing: "data",
  premium: "investment",
  feedback: "community",
  coded_messaging: "compliance",
};

export function useSeedModules() {
  const { userId } = useRole();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      // Check which modules are already seeded
      const { data: existing } = await supabase
        .from("feature_requests")
        .select("title")
        .eq("is_seeded", true);

      const existingTitles = new Set((existing || []).map((e: any) => e.title));

      const entries = Object.values(moduleSpecs)
        .filter(spec => !existingTitles.has(spec.title))
        .map(spec => ({
          title: spec.title,
          description: `${spec.solution}\n\n**Current Features:**\n${spec.currentScope.map(s => `• ${s}`).join("\n")}`,
          workaround: "",
          impact_tags: ["platform"],
          is_regulatory: false,
          beneficiary_roles: ["investor", "intermediary", "issuer"],
          is_anonymous: false,
          category: (MODULE_CATEGORY_MAP[spec.moduleKey] || "ui_ux") as any,
          status: "released" as any,
          author_id: userId,
          is_seeded: true,
          pinned: false,
        }));

      if (entries.length === 0) {
        toast.info("All modules already seeded");
        return 0;
      }

      const { error } = await supabase.from("feature_requests").insert(entries);
      if (error) throw error;

      return entries.length;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] });
      if (count && count > 0) {
        toast.success(`Seeded ${count} module${count > 1 ? "s" : ""} as feature entries`);
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to seed modules"),
  });
}

// ─── Edit seeded feature description ───
export function useEditFeatureDescription() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ featureId, title, description }: { featureId: string; title?: string; description: string }) => {
      const updates: Record<string, any> = { description, updated_at: new Date().toISOString() };
      if (title) updates.title = title;
      const { error } = await supabase
        .from("feature_requests")
        .update(updates)
        .eq("id", featureId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Feature updated");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update"),
  });
}
