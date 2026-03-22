/**
 * Integration tests for useMessages hook — renderHook-based.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => {
  const chainable = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: "msg-1" }, error: null }),
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
      channel: vi.fn().mockReturnValue({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
        track: vi.fn(),
        presenceState: vi.fn().mockReturnValue({}),
      }),
      removeChannel: vi.fn(),
    },
  };
});

vi.mock("@/lib/sanitize", () => ({
  sanitizeText: (t: string) => t,
}));

vi.mock("@/hooks/useCodedMessagingGuard", () => ({
  useCodedMessagingGuard: () => ({ scanAndFlag: vi.fn() }),
}));

import { useMessages, MESSAGE_CATEGORIES } from "@/hooks/useMessages";
import { supabase } from "@/integrations/supabase/client";

describe("useMessages (renderHook)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should initialize with empty conversations and loading=true", async () => {
    const { result } = renderHook(() => useMessages("user-1"));

    expect(result.current.loading).toBe(true);
    expect(result.current.conversations).toEqual([]);
    expect(result.current.messages).toEqual([]);
    expect(result.current.selectedUserId).toBeNull();
    expect(result.current.totalUnread).toBe(0);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should not load conversations if userId is null", () => {
    const { result } = renderHook(() => useMessages(null));
    expect(result.current.loading).toBe(true);
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("should call get_conversations RPC on mount", async () => {
    renderHook(() => useMessages("user-1"));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith("get_conversations", { p_user_id: "user-1" });
    });
  });

  it("should subscribe to realtime channel on mount", async () => {
    renderHook(() => useMessages("user-1"));

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith("messages-realtime");
    });
  });

  it("should clean up realtime channels on unmount", async () => {
    const { unmount } = renderHook(() => useMessages("user-1"));

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalled();
    });

    unmount();
    expect(supabase.removeChannel).toHaveBeenCalled();
  });

  it("closeConversation should reset state", async () => {
    const { result } = renderHook(() => useMessages("user-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.closeConversation();
    });

    expect(result.current.selectedUserId).toBeNull();
    expect(result.current.selectedProfile).toBeNull();
    expect(result.current.messages).toEqual([]);
    expect(result.current.recipientRoles).toEqual([]);
  });

  it("MESSAGE_CATEGORIES should have 6 entries with value and label", () => {
    expect(MESSAGE_CATEGORIES).toHaveLength(6);
    MESSAGE_CATEGORIES.forEach((cat) => {
      expect(cat.value).toBeTruthy();
      expect(cat.label).toBeTruthy();
    });
  });
});
