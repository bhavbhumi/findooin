import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeHtml, sanitizeUrl } from "@/lib/sanitize";

describe("sanitizeText", () => {
  it("strips HTML tags", () => {
    expect(sanitizeText("<script>alert('xss')</script>Hello")).toBe("Hello");
  });

  it("strips nested HTML", () => {
    expect(sanitizeText("<div><b>bold</b></div>")).toBe("bold");
  });

  it("preserves plain text", () => {
    expect(sanitizeText("Normal text content")).toBe("Normal text content");
  });

  it("trims whitespace", () => {
    expect(sanitizeText("  hello  ")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(sanitizeText("")).toBe("");
  });

  it("strips event handlers", () => {
    expect(sanitizeText('<img onerror="alert(1)" src="x">')).toBe("");
  });

  it("strips iframe tags", () => {
    expect(sanitizeText('<iframe src="evil.com"></iframe>Safe')).toBe("Safe");
  });
});

describe("sanitizeHtml", () => {
  it("allows safe tags", () => {
    expect(sanitizeHtml("<b>bold</b> <em>italic</em>")).toBe("<b>bold</b> <em>italic</em>");
  });

  it("strips script tags", () => {
    expect(sanitizeHtml("<script>alert(1)</script><p>safe</p>")).toBe("<p>safe</p>");
  });

  it("allows links with href", () => {
    const input = '<a href="https://example.com">link</a>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it("strips dangerous attributes", () => {
    expect(sanitizeHtml('<a href="x" onclick="evil()">link</a>')).toBe('<a href="x">link</a>');
  });

  it("strips style tags", () => {
    expect(sanitizeHtml("<style>body{display:none}</style>Content")).toBe("Content");
  });
});

describe("sanitizeUrl", () => {
  it("blocks javascript: protocol", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
  });

  it("blocks JavaScript: with mixed case", () => {
    expect(sanitizeUrl("JavaScript:alert(1)")).toBe("");
  });

  it("blocks data: protocol", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBe("");
  });

  it("blocks vbscript: protocol", () => {
    expect(sanitizeUrl("vbscript:MsgBox")).toBe("");
  });

  it("allows https URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
  });

  it("allows relative URLs", () => {
    expect(sanitizeUrl("/path/to/page")).toBe("/path/to/page");
  });

  it("trims whitespace", () => {
    expect(sanitizeUrl("  https://safe.com  ")).toBe("https://safe.com");
  });
});
