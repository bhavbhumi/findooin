import { supabase } from "@/integrations/supabase/client";

const MAX_SESSIONS = 3;
const SESSION_TOKEN_KEY = "findoo_session_token";
let inMemorySessionToken: string | null = null;

function generateToken(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function readSessionToken(): string | null {
  if (typeof window === "undefined") return inMemorySessionToken;

  try {
    const token = window.sessionStorage.getItem(SESSION_TOKEN_KEY);
    if (token) return token;
  } catch {
    // sessionStorage may be blocked on some mobile browsers/private modes
  }

  try {
    const token = window.localStorage.getItem(SESSION_TOKEN_KEY);
    if (token) return token;
  } catch {
    // localStorage may also be blocked
  }

  return inMemorySessionToken;
}

function persistSessionToken(token: string): void {
  if (typeof window === "undefined") {
    inMemorySessionToken = token;
    return;
  }

  try {
    window.sessionStorage.setItem(SESSION_TOKEN_KEY, token);
    inMemorySessionToken = token;
    return;
  } catch {
    // fallback to localStorage
  }

  try {
    window.localStorage.setItem(SESSION_TOKEN_KEY, token);
    inMemorySessionToken = token;
    return;
  } catch {
    // final fallback to memory only
  }

  inMemorySessionToken = token;
}

function clearSessionToken(): void {
  if (typeof window === "undefined") {
    inMemorySessionToken = null;
    return;
  }

  try {
    window.sessionStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // ignore
  }

  try {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
  } catch {
    // ignore
  }

  inMemorySessionToken = null;
}

function getOrCreateSessionToken(): string {
  const existing = readSessionToken();
  if (existing) return existing;

  const token = generateToken();
  persistSessionToken(token);
  return token;
}

function getDeviceInfo(): string {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent;
  const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
  return isMobile ? "Mobile" : "Desktop";
}

export async function registerSession(userId: string): Promise<{ allowed: boolean; message?: string }> {
  try {
    const sessionToken = getOrCreateSessionToken();

    await supabase.rpc("cleanup_stale_sessions");

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
      return { allowed: true };
    }

    const { data: excessSessions } = await supabase.rpc("enforce_session_limit", {
      p_user_id: userId,
      p_max_sessions: MAX_SESSIONS,
    });

    if (excessSessions && excessSessions.length > 0) {
      const tokensToRemove = excessSessions.map((s: { session_token: string }) => s.session_token);
      await supabase.from("active_sessions").delete().in("session_token", tokensToRemove);
    }

    return { allowed: true };
  } catch (err) {
    console.error("Session registration error:", err);
    return { allowed: true };
  }
}

export async function removeSession(): Promise<void> {
  const token = readSessionToken();
  if (!token) return;

  try {
    await supabase.from("active_sessions").delete().eq("session_token", token);
  } catch (err) {
    console.error("Session removal error:", err);
  } finally {
    clearSessionToken();
  }
}

export async function touchSession(): Promise<void> {
  const token = readSessionToken();
  if (!token) return;

  try {
    await supabase.from("active_sessions").update({ last_active_at: new Date().toISOString() }).eq("session_token", token);
  } catch {
    // silent
  }
}
