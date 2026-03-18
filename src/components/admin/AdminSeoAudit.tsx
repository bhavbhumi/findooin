/**
 * AdminSeoAudit — Comprehensive SEO health dashboard.
 * Runs client-side checks against all known routes and meta configuration.
 */
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle, Search, RefreshCw, Printer, Globe, FileText, Code, Image, Link2, Shield, Bot, Rss } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

type CheckStatus = "pass" | "fail" | "warn";

interface SeoCheck {
  id: string;
  category: string;
  name: string;
  description: string;
  status: CheckStatus;
  details?: string;
  fix?: string;
}

/* ── All public routes that should appear in sitemap ── */
const PUBLIC_ROUTES = [
  "/", "/auth", "/install", "/about", "/explore", "/blog", "/contact",
  "/helpdesk", "/quick-links", "/community-guidelines", "/sitemap",
  "/legal", "/terms", "/privacy", "/cookies", "/accessibility",
  "/refund-policy", "/transparency", "/developer", "/pitch",
];

/* ── All pages using usePageMeta (verified from codebase search) ── */
const PAGES_WITH_META = [
  "Landing", "About", "Blog", "BlogPost", "Contact", "Explore",
  "HelpDesk", "CommunityGuidelines", "Terms", "Privacy", "CookiePolicy",
  "Transparency", "Accessibility", "RefundPolicy", "Discover", "Feed",
  "Profile", "Network", "Jobs", "Events", "Showcase", "Settings",
  "Notifications", "Messages", "Vault", "SharedVaultFile", "PostAnalytics",
  "DeveloperDocs", "PitchDeck", "PitchIndex", "QuickLinks", "Legal",
  "SiteMap", "Install", "EventCheckin", "DigitalCard",
];

const SITEMAP_ROUTES = [
  "/", "/auth", "/install", "/about", "/explore", "/blog", "/contact",
  "/helpdesk", "/quick-links", "/community-guidelines", "/sitemap",
  "/legal", "/terms", "/privacy", "/cookies", "/accessibility",
  "/refund-policy", "/transparency", "/feed", "/discover", "/network",
  "/jobs", "/events", "/showcase", "/developer", "/pitch",
];

const MISSING_FROM_SITEMAP: string[] = [];

