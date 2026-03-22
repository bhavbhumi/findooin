/**
 * Integration tests for useVault hook — renderHook-based.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";

// Track mock call args
const mockFrom = vi.fn();
const mockUpload = vi.fn();
const mockRemove = vi.fn();
const mockCreateSignedUrl = vi.fn();

vi.mock("@/integrations/supabase/client", () => {
  const selectChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    delete: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
  };

  // Default: return empty files list
  selectChain.order = vi.fn().mockResolvedValue({ data: [], error: null });

  const from = vi.fn((table: string) => {
    mockFrom(table);
    return selectChain;
  });

  return {
    supabase: {
      from,
      storage: {
        from: vi.fn(() => ({
          upload: mockUpload.mockResolvedValue({ error: null }),
          remove: mockRemove.mockResolvedValue({ error: null }),
          createSignedUrl: mockCreateSignedUrl.mockResolvedValue({
            data: { signedUrl: "https://example.com/signed-url" },
          }),
        })),
      },
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: { user: { id: "user-1" } } },
        }),
      },
    },
  };
});

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

import { useVault, VAULT_CATEGORIES, type VaultFile } from "@/hooks/useVault";

describe("useVault (renderHook)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with loading=true and empty files", async () => {
    const { result } = renderHook(() => useVault("user-1"));
    
    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.files).toEqual([]);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should not fetch if userId is null", async () => {
    const { result } = renderHook(() => useVault(null));
    
    // Should stay in initial state without fetching
    expect(result.current.files).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalledWith("vault_files");
  });

  it("should expose all expected methods", async () => {
    const { result } = renderHook(() => useVault("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.uploadFile).toBe("function");
    expect(typeof result.current.deleteFile).toBe("function");
    expect(typeof result.current.toggleShare).toBe("function");
    expect(typeof result.current.getSignedUrl).toBe("function");
    expect(typeof result.current.syncVerificationDocs).toBe("function");
    expect(typeof result.current.refetch).toBe("function");
  });

  it("should call storage for signed URLs", async () => {
    const { result } = renderHook(() => useVault("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const url = await result.current.getSignedUrl("user-1/kyc/test.pdf");
    expect(url).toBe("https://example.com/signed-url");
    expect(mockCreateSignedUrl).toHaveBeenCalledWith("user-1/kyc/test.pdf", 3600);
  });

  it("uploadFile should return null when userId is null", async () => {
    const { result } = renderHook(() => useVault(null));

    const file = new File(["content"], "test.pdf", { type: "application/pdf" });
    const uploaded = await result.current.uploadFile(file, "kyc");
    expect(uploaded).toBeNull();
  });

  it("VAULT_CATEGORIES should map to valid category objects", () => {
    expect(VAULT_CATEGORIES.every((c) => c.value && c.label)).toBe(true);
    expect(VAULT_CATEGORIES.map((c) => c.value)).toContain("kyc");
    expect(VAULT_CATEGORIES.map((c) => c.value)).toContain("certificates");
  });
});
