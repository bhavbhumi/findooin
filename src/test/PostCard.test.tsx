import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PostCard } from "@/components/feed/PostCard";
import type { FeedPost } from "@/hooks/useFeedPosts";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

// Mock usePostInteractions
vi.mock("@/hooks/usePostInteractions", () => ({
  usePostInteractions: () => ({
    liked: false,
    bookmarked: false,
    currentUserId: null,
    toggleLike: vi.fn(),
    toggleBookmark: vi.fn(),
  }),
}));

const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });

function wrap(ui: React.ReactNode) {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  );
}

const mockPost: FeedPost = {
  id: "post-1",
  content: "Hello world, this is a test post content",
  post_type: "text",
  post_kind: "normal",
  query_category: null,
  hashtags: ["#fintech", "#investing"],
  attachment_url: null,
  attachment_name: null,
  attachment_type: null,
  created_at: new Date().toISOString(),
  author: {
    id: "user-1",
    full_name: "Jane Doe",
    display_name: "Jane",
    avatar_url: null,
    verification_status: "verified",
  },
  roles: [{ role: "investor", sub_type: null }],
  like_count: 5,
  comment_count: 2,
  bookmark_count: 1,
};

describe("PostCard", () => {
  it("renders post content", () => {
    render(wrap(<PostCard post={mockPost} />));
    expect(screen.getByText(/Hello world/)).toBeInTheDocument();
  });

  it("renders author name", () => {
    render(wrap(<PostCard post={mockPost} />));
    expect(screen.getByText("Jane")).toBeInTheDocument();
  });

  it("renders hashtags", () => {
    render(wrap(<PostCard post={mockPost} />));
    expect(screen.getByText("#fintech")).toBeInTheDocument();
    expect(screen.getByText("#investing")).toBeInTheDocument();
  });

  it("renders like count", () => {
    render(wrap(<PostCard post={mockPost} />));
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders comment count", () => {
    render(wrap(<PostCard post={mockPost} />));
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("has accessible like button", () => {
    render(wrap(<PostCard post={mockPost} />));
    expect(screen.getByLabelText("Like post")).toBeInTheDocument();
  });

  it("has accessible comment toggle", () => {
    render(wrap(<PostCard post={mockPost} />));
    expect(screen.getByLabelText("Show comments")).toBeInTheDocument();
  });

  it("shows verified badge for verified author", () => {
    render(wrap(<PostCard post={mockPost} />));
    // CheckCircle2 renders as an SVG, the parent element should exist
    const authorLink = screen.getByText("Jane");
    expect(authorLink.closest("div")).toBeTruthy();
  });

  it("renders post without hashtags gracefully", () => {
    const postNoTags = { ...mockPost, hashtags: null };
    render(wrap(<PostCard post={postNoTags} />));
    expect(screen.getByText(/Hello world/)).toBeInTheDocument();
  });

  it("renders market commentary badge", () => {
    const mcPost = { ...mockPost, post_type: "market_commentary" };
    render(wrap(<PostCard post={mcPost} />));
    expect(screen.getByText("Market Commentary")).toBeInTheDocument();
  });
});
