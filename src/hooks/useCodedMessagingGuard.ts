/**
 * useCodedMessagingGuard — SEBI 2026 Coded Messaging Compliance Hook
 *
 * Scans user-generated content for coded buy/sell patterns and
 * auto-flags violations in the moderation_flags table.
 * Used across Posts, Opinions, Comments, and Messages.
 */
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { detectCodedMessaging, type DetectionResult } from "@/lib/coded-messaging-detector";

interface FlagParams {
  resourceType: 'post' | 'opinion' | 'comment' | 'message';
  resourceId: string;
  authorId: string;
  content: string;
}

/**
 * Returns a `scanAndFlag` function that detects coded messaging
 * and inserts a moderation flag if violations are found.
 * Content still goes live (auto-flag for review model).
 */
export function useCodedMessagingGuard() {
  const scanAndFlag = useCallback(async ({ resourceType, resourceId, authorId, content }: FlagParams): Promise<DetectionResult> => {
    const result = detectCodedMessaging(content);

    if (result.flagged) {
      // Insert flag — content still goes live, but it's queued for admin review
      await supabase.from("moderation_flags" as any).insert({
        resource_type: resourceType,
        resource_id: resourceId,
        author_id: authorId,
        content_excerpt: content.slice(0, 500),
        detection_summary: result.summary,
        matched_patterns: result.matches,
        severity: result.severity,
        status: 'pending',
      } as any);
    }

    return result;
  }, []);

  return { scanAndFlag, detectCodedMessaging };
}
