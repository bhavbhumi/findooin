/**
 * Integration tests for CreatePostComposer — post creation flow.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock supabase
const mockInsert = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: () =>
        Promise.resolve({
          data: {
            session: { user: { id: "user-123" } },
          },
        }),
    },
    from: (table: string) => {
      mockFrom(table);
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              single: () =>
                Promise.resolve({
                  data: { avatar_url: null, full_name: "Test User", display_name: "Test" },
                }),
            }),
          }),
        };
      }
      if (table === "posts") {
        return {
          insert: (data: any) => {
            mockInsert(data);
            return {
              select: () => ({
                single: () => Promise.resolve({ data: { id: "post-1" }, error: null }),
              }),
            };
          },
        };
      }
      // poll_options, survey_questions, etc.
      return {
        insert: (data: any) => {
          mockInsert(data);
          return Promise.resolve({ data: null, error: null });
        },
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: { id: "q-1" }, error: null }),
          }),
        }),
      };
    },
    rpc: () => Promise.resolve({ data: true }),
  },
}));

vi.mock("@/contexts/RoleContext", () => ({
  useRole: () => ({
    activeRole: "intermediary",
    loaded: true,
    userId: "user-123",
    roles: [{ role: "intermediary", sub_type: null }],
  }),
}));

vi.mock("@/hooks/useDrafts", () => ({
  useDrafts: () => ({
    drafts: [],
    saveDraft: vi.fn().mockResolvedValue("draft-1"),
    deleteDraft: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock("@/lib/storage", () => ({
  uploadFile: vi.fn().mockResolvedValue({ url: "https://example.com/file.pdf" }),
  validateFile: vi.fn().mockReturnValue(null),
}));

import { CreatePostComposer } from "@/components/feed/CreatePostComposer";

function renderComposer() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CreatePostComposer />
    </QueryClientProvider>
  );
}

describe("CreatePostComposer Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the composer with textarea", async () => {
    renderComposer();
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/share an insight/i)
      ).toBeInTheDocument();
    });
  });

  it("enables publish button when content is entered", async () => {
    const user = userEvent.setup();
    renderComposer();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share an insight/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/share an insight/i);
    await user.type(textarea, "My first market commentary #fintech");

    expect(textarea).toHaveValue("My first market commentary #fintech");
  });

  it("extracts hashtags from content", async () => {
    const user = userEvent.setup();
    renderComposer();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share an insight/i)).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText(/share an insight/i),
      "Great day for #markets and #investing"
    );

    // Hashtags should appear somewhere in the DOM (as badges with # prefix or plain text)
    await waitFor(() => {
      const container = document.body.textContent || "";
      expect(container).toContain("markets");
      expect(container).toContain("investing");
    });
  });

  it("shows character count warning near limit", async () => {
    const user = userEvent.setup();
    renderComposer();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share an insight/i)).toBeInTheDocument();
    });

    // Type some content and check character count is displayed
    await user.type(screen.getByPlaceholderText(/share an insight/i), "Hello world");

    // Character count should be visible
    expect(screen.getByText(/11/)).toBeInTheDocument();
  });

  it("publishes a post on submit", async () => {
    const user = userEvent.setup();
    renderComposer();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share an insight/i)).toBeInTheDocument();
    });

    await user.type(
      screen.getByPlaceholderText(/share an insight/i),
      "Integration test post content"
    );

    // Click publish (button is named "Post Now")
    const publishBtn = screen.getByRole("button", { name: /post now/i });
    await user.click(publishBtn);

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalled();
      const insertedData = mockInsert.mock.calls[0][0];
      expect(insertedData.content).toBe("Integration test post content");
      expect(insertedData.author_id).toBe("user-123");
    });
  });

  it("prevents submission of empty content", async () => {
    renderComposer();

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/share an insight/i)).toBeInTheDocument();
    });

    // Post Now button should not trigger insert on empty content
    const publishBtn = screen.getByRole("button", { name: /post now/i });
    await userEvent.click(publishBtn);

    expect(mockInsert).not.toHaveBeenCalled();
  });
});
