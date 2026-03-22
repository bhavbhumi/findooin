/**
 * Integration tests for useTrustCircleIQ hook — renderHook-based.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: {
          inner_circle: [], primary_network: [], secondary_network: [],
          tertiary_network: [], ecosystem: [], total: 0, cached: false,
        },
        error: null,
      }),
    },
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: "user-1" } } },
      }),
    },
  },
}));

import { useTrustCircleIQ, trackIntentSignal, CIRCLE_TIERS } from "@/hooks/useTrustCircleIQ";
import { supabase } from "@/integrations/supabase/client";

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useTrustCircleIQ (renderHook)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should call trustcircle-iq edge function", async () => {
    renderHook(() => useTrustCircleIQ("user-1"), { wrapper: createWrapper() });
    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith("trustcircle-iq", { method: "GET" });
    });
  });

  it("should return structured TrustCircleData", async () => {
    const { result } = renderHook(() => useTrustCircleIQ("user-1"), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });
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
    vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({ data: null, error: new Error("Network error") });
    const { result } = renderHook(() => useTrustCircleIQ("user-1"), { wrapper: createWrapper() });
    await waitFor(() => { expect(result.current.isError).toBe(true); });
  });
});

describe("CIRCLE_TIERS", () => {
  it("should have 5 tiers with correct keys", () => {
    expect(Object.keys(CIRCLE_TIERS)).toHaveLength(5);
    expect(CIRCLE_TIERS[1].key).toBe("inner_circle");
    expect(CIRCLE_TIERS[5].key).toBe("ecosystem");
  });
});

describe("trackIntentSignal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should call getSession and not throw", async () => {
    await trackIntentSignal("listing_browse", { category: "mutual_fund" });
    expect(supabase.auth.getSession).toHaveBeenCalled();
  });

  it("should skip if no session", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({ data: { session: null } } as any);
    await trackIntentSignal("test");
  });
});
