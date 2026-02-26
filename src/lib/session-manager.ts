import { supabase } from "@/integrations/supabase/client";

const MAX_SESSIONS = 3;

/**
 * Generate a unique session token for this browser tab/device.
 * Persisted in sessionStorage so each tab gets a unique token,
 * but the same tab across refreshes keeps the same one.
 */
function getOrCreateSessionToken(): string {
  const KEY = "findoo_session_token";
  let token = sessionStorage.getItem(KEY);
  if (!token) {
    token = crypto.randomUUID();
    sessionStorage.setItem(KEY, token);
  }
  return token;
}

function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone/i.test(ua);
  return isMobile ? "Mobile" : "Desktop";
}

/**
 * Register the current session after successful login.
 * If the user already has MAX_SESSIONS, the oldest sessions are removed.
 * Returns { allowed: true } if the session was registered,
 * or { allowed: false, message } if something went wrong.
 */
export async function registerSession(userId: string): Promise<{ allowed: boolean; message?: string }> {
  const sessionToken = getOrCreateSessionToken();

  try {
    // Clean up stale sessions first (older than 7 days)
    await supabase.rpc("cleanup_stale_sessions");

    // Upsert current session (handles page refreshes gracefully)
    const { error: upsertError } = await supabase
      .from("active_sessions")
      .upsert(
        {
          user_id: userId,
          session_token: sessionToken,
          device_info: getDeviceInfo(),
          last_active_at: new Date().toISOString(),
        },
        { onConflict: "session_token" },
      );

    if (upsertError) {
      console.error("Session upsert error:", upsertError);
      // Don't block login for tracking errors
      return { allowed: true };
    }

    // Get sessions that exceed the limit (oldest beyond MAX_SESSIONS)
    const { data: excessSessions } = await supabase
      .rpc("enforce_session_limit", { p_user_id: userId, p_max_sessions: MAX_SESSIONS });

    if (excessSessions && excessSessions.length > 0) {
      // Remove the oldest excess sessions
      const tokensToRemove = excessSessions.map((s: { session_token: string }) => s.session_token);
      await supabase
        .from("active_sessions")
        .delete()
        .in("session_token", tokensToRemove);
    }

    return { allowed: true };
  } catch (err) {
    console.error("Session registration error:", err);
    // Don't block login for tracking errors
    return { allowed: true };
  }
}

/**
 * Remove the current session on logout.
 */
export async function removeSession(): Promise<void> {
  const token = sessionStorage.getItem("findoo_session_token");
  if (!token) return;

  try {
    await supabase
      .from("active_sessions")
      .delete()
      .eq("session_token", token);
  } catch (err) {
    console.error("Session removal error:", err);
  } finally {
    sessionStorage.removeItem("findoo_session_token");
  }
}

/**
 * Update last_active_at for the current session (call periodically).
 */
export async function touchSession(): Promise<void> {
  const token = sessionStorage.getItem("findoo_session_token");
  if (!token) return;

  try {
    await supabase
      .from("active_sessions")
      .update({ last_active_at: new Date().toISOString() })
      .eq("session_token", token);
  } catch {
    // silent
  }
}
