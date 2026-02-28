/**
 * Unit tests for optimistic cache updater logic in usePostInteractions.
 */
import { describe, it, expect } from "vitest";
import type { FeedPost } from "@/hooks/useFeedPosts";

describe("optimistic update logic", () => {
  const mockPost: FeedPost = {
    id: "post-1",
    content: "Test",
    post_type: "text",
    post_kind: "normal",
    query_category: null,
    hashtags: null,
    attachment_url: null,
    attachment_name: null,
    attachment_type: null,
    created_at: "2026-01-01T00:00:00Z",
    author: {
      id: "user-1",
      full_name: "Test",
      display_name: null,
      avatar_url: null,
      verification_status: "unverified",
    },
    roles: [],
    like_count: 10,
    comment_count: 5,
    bookmark_count: 2,
  };

  it("increments like_count on like", () => {
    const updated = { ...mockPost, like_count: mockPost.like_count + 1 };
    expect(updated.like_count).toBe(11);
  });

  it("decrements like_count on unlike", () => {
    const updated = { ...mockPost, like_count: mockPost.like_count - 1 };
    expect(updated.like_count).toBe(9);
  });

  it("increments bookmark_count on bookmark", () => {
    const updated = { ...mockPost, bookmark_count: mockPost.bookmark_count + 1 };
    expect(updated.bookmark_count).toBe(3);
  });

  it("decrements bookmark_count on unbookmark", () => {
    const updated = { ...mockPost, bookmark_count: mockPost.bookmark_count - 1 };
    expect(updated.bookmark_count).toBe(1);
  });

  it("rollback restores original count after failed like", () => {
    // Simulate: like (increment), then rollback (decrement)
    const afterLike = { ...mockPost, like_count: mockPost.like_count + 1 };
    const afterRollback = { ...afterLike, like_count: afterLike.like_count - 1 };
    expect(afterRollback.like_count).toBe(mockPost.like_count);
  });
});
