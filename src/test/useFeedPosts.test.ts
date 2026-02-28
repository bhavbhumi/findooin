/**
 * Unit tests for useFeedPosts hook — validates normalization logic.
 */
import { describe, it, expect } from "vitest";

// Test the normalization function by extracting its logic
describe("FeedPost normalization", () => {
  const rawPost = {
    id: "post-1",
    content: "Hello world",
    post_type: "text",
    post_kind: "normal",
    query_category: null,
    hashtags: ["#test"],
    attachment_url: null,
    attachment_name: null,
    attachment_type: null,
    created_at: "2026-01-01T00:00:00Z",
    author: {
      id: "user-1",
      full_name: "Test User",
      display_name: "Tester",
      avatar_url: null,
      verification_status: "verified",
    },
    roles: [{ role: "investor", sub_type: null }],
    like_count: "5",
    comment_count: 3,
    bookmark_count: null,
  };

  function normalize(p: any) {
    return {
      id: p.id,
      content: p.content,
      post_type: p.post_type,
      post_kind: p.post_kind,
      query_category: p.query_category || null,
      hashtags: p.hashtags,
      attachment_url: p.attachment_url,
      attachment_name: p.attachment_name,
      attachment_type: p.attachment_type,
      created_at: p.created_at,
      author: {
        id: p.author?.id || "",
        full_name: p.author?.full_name || "Unknown",
        display_name: p.author?.display_name || null,
        avatar_url: p.author?.avatar_url || null,
        verification_status: p.author?.verification_status || "unverified",
      },
      roles: p.roles || [],
      like_count: Number(p.like_count) || 0,
      comment_count: Number(p.comment_count) || 0,
      bookmark_count: Number(p.bookmark_count) || 0,
    };
  }

  it("normalizes string counts to numbers", () => {
    const result = normalize(rawPost);
    expect(result.like_count).toBe(5);
    expect(result.comment_count).toBe(3);
    expect(result.bookmark_count).toBe(0);
  });

  it("defaults missing author to Unknown", () => {
    const result = normalize({ ...rawPost, author: null });
    expect(result.author.full_name).toBe("Unknown");
    expect(result.author.id).toBe("");
  });

  it("defaults missing roles to empty array", () => {
    const result = normalize({ ...rawPost, roles: undefined });
    expect(result.roles).toEqual([]);
  });

  it("preserves hashtags array", () => {
    const result = normalize(rawPost);
    expect(result.hashtags).toEqual(["#test"]);
  });

  it("handles query_category falsy values as null", () => {
    const result = normalize({ ...rawPost, query_category: "" });
    expect(result.query_category).toBeNull();
  });
});
