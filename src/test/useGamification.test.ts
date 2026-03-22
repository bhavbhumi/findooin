import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "user-1" } } } }),
    },
  },
}));

import { type UserXP, type BadgeDefinition, type UserBadge, type LeaderboardEntry } from "@/hooks/useGamification";

describe("Gamification types", () => {
  it("UserXP should have all expected fields", () => {
    const xp: UserXP = {
      total_xp: 100,
      level: 2,
      current_streak: 3,
      longest_streak: 5,
      post_streak: 1,
      streak_multiplier: 1.5,
    };
    expect(xp.level).toBe(2);
    expect(xp.streak_multiplier).toBe(1.5);
  });

  it("BadgeDefinition should have all expected fields", () => {
    const badge: BadgeDefinition = {
      id: "b-1",
      slug: "first-post",
      name: "First Post",
      description: "Created your first post",
      icon_name: "Pencil",
      category: "engagement",
      tier: "bronze",
      xp_reward: 10,
      criteria_value: 1,
      sort_order: 1,
    };
    expect(badge.slug).toBe("first-post");
  });

  it("LeaderboardEntry should have profile", () => {
    const entry: LeaderboardEntry = {
      user_id: "u-1",
      total_xp: 500,
      level: 3,
      current_streak: 7,
      profile: {
        full_name: "Test",
        display_name: null,
        avatar_url: null,
        verification_status: "verified",
      },
    };
    expect(entry.profile.verification_status).toBe("verified");
  });
});
