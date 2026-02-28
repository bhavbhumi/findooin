/**
 * useDrafts — Post draft persistence hook.
 *
 * CRUD for drafts stored in the `post_drafts` table.
 * Supports all post metadata: kind, type, visibility, attachments,
 * poll options, survey questions, mentions, and hashtags.
 *
 * `updated_at` is auto-set by a DB trigger on each update.
 */
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PostDraft {
  id: string;
  content: string;
  post_kind: string;
  post_type: string;
  query_category: string | null;
  visibility: string;
  attachment_url: string | null;
  attachment_name: string | null;
  attachment_type: string | null;
  scheduled_at: string | null;
  schedule_time: string | null;
  poll_options: any | null;
  survey_questions: any | null;
  mentioned_users: any | null;
  hashtags: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useDrafts(userId: string | null) {
  const [drafts, setDrafts] = useState<PostDraft[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDrafts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("post_drafts")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (!error && data) setDrafts(data as unknown as PostDraft[]);
    setLoading(false);
  }, [userId]);

  const saveDraft = useCallback(async (draft: Partial<PostDraft> & { id?: string }) => {
    if (!userId) return null;
    const payload = {
      user_id: userId,
      content: draft.content || "",
      post_kind: draft.post_kind || "normal",
      post_type: draft.post_type || "text",
      query_category: draft.query_category || null,
      visibility: draft.visibility || "public",
      attachment_url: draft.attachment_url || null,
      attachment_name: draft.attachment_name || null,
      attachment_type: draft.attachment_type || null,
      scheduled_at: draft.scheduled_at || null,
      schedule_time: draft.schedule_time || null,
      poll_options: draft.poll_options || null,
      survey_questions: draft.survey_questions || null,
      mentioned_users: draft.mentioned_users || null,
      hashtags: draft.hashtags || null,
    };

    if (draft.id) {
      const { error } = await supabase
        .from("post_drafts")
        .update(payload as any)
        .eq("id", draft.id);
      if (error) { toast.error("Failed to update draft"); return null; }
      toast.success("Draft updated");
      return draft.id;
    } else {
      const { data, error } = await supabase
        .from("post_drafts")
        .insert(payload as any)
        .select("id")
        .single();
      if (error) { toast.error("Failed to save draft"); return null; }
      toast.success("Draft saved");
      return (data as any)?.id || null;
    }
  }, [userId]);

  const deleteDraft = useCallback(async (draftId: string) => {
    const { error } = await supabase.from("post_drafts").delete().eq("id", draftId);
    if (error) { toast.error("Failed to delete draft"); return; }
    setDrafts((prev) => prev.filter((d) => d.id !== draftId));
    toast.success("Draft deleted");
  }, []);

  return { drafts, loading, loadDrafts, saveDraft, deleteDraft };
}
