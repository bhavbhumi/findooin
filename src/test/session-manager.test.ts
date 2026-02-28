/**
 * Unit tests for session-manager utility functions.
 * Tests token generation, persistence, and read/write/clear flows.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// We need to test the internal helpers, so we mock supabase and import the module
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
        in: vi.fn().mockResolvedValue({ error: null }),
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      })),
    })),
  },
}));

describe("session-manager", () => {
  beforeEach(() => {
    // Clear storage
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("registerSession creates a session and returns allowed: true", async () => {
    const { registerSession } = await import("@/lib/session-manager");
    const result = await registerSession("user-123");
    expect(result.allowed).toBe(true);
  });

  it("touchSession does not throw when no token exists", async () => {
    // Clear any previously set tokens
    window.sessionStorage.clear();
    window.localStorage.clear();

    // Re-import to get fresh module state
    const mod = await import("@/lib/session-manager");
    await expect(mod.touchSession()).resolves.toBeUndefined();
  });

  it("removeSession clears storage", async () => {
    const { registerSession, removeSession } = await import("@/lib/session-manager");
    await registerSession("user-456");
    await removeSession();

    // Session token should be cleared from sessionStorage
    expect(window.sessionStorage.getItem("findoo_session_token")).toBeNull();
  });
});
