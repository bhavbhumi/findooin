import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "user-1" } } } }),
    },
  },
}));

import {
  CIRCLE_TIERS,
  trackIntentSignal,
  type TrustCircleData,
  type TrustCircleResult,
  type CircleTier,
} from "@/hooks/useTrustCircleIQ";
import { supabase } from "@/integrations/supabase/client";

describe("TrustCircle IQ", () => {
  describe("CIRCLE_TIERS", () => {
    it("should have 5 tiers (1-5)", () => {
      const tiers = Object.keys(CIRCLE_TIERS).map(Number);
      expect(tiers).toEqual([1, 2, 3, 4, 5]);
    });

    it("each tier should have key, label, shortLabel, description", () => {
      for (const tier of [1, 2, 3, 4, 5] as CircleTier[]) {
        const t = CIRCLE_TIERS[tier];
        expect(t.key).toBeTruthy();
        expect(t.label).toBeTruthy();
        expect(t.shortLabel).toBeTruthy();
        expect(t.description).toBeTruthy();
      }
    });

    it("tier keys should match TrustCircleData fields", () => {
      expect(CIRCLE_TIERS[1].key).toBe("inner_circle");
      expect(CIRCLE_TIERS[2].key).toBe("primary_network");
      expect(CIRCLE_TIERS[3].key).toBe("secondary_network");
      expect(CIRCLE_TIERS[4].key).toBe("tertiary_network");
      expect(CIRCLE_TIERS[5].key).toBe("ecosystem");
    });
  });

  describe("trackIntentSignal", () => {
    it("should insert intent signal for authenticated user", async () => {
      await trackIntentSignal("listing_browse", { category: "mutual_fund" });
      expect(supabase.auth.getSession).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith("intent_signals");
    });

    it("should skip if no session", async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({ data: { session: null } } as any);
      const fromSpy = vi.spyOn(supabase, "from");
      const before = fromSpy.mock.calls.length;
      await trackIntentSignal("test");
      const intentCalls = fromSpy.mock.calls.slice(before).filter((c) => c[0] === "intent_signals");
      expect(intentCalls).toHaveLength(0);
    });
  });

  describe("types", () => {
    it("TrustCircleResult should be structurally valid", () => {
      const result: TrustCircleResult = {
        target_id: "u-1",
        affinity_score: 0.85,
        circle_tier: 1,
        role_weight: 0.9,
        intent_multiplier: 1.5,
        trust_proximity: 0.7,
        activity_resonance: 0.6,
        freshness_decay: 0.95,
        referral_boost: 0.1,
        referral_source: "Referred by John",
        profile: {
          id: "u-1",
          full_name: "John",
          display_name: null,
          avatar_url: null,
          headline: null,
          organization: null,
          location: null,
          verification_status: "verified",
          specializations: null,
          certifications: null,
          user_type: "intermediary",
        },
        roles: [{ role: "intermediary", sub_type: null }],
      };
      expect(result.affinity_score).toBe(0.85);
    });
  });
});