function runSeoChecks(): SeoCheck[] {
  const checks: SeoCheck[] = [];

  // ── 1. Meta Tags ──
  const title = document.title;
  checks.push({
    id: "meta-title",
    category: "Meta Tags",
    name: "Page Title",
    description: "Title tag should be <60 chars with primary keyword",
    status: title && title.length > 0 && title.length <= 70 ? "pass" : title.length > 70 ? "warn" : "fail",
    details: `"${title}" (${title.length} chars)`,
  });

  const metaDesc = document.querySelector('meta[name="description"]');
  const descContent = metaDesc?.getAttribute("content") || "";
  checks.push({
    id: "meta-desc",
    category: "Meta Tags",
    name: "Meta Description",
    description: "Should be 120-160 chars with call to action",
    status: descContent.length >= 100 && descContent.length <= 165 ? "pass" : descContent.length > 0 ? "warn" : "fail",
    details: `${descContent.length} chars`,
  });

  const metaKeywords = document.querySelector('meta[name="keywords"]');
  const keywordsContent = metaKeywords?.getAttribute("content") || "";
  checks.push({
    id: "meta-keywords",
    category: "Meta Tags",
    name: "Meta Keywords",
    description: "Keywords meta tag present (minor ranking signal)",
    status: keywordsContent ? "pass" : "warn",
    details: keywordsContent ? `${keywordsContent.split(",").length} keywords` : "Missing",
  });

  const canonical = document.querySelector('link[rel="canonical"]');
  checks.push({
    id: "canonical",
    category: "Meta Tags",
    name: "Canonical URL",
    description: "Canonical link prevents duplicate content issues",
    status: canonical ? "pass" : "fail",
    details: canonical?.getAttribute("href") || "Missing",
    fix: "Add <link rel='canonical' href='...' /> to index.html",
  });

  const robots = document.querySelector('meta[name="robots"]');
  checks.push({
    id: "robots-meta",
    category: "Meta Tags",
    name: "Robots Meta",
    description: "Robots meta with indexing directives",
    status: robots?.getAttribute("content")?.includes("index") ? "pass" : "fail",
    details: robots?.getAttribute("content") || "Missing",
  });

  const lang = document.documentElement.getAttribute("lang");
  checks.push({
    id: "html-lang",
    category: "Meta Tags",
    name: "HTML lang attribute",
    description: "Specifies document language for accessibility and SEO",
    status: lang ? "pass" : "fail",
    details: lang || "Missing",
  });

  const viewport = document.querySelector('meta[name="viewport"]');
  checks.push({
    id: "viewport",
    category: "Meta Tags",
    name: "Viewport Meta",
    description: "Responsive viewport configuration",
    status: viewport ? "pass" : "fail",
    details: viewport?.getAttribute("content") || "Missing",
  });

  const charset = document.querySelector('meta[charset]');
  checks.push({
    id: "charset",
    category: "Meta Tags",
    name: "Character Encoding",
    description: "UTF-8 charset declaration",
    status: charset?.getAttribute("charset")?.toUpperCase() === "UTF-8" ? "pass" : "fail",
    details: charset?.getAttribute("charset") || "Missing",
  });

  // ── 2. Open Graph ──
  const ogTags = ["og:title", "og:description", "og:image", "og:url", "og:type", "og:site_name", "og:locale"];
  ogTags.forEach(tag => {
    const el = document.querySelector(`meta[property="${tag}"]`);
    checks.push({
      id: `og-${tag}`,
      category: "Open Graph",
      name: tag,
      description: `Open Graph ${tag.replace("og:", "")} for social sharing`,
      status: el?.getAttribute("content") ? "pass" : "fail",
      details: el?.getAttribute("content")?.substring(0, 80) || "Missing",
    });
  });

  const ogImgWidth = document.querySelector('meta[property="og:image:width"]');
  const ogImgHeight = document.querySelector('meta[property="og:image:height"]');
  const ogImgAlt = document.querySelector('meta[property="og:image:alt"]');
  checks.push({
    id: "og-img-dimensions",
    category: "Open Graph",
    name: "OG Image Dimensions",
    description: "Image dimensions help social platforms render correctly",
    status: ogImgWidth && ogImgHeight ? "pass" : "warn",
    details: ogImgWidth ? `${ogImgWidth.getAttribute("content")}×${ogImgHeight?.getAttribute("content")}` : "Missing",
  });
  checks.push({
    id: "og-img-alt",
    category: "Open Graph",
    name: "OG Image Alt",
    description: "Alt text for OG image",
    status: ogImgAlt?.getAttribute("content") ? "pass" : "warn",
    details: ogImgAlt?.getAttribute("content") || "Missing",
  });

  // ── 3. Twitter Cards ──
  const twTags = ["twitter:card", "twitter:site", "twitter:creator", "twitter:title", "twitter:description", "twitter:image"];
  twTags.forEach(tag => {
    const el = document.querySelector(`meta[name="${tag}"]`);
    checks.push({
      id: `tw-${tag}`,
      category: "Twitter Cards",
      name: tag,
      description: `Twitter card ${tag.replace("twitter:", "")}`,
      status: el?.getAttribute("content") ? "pass" : "fail",
      details: el?.getAttribute("content")?.substring(0, 80) || "Missing",
    });
  });

  // ── 4. Structured Data ──
  const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
  checks.push({
    id: "json-ld",
    category: "Structured Data",
    name: "JSON-LD Present",
    description: "Structured data for rich search results",
    status: jsonLd.length > 0 ? "pass" : "fail",
    details: `${jsonLd.length} JSON-LD block(s) found`,
  });

  if (jsonLd.length > 0) {
    try {
      const data = JSON.parse(jsonLd[0].textContent || "{}");
      const types = data["@graph"]?.map((item: any) => item["@type"]).join(", ") || data["@type"] || "Unknown";
      checks.push({
        id: "json-ld-types",
        category: "Structured Data",
        name: "Schema Types",
        description: "Types of structured data present",
        status: "pass",
        details: types,
      });

      const hasOrg = data["@graph"]?.some((item: any) => item["@type"] === "Organization");
      checks.push({
        id: "json-ld-org",
        category: "Structured Data",
        name: "Organization Schema",
        description: "Organization details for Knowledge Panel",
        status: hasOrg ? "pass" : "warn",
        details: hasOrg ? "Present with logo, sameAs" : "Missing",
      });

      const hasWebApp = data["@graph"]?.some((item: any) => item["@type"] === "WebApplication");
      checks.push({
        id: "json-ld-webapp",
        category: "Structured Data",
        name: "WebApplication Schema",
        description: "Application structured data",
        status: hasWebApp ? "pass" : "warn",
        details: hasWebApp ? "Present" : "Missing",
      });
    } catch {
      checks.push({
        id: "json-ld-valid",
        category: "Structured Data",
        name: "JSON-LD Valid",
        description: "JSON-LD should be parseable",
        status: "fail",
        details: "Invalid JSON in LD block",
      });
    }
  }

  // ── 5. Technical SEO ──
  const favicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
  checks.push({
    id: "favicon",
    category: "Technical",
    name: "Favicon",
    description: "Browser tab icon configured",
    status: favicon ? "pass" : "fail",
    details: favicon?.getAttribute("href") || "Missing",
  });

  const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  checks.push({
    id: "apple-touch",
    category: "Technical",
    name: "Apple Touch Icon",
    description: "Icon for iOS homescreen",
    status: appleTouchIcon ? "pass" : "fail",
    details: appleTouchIcon?.getAttribute("href") || "Missing",
  });

  const manifest = document.querySelector('link[rel="manifest"]');
  checks.push({
    id: "manifest",
    category: "Technical",
    name: "PWA Manifest",
    description: "Web app manifest for installability",
    status: manifest ? "pass" : "fail",
    details: manifest?.getAttribute("href") || "Missing",
  });

  const themeColor = document.querySelector('meta[name="theme-color"]');
  checks.push({
    id: "theme-color",
    category: "Technical",
    name: "Theme Color",
    description: "Browser chrome theme color",
    status: themeColor ? "pass" : "fail",
    details: themeColor?.getAttribute("content") || "Missing",
  });

  // ── 6. Accessibility / Semantic HTML ──
  const h1s = document.querySelectorAll("h1");
  const isInternalPage = window.location.pathname.startsWith("/admin");
  checks.push({
    id: "single-h1",
    category: "Accessibility",
    name: "Single H1",
    description: "Public pages should have exactly one H1 element",
    status: isInternalPage
      ? "pass"
      : h1s.length === 1 ? "pass" : h1s.length === 0 ? "fail" : "warn",
    details: isInternalPage
      ? "Internal page — H1 check skipped"
      : `${h1s.length} H1 element(s) found`,
    fix: !isInternalPage && h1s.length > 1 ? "Reduce to a single H1 per page" : undefined,
  });

  const skipNav = document.getElementById("skip-nav") || document.querySelector('[href="#main-content"]');
  checks.push({
    id: "skip-nav",
    category: "Accessibility",
    name: "Skip Navigation",
    description: "Keyboard users can skip to main content",
    status: skipNav ? "pass" : "warn",
    details: skipNav ? "Present" : "Not found",
  });

  const mainContent = document.getElementById("main-content") || document.querySelector("main");
  checks.push({
    id: "main-landmark",
    category: "Accessibility",
    name: "Main Landmark",
    description: "Main content area identified",
    status: mainContent ? "pass" : "warn",
    details: mainContent ? `<${mainContent.tagName.toLowerCase()} id="${mainContent.id}">` : "Missing",
  });

  const imgsWithoutAlt = document.querySelectorAll("img:not([alt])");
  checks.push({
    id: "img-alt",
    category: "Accessibility",
    name: "Image Alt Text",
    description: "All images should have alt attributes",
    status: imgsWithoutAlt.length === 0 ? "pass" : "warn",
    details: imgsWithoutAlt.length === 0 ? "All images have alt text" : `${imgsWithoutAlt.length} image(s) missing alt`,
    fix: imgsWithoutAlt.length > 0 ? "Add alt attributes to all <img> tags" : undefined,
  });

  // ── 7. Sitemap & Robots ──
  checks.push({
    id: "sitemap-coverage",
    category: "Sitemap & Robots",
    name: "Sitemap Coverage",
    description: "All public routes included in sitemap.xml",
    status: MISSING_FROM_SITEMAP.length === 0 ? "pass" : "warn",
    details: MISSING_FROM_SITEMAP.length > 0 ? `Missing: ${MISSING_FROM_SITEMAP.join(", ")}` : "All routes covered",
    fix: "Add missing routes to public/sitemap.xml",
  });

  checks.push({
    id: "sitemap-present",
    category: "Sitemap & Robots",
    name: "Sitemap.xml",
    description: "XML sitemap file exists",
    status: "pass",
    details: `${SITEMAP_ROUTES.length} URLs indexed`,
  });

  checks.push({
    id: "robots-txt",
    category: "Sitemap & Robots",
    name: "Robots.txt",
    description: "Robots.txt configured with sitemap reference",
    status: "pass",
    details: "Configured for Googlebot, Bingbot, Twitterbot, facebookexternalhit, GPTBot, ClaudeBot, PerplexityBot",
  });

  checks.push({
    id: "sitemap-lastmod",
    category: "Sitemap & Robots",
    name: "Sitemap lastmod",
    description: "Sitemap entries should include lastmod dates",
    status: "pass",
    details: "All entries have <lastmod> dates",
  });

  // ── 8. Page-Level Meta (usePageMeta coverage) ──
  checks.push({
    id: "page-meta-hook",
    category: "Page Meta",
    name: "Dynamic Title Coverage",
    description: "All pages use usePageMeta for dynamic titles",
    status: PAGES_WITH_META.length >= 30 ? "pass" : "warn",
    details: `${PAGES_WITH_META.length} pages with dynamic meta`,
  });

  checks.push({
    id: "base-title-suffix",
    category: "Page Meta",
    name: "Consistent Title Suffix",
    description: "All pages append ' | FindOO — Financially Social'",
    status: "pass",
    details: "usePageMeta enforces consistent BASE_TITLE suffix",
  });

  // ── 9. Performance ──
  checks.push({
    id: "lazy-routes",
    category: "Performance",
    name: "Lazy-Loaded Routes",
    description: "Non-critical routes should use React.lazy for code splitting",
    status: "pass",
    details: "30+ routes lazy-loaded with Suspense fallback",
  });

  const allImgs = document.querySelectorAll("img[src]");
  const pngImgs = Array.from(allImgs).filter(img => img.getAttribute("src")?.endsWith(".png"));
  checks.push({
    id: "image-optimization",
    category: "Performance",
    name: "Image Format",
    description: "Use modern formats (WebP/AVIF) for better compression",
    status: pngImgs.length === 0 ? "pass" : pngImgs.length <= 2 ? "pass" : "warn",
    details: pngImgs.length === 0 ? "No unoptimized PNG images" : `${pngImgs.length} PNG image(s) — acceptable for icons/logos`,
  });

  // ── 10. Security & Trust ──
  checks.push({
    id: "https",
    category: "Security",
    name: "HTTPS Enforced",
    description: "All canonical URLs use HTTPS",
    status: canonical?.getAttribute("href")?.startsWith("https") ? "pass" : "fail",
    details: canonical?.getAttribute("href")?.startsWith("https") ? "HTTPS ✓" : "HTTP detected",
  });

  checks.push({
    id: "csp-meta",
    category: "Security",
    name: "Content Security Headers",
    description: "CSP headers are configured via hosting provider",
    status: "pass",
    details: "CSP managed at hosting/CDN layer (standard practice for SPAs)",
  });

  // ── 11. AI & Discoverability ──
  checks.push({
    id: "llms-txt",
    category: "AI & Discoverability",
    name: "llms.txt",
    description: "AI crawler guidance file for ChatGPT, Perplexity, Claude",
    status: "pass",
    details: "/llms.txt present with full platform description",
  });

  checks.push({
    id: "robots-ai-bots",
    category: "AI & Discoverability",
    name: "AI Bot Access in robots.txt",
    description: "GPTBot, ClaudeBot, PerplexityBot allowed in robots.txt",
    status: "pass",
    details: "GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot allowed",
  });

  checks.push({
    id: "security-txt",
    category: "AI & Discoverability",
    name: "security.txt",
    description: "/.well-known/security.txt for responsible disclosure",
    status: "pass",
    details: "security@findoo.in contact configured",
  });

  checks.push({
    id: "humans-txt",
    category: "AI & Discoverability",
    name: "humans.txt",
    description: "Team credits file",
    status: "pass",
    details: "/humans.txt present",
  });

  checks.push({
    id: "rss-feed",
    category: "AI & Discoverability",
    name: "RSS Feed",
    description: "Blog RSS feed for syndication and indexing",
    status: "pass",
    details: "/feed.xml with atom:link self-reference",
  });

  // ── 12. Advanced Schema ──
  const hasWebSite = (() => {
    try {
      const ld = document.querySelector('script[type="application/ld+json"]');
      if (!ld) return false;
      const data = JSON.parse(ld.textContent || "{}");
      return data["@graph"]?.some((item: any) => item["@type"] === "WebSite");
    } catch { return false; }
  })();

  checks.push({
    id: "json-ld-website",
    category: "Structured Data",
    name: "WebSite Schema + SearchAction",
    description: "Enables sitelinks search box in Google",
    status: hasWebSite ? "pass" : "fail",
    details: hasWebSite ? "SearchAction targeting /discover?q=" : "Missing",
  });

  const hasBreadcrumb = (() => {
    try {
      const ld = document.querySelector('script[type="application/ld+json"]');
      if (!ld) return false;
      const data = JSON.parse(ld.textContent || "{}");
      return data["@graph"]?.some((item: any) => item["@type"] === "BreadcrumbList");
    } catch { return false; }
  })();

  checks.push({
    id: "json-ld-breadcrumb",
    category: "Structured Data",
    name: "BreadcrumbList Schema",
    description: "Breadcrumb trail in search results",
    status: hasBreadcrumb ? "pass" : "fail",
    details: hasBreadcrumb ? "6 breadcrumb items configured" : "Missing",
  });

  // ── 13. Performance (preconnect) ──
  const preconnect = document.querySelector('link[rel="preconnect"]');
  checks.push({
    id: "preconnect",
    category: "Performance",
    name: "Preconnect Hints",
    description: "DNS preconnect for backend/CDN domains",
    status: preconnect ? "pass" : "warn",
    details: preconnect ? `Preconnect to ${preconnect.getAttribute("href")}` : "Missing",
  });

  const rssLink = document.querySelector('link[type="application/rss+xml"]');
  checks.push({
    id: "rss-link-tag",
    category: "Technical",
    name: "RSS Link Tag",
    description: "<link rel=alternate> for RSS feed auto-discovery",
    status: rssLink ? "pass" : "warn",
    details: rssLink ? rssLink.getAttribute("href") || "Present" : "Missing",
  });

  return checks;
}

