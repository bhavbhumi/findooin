import { ExternalLink, Globe } from "lucide-react";
import { memo, useMemo } from "react";

/**
 * Extracts the first URL from post content and renders a styled link preview card.
 * Uses favicon + domain display since we can't fetch OG tags client-side.
 */
interface LinkPreviewCardProps {
  content: string;
}

const URL_REGEX = /https?:\/\/[^\s<>"')\]]+/gi;

function extractFirstUrl(text: string): string | null {
  const match = text.match(URL_REGEX);
  return match?.[0] || null;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function getFaviconUrl(url: string): string {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch {
    return "";
  }
}

function getPathPreview(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    if (!path || path === "/") return "";
    // Convert path to readable title: /some-article-title -> Some Article Title
    return path
      .split("/")
      .pop()
      ?.replace(/[-_]/g, " ")
      .replace(/\.\w+$/, "")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, 60) || "";
  } catch {
    return "";
  }
}

export const LinkPreviewCard = memo(({ content }: LinkPreviewCardProps) => {
  const url = useMemo(() => extractFirstUrl(content), [content]);

  if (!url) return null;

  const domain = getDomain(url);
  const favicon = getFaviconUrl(url);
  const pathTitle = getPathPreview(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3.5 py-3 mb-3 hover:bg-secondary/60 hover:border-primary/20 transition-all duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-10 w-10 rounded-lg bg-muted/60 flex items-center justify-center shrink-0 group-hover:bg-muted transition-colors">
        {favicon ? (
          <img
            src={favicon}
            alt=""
            className="h-5 w-5"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
            }}
          />
        ) : null}
        <Globe className={`h-4 w-4 text-muted-foreground ${favicon ? "hidden" : ""}`} />
      </div>
      <div className="flex-1 min-w-0">
        {pathTitle && (
          <p className="text-xs font-medium text-card-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {pathTitle}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
          <ExternalLink className="h-2.5 w-2.5 shrink-0" />
          {domain}
        </p>
      </div>
    </a>
  );
});

LinkPreviewCard.displayName = "LinkPreviewCard";
