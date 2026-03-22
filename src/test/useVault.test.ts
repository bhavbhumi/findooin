import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: "https://example.com/signed" } }),
      })),
    },
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "user-1" } } } }),
    },
  },
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import { VAULT_CATEGORIES, type VaultCategory } from "@/hooks/useVault";

describe("Vault", () => {
  describe("VAULT_CATEGORIES", () => {
    it("should have 6 categories", () => {
      expect(VAULT_CATEGORIES).toHaveLength(6);
    });

    it("should include expected categories", () => {
      const values = VAULT_CATEGORIES.map((c) => c.value);
      expect(values).toContain("kyc");
      expect(values).toContain("tax");
      expect(values).toContain("verification");
      expect(values).toContain("certificates");
      expect(values).toContain("media");
      expect(values).toContain("other");
    });

    it("should have labels for all categories", () => {
      VAULT_CATEGORIES.forEach((cat) => {
        expect(cat.label).toBeTruthy();
        expect(typeof cat.label).toBe("string");
      });
    });
  });

  describe("VaultCategory type", () => {
    it("should accept valid categories", () => {
      const valid: VaultCategory[] = ["kyc", "tax", "verification", "certificates", "media", "other"];
      expect(valid).toHaveLength(6);
    });
  });
});
