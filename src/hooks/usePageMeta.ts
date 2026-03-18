/**
 * usePageMeta — Dynamic page title, meta tags, and canonical URL management.
 *
 * Sets `document.title` with the FindOO base suffix, updates
 * Open Graph / Twitter Card meta tags, and sets the canonical URL.
 * Resets to base values on unmount.
 *
 * Usage: `usePageMeta({ title: "Feed", description: "Your professional feed", path: "/feed" })`
 */
import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
  /** Route path for canonical URL, e.g. "/feed" or "/blog/my-post". Omit for no update. */
  path?: string;
  /** Override OG image URL (defaults to site icon) */
  ogImage?: string;
}

const BASE_TITLE = "FindOO — Financially Social";
const BASE_URL = "https://findoo.in";
const DEFAULT_DESCRIPTION =
  "FindOO — India's first Financially Social network. Connect with verified Issuers, Intermediaries & Investors across SEBI, AMFI & IRDAI.";

export function usePageMeta({ title, description, path, ogImage }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    document.title = fullTitle;

    // Update OG & twitter title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);
    if (twTitle) twTitle.setAttribute("content", fullTitle);

    if (description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (metaDesc) metaDesc.setAttribute("content", description);
      if (ogDesc) ogDesc.setAttribute("content", description);
      if (twDesc) twDesc.setAttribute("content", description);
    }

    // Update canonical URL
    if (path) {
      const canonicalUrl = `${BASE_URL}${path}`;
      const canonical = document.querySelector('link[rel="canonical"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (canonical) canonical.setAttribute("href", canonicalUrl);
      if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);
    }

    // Update OG image if provided
    if (ogImage) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      const twImg = document.querySelector('meta[name="twitter:image"]');
      if (ogImg) ogImg.setAttribute("content", ogImage);
      if (twImg) twImg.setAttribute("content", ogImage);
    }

    return () => {
      document.title = BASE_TITLE;
      // Reset canonical to homepage
      const canonical = document.querySelector('link[rel="canonical"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (canonical) canonical.setAttribute("href", `${BASE_URL}/`);
      if (ogUrl) ogUrl.setAttribute("content", `${BASE_URL}/`);
      // Reset description
      const metaDesc = document.querySelector('meta[name="description"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (metaDesc) metaDesc.setAttribute("content", DEFAULT_DESCRIPTION);
      if (ogDesc) ogDesc.setAttribute("content", DEFAULT_DESCRIPTION);
      if (twDesc) twDesc.setAttribute("content", DEFAULT_DESCRIPTION);
    };
  }, [title, description, path, ogImage]);
}
