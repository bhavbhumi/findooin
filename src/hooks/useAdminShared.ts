/**
 * useAdminShared — Shared constants and utilities for admin hooks.
 */
import { supabase } from "@/integrations/supabase/client";

/** Shared cache config for admin queries */
export const ADMIN_CACHE = { staleTime: 60_000, gcTime: 600_000 } as const;

/** Fire-and-forget audit log insert */
export async function logAdminAction(action: string, resourceType: string, resourceId?: string, metadata?: Record<string, any>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  supabase.from("audit_logs").insert({
    user_id: session.user.id,
    action,
    resource_type: resourceType,
    resource_id: resourceId || null,
    metadata: metadata || {},
  }).then(() => {});
}
