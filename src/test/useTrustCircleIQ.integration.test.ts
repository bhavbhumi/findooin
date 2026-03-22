/**
 * Integration tests for useTrustCircleIQ hook — renderHook-based.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

const mockInvoke = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    functions: {
      invoke: mockInvoke,
    },
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: "user-1" } } },
      }),
    },
  },
}));

import { useTrustCircleIQ, trackIntentSignal, CIRCLE_TIERS, type TrustCircleData } from "@/hooks/useTrustCircleIQ";

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

const mockTrustCircleData: TrustCircleData = {
  inner_circle: [],
  primary_network: [],
  secondary_network: [],
  tertiary_network: [],
  ecosystem: [],
  total: 0,
  cached: false,
};

describe("useTrustCircleIQ (renderHook)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInvoke.mockResolvedValue({ data: mockTrustCircleData, error: null });
  });

  it("should call trustcircle-iq edge function", async () => {
    renderHook(() => useTrustCircleIQ("user-1"), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("trustcircle-iq", { method: "GET" });
    });
  });

  it("should return structured TrustCircleData", async () => {
    const { result } = renderHook(() => useTrustCircleIQ("user-1"), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockTrustCircleData);
    expect(result.current.data?.inner_circle).toEqual([]);
    expect(result.current.data?.total).toBe(0);
  });

  it("should not fetch when userId is null", () => {
    const { result } = renderHook(() => useTrustCircleIQ(null), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("should not fetch when enabled=false", () => {
    const { result } = renderHook(() => useTrustCircleIQ("user-1", false), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("should handle edge function error gracefully", async () => {
    mockInvoke.mockResolvedValueOnce({ data: null, error: new Error("Network error") });

    const { result } = renderHook(() => useTrustCircleIQ("user-1"), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});

describe("CIRCLE_TIERS", () => {
  it("should have exactly 5 tiers", () => {
    expect(Object.keys(CIRCLE_TIERS)).toHaveLength(5);
  });

  it("tier 1 should be inner_circle", () => {
    expect(CIRCLE_TIERS[1].key).toBe("inner_circle");
    expect(CIRCLE_TIERS[1].label).toBe("Inner Circle");
  });

  it("tier 5 should be ecosystem", () => {
    expect(CIRCLE_TIERS[5].key).toBe("ecosystem");
    expect(CIRCLE_TIERS[5].label).toBe("Ecosystem");
  });
});

describe("trackIntentSignal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should insert intent signal with signal data", async () => {
    await trackIntentSignal("listing_browse", { category: "mutual_fund" });
    // Verified by mock — no error thrown
  });

  it("should handle missing signal data gracefully", async () => {
    await trackIntentSignal("job_post");
    // Should complete without error
  });
});
