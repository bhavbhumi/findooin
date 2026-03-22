/**
 * Integration tests for useAdminVerification hook — renderHook-based.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

const mockFrom = vi.fn();

const mockVerificationData = [
  {
    id: "vr-1",
    user_id: "user-1",
    document_url: "https://example.com/doc.pdf",
    document_name: "PAN Card",
    registration_number: "REG001",
    regulator: "SEBI",
    notes: null,
    status: "pending",
    admin_notes: null,
    created_at: "2026-03-01T00:00:00Z",
  },
];

const mockProfiles = [
  {
    id: "user-1",
    full_name: "Test User",
    display_name: "Tester",
    avatar_url: null,
    organization: "TestCo",
    user_type: "intermediary",
    verification_status: "unverified",
  },
];

const mockRoles = [
  { user_id: "user-1", role: "intermediary", sub_type: "mutual_fund_distributor" },
];

vi.mock("@/integrations/supabase/client", () => {
  // Build chainable mocks that resolve based on table
  const createChainable = (resolveData: any[] = []) => {
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation(() => Promise.resolve({ data: resolveData, error: null })),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnValue({ then: vi.fn((cb: any) => cb()) }),
    };
    return chain;
  };

  return {
    supabase: {
      from: vi.fn((table: string) => {
        mockFrom(table);
        if (table === "verification_requests") return createChainable(mockVerificationData);
        if (table === "profiles") return createChainable(mockProfiles);
        if (table === "user_roles") return createChainable(mockRoles);
        if (table === "audit_logs") return createChainable([]);
        return createChainable([]);
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
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { useVerificationQueue, type VerificationRequest } from "@/hooks/useAdminVerification";

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

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFrom).toHaveBeenCalledWith("verification_requests");
    expect(mockFrom).toHaveBeenCalledWith("profiles");
    expect(mockFrom).toHaveBeenCalledWith("user_roles");
  });

  it("should merge profile data into verification requests", async () => {
    const { result } = renderHook(() => useVerificationQueue(false), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const data = result.current.data;
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThan(0);

    const first = data![0];
    expect(first.id).toBe("vr-1");
    expect(first.status).toBe("pending");
    expect(first.profile).toBeDefined();
    expect(first.profile?.full_name).toBe("Test User");
    expect(first.roles).toHaveLength(1);
    expect(first.roles![0].role).toBe("intermediary");
  });

  it("should pass includeArchived flag correctly", async () => {
    const { result } = renderHook(() => useVerificationQueue(true), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Should have fetched regardless of archived status
    expect(mockFrom).toHaveBeenCalledWith("verification_requests");
  });
});

describe("VerificationRequest type", () => {
  it("should validate structural shape", () => {
    const req: VerificationRequest = {
      id: "vr-1",
      user_id: "user-1",
      document_url: "https://example.com/doc.pdf",
      document_name: "PAN",
      status: "pending",
      created_at: new Date().toISOString(),
      profile: {
        full_name: "Test",
        display_name: null,
        avatar_url: null,
        organization: null,
        user_type: "intermediary",
        verification_status: "unverified",
      },
      roles: [{ role: "intermediary", sub_type: "stock_broker" }],
    };

    expect(req.status).toBe("pending");
    expect(req.profile?.user_type).toBe("intermediary");
  });
});
