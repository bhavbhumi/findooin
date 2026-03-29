/**
 * Admin hooks for Feedback Engine — status updates, pin, merge, reject actions.
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";
import type { FeatureStatus } from "./useFeedback";

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

      // Get current status for history
      const { data: current } = await supabase
        .from("feature_requests")
        .select("status")
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
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Status updated");
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
        .select("status")
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
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-requests"] });
      toast.success("Feature rejected");
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

      // Get source vote count for log
      const { data: source } = await supabase
        .from("feature_requests")
        .select("inv_votes, int_votes, iss_votes, enb_votes")
        .eq("id", sourceId)
        .single();

      const totalVotes = source
        ? source.inv_votes + source.int_votes + source.iss_votes + source.enb_votes
        : 0;

      // Mark source as merged
      const { error } = await supabase
        .from("feature_requests")
        .update({ merged_into_id: targetId, updated_at: new Date().toISOString() })
        .eq("id", sourceId);
      if (error) throw error;

      // Log merge
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