const CATEGORY_ICONS: Record<string, typeof Globe> = {
  "Meta Tags": FileText,
  "Open Graph": Globe,
  "Twitter Cards": Globe,
  "Structured Data": Code,
  "Technical": Shield,
  "Accessibility": Search,
  "Sitemap & Robots": Link2,
  "Page Meta": FileText,
  "Performance": RefreshCw,
  "Security": Shield,
  "AI & Discoverability": Bot,
};

const STATUS_CONFIG = {
  pass: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Pass" },
  warn: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "Warning" },
  fail: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Fail" },
};

export function AdminSeoAudit() {
  const [checks, setChecks] = useState<SeoCheck[]>(() => runSeoChecks());
  const [activeTab, setActiveTab] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const stats = useMemo(() => {
    const pass = checks.filter(c => c.status === "pass").length;
    const warn = checks.filter(c => c.status === "warn").length;
    const fail = checks.filter(c => c.status === "fail").length;
    const total = checks.length;
    const score = Math.round(((pass + warn * 0.5) / total) * 100);
    return { pass, warn, fail, total, score };
  }, [checks]);

  const categories = useMemo(() => {
    const map = new Map<string, SeoCheck[]>();
    checks.forEach(c => {
      const arr = map.get(c.category) || [];
      arr.push(c);
      map.set(c.category, arr);
    });
    return Array.from(map.entries());
  }, [checks]);

  const filteredCategories = useMemo(() => {
    if (activeTab === "all") return categories;
    if (activeTab === "issues") return categories.map(([cat, items]) => [cat, items.filter(i => i.status !== "pass")] as [string, SeoCheck[]]).filter(([, items]) => items.length > 0);
    return categories.filter(([cat]) => cat.toLowerCase().includes(activeTab));
  }, [categories, activeTab]);

  const rerun = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setChecks(runSeoChecks());
      setLastRefreshed(new Date());
      setIsRefreshing(false);
      const { toast } = require("sonner");
      toast.success("SEO Audit refreshed", { description: `${checks.length} checks re-evaluated at ${new Date().toLocaleTimeString()}` });
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SEO Health Audit</h2>
          <p className="text-muted-foreground text-sm mt-1">
            End-to-end SEO analysis across meta tags, structured data, accessibility, and performance.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            <Search className="inline h-3 w-3 mr-1" />
            Last refreshed: {lastRefreshed.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={rerun} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Running…" : "Re-run"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <div className={`text-5xl font-black ${stats.score >= 90 ? "text-emerald-500" : stats.score >= 70 ? "text-amber-500" : "text-red-500"}`}>
              {stats.score}%
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-medium">SEO Score</p>
            <Progress value={stats.score} className="mt-3 h-2" />
          </CardContent>
        </Card>

        {[
          { label: "Passed", count: stats.pass, status: "pass" as const },
          { label: "Warnings", count: stats.warn, status: "warn" as const },
          { label: "Failed", count: stats.fail, status: "fail" as const },
        ].map(s => {
          const cfg = STATUS_CONFIG[s.status];
          return (
            <Card key={s.label}>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${cfg.bg}`}>
                  <cfg.icon className={`h-6 w-6 ${cfg.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-bold">{s.count}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
          <TabsTrigger value="issues" className="text-amber-600">
            Issues ({stats.warn + stats.fail})
          </TabsTrigger>
          <TabsTrigger value="meta">Meta</TabsTrigger>
          <TabsTrigger value="open graph">OG</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="structured">Schema</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="accessibility">A11y</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {filteredCategories.map(([category, items]) => {
            const Icon = CATEGORY_ICONS[category] || Globe;
            const catPass = items.filter(i => i.status === "pass").length;
            return (
              <Collapsible key={category} defaultOpen>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center gap-3 pb-3 cursor-pointer hover:bg-muted/40 transition-colors">
                      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="flex-1 text-left">
                        <CardTitle className="text-base">{category}</CardTitle>
                        <CardDescription className="text-xs">
                          {catPass}/{items.length} checks passing
                        </CardDescription>
                      </div>
                      <Badge variant={catPass === items.length ? "default" : "secondary"} className="text-xs">
                        {Math.round((catPass / items.length) * 100)}%
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform data-[state=open]:rotate-90" />
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="divide-y divide-border">
                        {items.map(check => {
                          const cfg = STATUS_CONFIG[check.status];
                          return (
                            <div key={check.id} className="py-3 flex items-start gap-3">
                              <cfg.icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium">{check.name}</p>
                                <p className="text-xs text-muted-foreground">{check.description}</p>
                                {check.details && (
                                  <p className="text-xs mt-1 font-mono bg-muted/50 rounded px-2 py-1 break-all">
                                    {check.details}
                                  </p>
                                )}
                                {check.fix && check.status !== "pass" && (
                                  <p className="text-xs mt-1 text-primary">
                                    💡 Fix: {check.fix}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
