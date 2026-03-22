/**
 * Integration tests for useAdminVerification hook — renderHook-based.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

vi.mock("@/integrations/supabase/client", () => {
  const createChain = (data: any[] = []) => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    in: vi.fn().mockResolvedValue({ data, error: null }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({
      data: [
        {
          id: "vr-1", user_id: "user-1", document_url: "https://example.com/doc.pdf",
          document_name: "PAN Card", registration_number: "REG001", regulator: "SEBI",
          notes: null, status: "pending", admin_notes: null, created_at: "2026-03-01T00:00:00Z",
        },
      ],
      error: null,
    }),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnValue({ then: vi.fn((cb: any) => cb()) }),
  });

  return {
    supabase: {
      from: vi.fn((table: string) => {
        if (table === "profiles") {
          const c = createChain();
          c.in = vi.fn().mockResolvedValue({
            data: [{ id: "user-1", full_name: "Test User", display_name: "Tester", avatar_url: null, organization: "TestCo", user_type: "intermediary", verification_status: "unverified" }],
            error: null,
          });
          return c;
        }
        if (table === "user_roles") {
          const c = createChain();
          c.in = vi.fn().mockResolvedValue({
            data: [{ user_id: "user-1", role: "intermediary", sub_type: "mfd" }],
            error: null,
          });
          return c;
        }
        return createChain();
      }),
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: "admin-1" } } },
        }),
      },
    },
  };
});

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { useVerificationQueue, type VerificationRequest } from "@/hooks/useAdminVerification";
import { supabase } from "@/integrations/supabase/client";

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useVerificationQueue (renderHook)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should fetch verification requests with profiles and roles", async () => {
    const { result } = renderHook(() => useVerificationQueue(false), { wrapper: createWrapper() });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });

    expect(supabase.from).toHaveBeenCalledWith("verification_requests");
    expect(supabase.from).toHaveBeenCalledWith("profiles");
    expect(supabase.from).toHaveBeenCalledWith("user_roles");
  });

  it("should return data with merged profiles", async () => {
    const { result } = renderHook(() => useVerificationQueue(false), { wrapper: createWrapper() });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });

    const data = result.current.data;
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);
    expect(data![0].id).toBe("vr-1");
    expect(data![0].status).toBe("pending");
    expect(data![0].profile?.full_name).toBe("Test User");
    expect(data![0].roles).toHaveLength(1);
  });
});

describe("VerificationRequest type", () => {
  it("should validate structural shape", () => {
    const req: VerificationRequest = {
      id: "vr-1", user_id: "user-1", document_url: "https://example.com/doc.pdf",
      document_name: "PAN", status: "pending", created_at: new Date().toISOString(),
      profile: { full_name: "Test", display_name: null, avatar_url: null, organization: null, user_type: "intermediary", verification_status: "unverified" },
      roles: [{ role: "intermediary", sub_type: "stock_broker" }],
    };
    expect(req.status).toBe("pending");
  });
});
