import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "admin-1" } } } }),
    },
  },
}));

import { ADMIN_CACHE, logAdminAction } from "@/hooks/useAdminShared";
import { supabase } from "@/integrations/supabase/client";

describe("useAdminShared", () => {
  it("ADMIN_CACHE should have staleTime and gcTime", () => {
    expect(ADMIN_CACHE.staleTime).toBe(60_000);
    expect(ADMIN_CACHE.gcTime).toBe(600_000);
  });

  it("logAdminAction should insert audit log", async () => {
    await logAdminAction("test_action", "test_resource", "res-1", { key: "value" });
    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith("audit_logs");
  });

  it("logAdminAction should skip if no session", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({ data: { session: null } } as any);
    const fromSpy = vi.spyOn(supabase, "from");
    const callsBefore = fromSpy.mock.calls.length;
    await logAdminAction("test", "test");
    // Should not have called from() for audit_logs
    const auditCalls = fromSpy.mock.calls.slice(callsBefore).filter((c) => c[0] === "audit_logs");
    expect(auditCalls).toHaveLength(0);
  });
});
