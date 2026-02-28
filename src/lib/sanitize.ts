/**
 * sanitize — XSS prevention utility for user-generated content.
 *
 * Wraps DOMPurify to strip dangerous HTML/JS from strings before
 * they are persisted or rendered. Used in posts, comments, messages,
 * and any other user-input surface.
 *
 * @module sanitize
 */
import DOMPurify from "dompurify";

/**
 * Sanitize a plain-text string by stripping all HTML tags and script content.
 * Returns a safe plain-text string.
 */
export function sanitizeText(input: string): string {
  // ALLOWED_TAGS empty = strip all HTML, return plain text
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

/**
 * Sanitize rich HTML content, allowing safe formatting tags only.
 * Used if we ever render HTML content (blog posts, rich descriptions).
 */
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "code", "pre", "blockquote"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

/**
 * Validate and sanitize a URL to prevent javascript: protocol attacks.
 * Returns the URL if safe, or empty string if dangerous.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^javascript:/i.test(trimmed) || /^data:/i.test(trimmed) || /^vbscript:/i.test(trimmed)) {
    return "";
  }
  return trimmed;
}
