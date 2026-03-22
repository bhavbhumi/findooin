/**
 * Integration tests for useGamification hooks — renderHook-based.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

vi.mock("@/integrations/supabase/client", () => {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    lte: vi.fn().mockReturnThis(),
    gte: vi.fn().mockResolvedValue({ data: [], error: null }),
    maybeSingle: vi.fn().mockResolvedValue({
      data: { total_xp: 250, level: 2, current_streak: 3, longest_streak: 5, post_streak: 1, streak_multiplier: 1.5 },
      error: null,
    }),
  };

  return {
    supabase: {
      from: vi.fn(() => chainable),
      rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: "user-1" } } },
        }),
      },
    },
  };
});

import { useUserXP, useUserBadges, useBadgeDefinitions, useLeaderboard, useWeeklyChallenges } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

describe("useUserXP (renderHook)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should return XP data for a valid userId", async () => {
    const { result } = renderHook(() => useUserXP("user-1"), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({
      total_xp: 250, level: 2, current_streak: 3, longest_streak: 5, post_streak: 1, streak_multiplier: 1.5,
    });
  });

  it("should not fetch when userId is undefined", () => {
    const { result } = renderHook(() => useUserXP(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("should query user_xp table", async () => {
    renderHook(() => useUserXP("user-1"), { wrapper: createWrapper() });
    await waitFor(() => { expect(supabase.from).toHaveBeenCalledWith("user_xp"); });
  });
});

describe("useUserBadges (renderHook)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should not fetch when userId is undefined", () => {
    const { result } = renderHook(() => useUserBadges(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("should query user_badges table", async () => {
    renderHook(() => useUserBadges("user-1"), { wrapper: createWrapper() });
    await waitFor(() => { expect(supabase.from).toHaveBeenCalledWith("user_badges"); });
  });
});

describe("useBadgeDefinitions (renderHook)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should query badge_definitions table", async () => {
    renderHook(() => useBadgeDefinitions(), { wrapper: createWrapper() });
    await waitFor(() => { expect(supabase.from).toHaveBeenCalledWith("badge_definitions"); });
  });
});

describe("useLeaderboard (renderHook)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should call get_leaderboard RPC with default limit", async () => {
    renderHook(() => useLeaderboard(), { wrapper: createWrapper() });
    await waitFor(() => { expect(supabase.rpc).toHaveBeenCalledWith("get_leaderboard", { p_limit: 20, p_offset: 0 }); });
  });

  it("should call get_leaderboard RPC with custom limit", async () => {
    renderHook(() => useLeaderboard(50), { wrapper: createWrapper() });
    await waitFor(() => { expect(supabase.rpc).toHaveBeenCalledWith("get_leaderboard", { p_limit: 50, p_offset: 0 }); });
  });
});

describe("useWeeklyChallenges (renderHook)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should not fetch when userId is undefined", () => {
    const { result } = renderHook(() => useWeeklyChallenges(undefined), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("should query weekly_challenges", async () => {
    renderHook(() => useWeeklyChallenges("user-1"), { wrapper: createWrapper() });
    await waitFor(() => { expect(supabase.from).toHaveBeenCalledWith("weekly_challenges"); });
  });
});
