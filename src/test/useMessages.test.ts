import { describe, it, expect, vi } from "vitest";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: "user-1" } } } }),
    },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
      track: vi.fn(),
      presenceState: vi.fn().mockReturnValue({}),
    })),
    removeChannel: vi.fn(),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
  },
}));

vi.mock("@/lib/sanitize", () => ({
  sanitizeText: (t: string) => t,
}));

vi.mock("@/hooks/useCodedMessagingGuard", () => ({
  useCodedMessagingGuard: () => ({ scanAndFlag: vi.fn() }),
}));

import { MESSAGE_CATEGORIES, type MessageCategory, type Conversation, type Message } from "@/hooks/useMessages";

describe("useMessages", () => {
  describe("MESSAGE_CATEGORIES", () => {
    it("should define 6 categories", () => {
      expect(MESSAGE_CATEGORIES).toHaveLength(6);
    });

    it("should include general, sales, ops, accounts, support, complaint", () => {
      const values = MESSAGE_CATEGORIES.map((c) => c.value);
      expect(values).toEqual(["general", "sales", "ops", "accounts", "support", "complaint"]);
    });
  });

  describe("types", () => {
    it("Conversation interface should be structurally valid", () => {
      const conv: Conversation = {
        user_id: "u-1",
        full_name: "Test User",
        display_name: null,
        avatar_url: null,
        last_message: "Hello",
        last_message_at: new Date().toISOString(),
        unread_count: 0,
      };
      expect(conv.user_id).toBe("u-1");
    });

    it("Message interface should be structurally valid", () => {
      const msg: Message = {
        id: "m-1",
        sender_id: "u-1",
        receiver_id: "u-2",
        content: "Hi",
        read: false,
        created_at: new Date().toISOString(),
        category: "general",
      };
      expect(msg.category).toBe("general");
    });
  });
});
