import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
}

const BASE_TITLE = "FindOO — Financially Social";

export function usePageMeta({ title, description }: PageMeta) {
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

    return () => {
      document.title = BASE_TITLE;
    };
  }, [title, description]);
}
