/**
 * AdminModuleAudit — Comprehensive module-wise audit report across
 * Website (public), App (authenticated), and Admin Panel viewports.
 * Tracks: Desired Scope, Completed, Incomplete, Not Yet Started.
 */
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Download, Printer, CheckCircle2, AlertTriangle, XCircle, Clock,
  Globe, Smartphone, Shield, ChevronDown, ChevronUp
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type ItemStatus = "completed" | "incomplete" | "not_started";

type AuditItem = {
  feature: string;
  scope: string;
  status: ItemStatus;
  note?: string;
};

type AuditModule = {
  name: string;
  items: AuditItem[];
};

const STATUS_META: Record<ItemStatus, { label: string; icon: typeof CheckCircle2; color: string; badge: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "Completed", icon: CheckCircle2, color: "text-emerald-500", badge: "default" },
  incomplete: { label: "Incomplete", icon: AlertTriangle, color: "text-amber-500", badge: "secondary" },
  not_started: { label: "Not Started", icon: XCircle, color: "text-destructive", badge: "destructive" },
};

// ─── WEBSITE (Public Pages) ───
const WEBSITE_MODULES: AuditModule[] = [
  {
    name: "Landing Page",
    items: [
      { feature: "Hero section with CTA", scope: "Cosmic network visualization, value props, CTA buttons", status: "completed" },
      { feature: "Why FindOO section", scope: "Feature highlights with animated cards", status: "completed" },
      { feature: "Testimonials carousel", scope: "User testimonials with auto-rotation", status: "completed" },
      { feature: "Value proposition section", scope: "Role-based value cards (Issuer, Intermediary, Investor)", status: "completed" },
      { feature: "SEO meta tags & JSON-LD", scope: "Title, description, OG tags, structured data", status: "incomplete", note: "OG tags present; JSON-LD not yet added" },
    ],
  },
  {
    name: "About",
    items: [
      { feature: "Company tab", scope: "Mission, vision, team overview", status: "completed" },
      { feature: "Career tab", scope: "Open positions and culture", status: "completed" },
      { feature: "Press tab", scope: "Media coverage and press kit", status: "completed" },
    ],
  },
  {
    name: "Explore",
    items: [
      { feature: "What is FindOO tab", scope: "Platform explanation", status: "completed" },
      { feature: "Why it exists tab", scope: "Problem statement", status: "completed" },
      { feature: "How it works tab", scope: "Step-by-step user journey", status: "completed" },
      { feature: "Who is it for tab", scope: "Target audience roles", status: "completed" },
    ],
  },
  {
    name: "Blog",
    items: [
      { feature: "Articles listing", scope: "Paginated blog posts with categories", status: "completed" },
      { feature: "Survey posts", scope: "Interactive surveys embedded in blog", status: "completed" },
      { feature: "Poll posts", scope: "Quick polls with real-time results", status: "completed" },
      { feature: "Bulletin posts", scope: "Short announcements", status: "completed" },
      { feature: "Blog detail page", scope: "Full post with sidebar widgets", status: "completed" },
    ],
  },
  {
    name: "Contact",
    items: [
      { feature: "Ask Us form", scope: "Contact form with categories", status: "completed" },
      { feature: "Visit Us tab", scope: "Office address with Google Maps embed", status: "completed" },
    ],
  },
  {
    name: "Legal & Compliance",
    items: [
      { feature: "Terms of Service", scope: "Full ToS with BFSI-specific clauses", status: "completed" },
      { feature: "Privacy Policy", scope: "DPDPA-compliant privacy policy", status: "completed" },
      { feature: "Cookie Policy", scope: "Standalone cookie consent page", status: "completed" },
      { feature: "Accessibility Statement", scope: "WCAG 2.1 commitment", status: "completed" },
      { feature: "Refund Policy", scope: "Subscription refund terms", status: "completed" },
      { feature: "Transparency Report", scope: "Content moderation statistics", status: "completed" },
      { feature: "Community Guidelines", scope: "Behavioral rules + FAQ", status: "completed" },
      { feature: "Legal hub", scope: "Centralized links to all legal pages", status: "completed" },
      { feature: "Legal entity details", scope: "Real CIN, address, officer names", status: "incomplete", note: "Placeholder data — needs real entity info" },
    ],
  },
  {
    name: "Auth & Onboarding",
    items: [
      { feature: "Sign up (email+password)", scope: "Registration with email verification", status: "completed" },
      { feature: "Sign in", scope: "Login with error handling", status: "completed" },
      { feature: "Password reset", scope: "Email-based reset flow", status: "completed" },
      { feature: "Google OAuth", scope: "SSO with Google", status: "incomplete", note: "Platform-supported; needs OAuth credentials configured" },
      { feature: "Onboarding wizard", scope: "Role selection, profile setup, specializations", status: "completed" },
      { feature: "Custom auth email templates", scope: "Branded verification/reset emails", status: "not_started", note: "Requires custom email domain first" },
    ],
  },
  {
    name: "Utility Pages",
    items: [
      { feature: "Quick Links", scope: "Comprehensive navigation grid", status: "completed" },
      { feature: "Sitemap page", scope: "Full sitemap for users", status: "completed" },
      { feature: "Help Desk", scope: "Searchable support articles", status: "completed" },
      { feature: "Install (PWA)", scope: "PWA install instructions", status: "completed" },
      { feature: "Developer Docs", scope: "API reference documentation", status: "completed" },
      { feature: "Cost Report", scope: "Infrastructure cost breakdown", status: "completed" },
      { feature: "Scaling Report", scope: "Scaling roadmap documentation", status: "completed" },
      { feature: "Pitch Decks", scope: "Persona-based pitch presentations", status: "completed" },
      { feature: "404 Page", scope: "Custom not-found page", status: "completed" },
    ],
  },
];

// ─── APP (Authenticated Features) ───
const APP_MODULES: AuditModule[] = [
  {
    name: "Feed",
    items: [
      { feature: "Post creation (text, article, commentary, etc.)", scope: "Multi-type post composer with attachments", status: "completed" },
      { feature: "Poll creation", scope: "In-feed polls with vote tracking", status: "completed" },
      { feature: "Survey creation", scope: "Multi-question surveys", status: "completed" },
      { feature: "Post interactions (like, share, bookmark, report)", scope: "Full interaction suite with counters", status: "completed" },
      { feature: "Comment section", scope: "Threaded comments on posts", status: "completed" },
      { feature: "Feed tabs (For You, Following, etc.)", scope: "Multiple feed filters", status: "completed" },
      { feature: "Trending sidebar", scope: "Trending hashtags and posts", status: "completed" },
      { feature: "Draft posts", scope: "Save and resume post drafts", status: "completed" },
      { feature: "Scheduled posts", scope: "Schedule posts for future publishing", status: "completed" },
      { feature: "Post analytics", scope: "Detailed metrics per post", status: "completed" },
      { feature: "Visibility controls", scope: "Public, network, connections, private", status: "completed" },
      { feature: "Mention users", scope: "@mention with autocomplete", status: "completed" },
      { feature: "Hashtag support", scope: "Auto-detect and link hashtags", status: "completed" },
    ],
  },
  {
    name: "Profile",
    items: [
      { feature: "Profile header (avatar, banner, headline)", scope: "Full profile header with edit capability", status: "completed" },
      { feature: "About section", scope: "Bio, specializations, certifications, languages", status: "completed" },
      { feature: "Experience section", scope: "Work history with CRUD", status: "completed" },
      { feature: "Education section", scope: "Education history with CRUD", status: "completed" },
      { feature: "Publications section", scope: "Research papers, articles listing", status: "completed" },
      { feature: "Endorsements", scope: "Skill endorsements from connections", status: "completed" },
      { feature: "Recommendations", scope: "Written recommendations", status: "completed" },
      { feature: "Featured content", scope: "Pin posts to profile", status: "completed" },
      { feature: "Activity timeline / heatmap", scope: "Contribution activity visualization", status: "completed" },
      { feature: "Profile completeness ring", scope: "Visual completeness indicator", status: "completed" },
      { feature: "Trust score badge", scope: "Verification-based trust indicator", status: "completed" },
      { feature: "Profile analytics", scope: "Views, search appearances, engagement", status: "completed" },
      { feature: "People also viewed", scope: "Similar profile suggestions", status: "completed" },
      { feature: "Mutual connections", scope: "Shared connections display", status: "completed" },
      { feature: "Digital card tab", scope: "vCard with QR code, share, download", status: "completed" },
      { feature: "Listings tab", scope: "User's directory listings on profile", status: "completed" },
      { feature: "Vault tab", scope: "Document vault integrated in profile", status: "completed" },
      { feature: "Role management dialog", scope: "Add/switch user roles", status: "completed" },
      { feature: "IR Tab (Investor Relations)", scope: "Dedicated tab for Issuers showing financials, filings, shareholding", status: "not_started", note: "Designed (docs/ir-tab-design.md) — not yet wired into profile" },
    ],
  },
  {
    name: "Network",
    items: [
      { feature: "Connections list", scope: "View all connections with search/filter", status: "completed" },
      { feature: "Pending requests", scope: "Accept/reject connection requests", status: "completed" },
      { feature: "Follow/Unfollow", scope: "One-way follow system", status: "completed" },
      { feature: "Connect/Disconnect", scope: "Two-way connection system", status: "completed" },
      { feature: "Invite dialog", scope: "Invite non-platform users", status: "completed" },
      { feature: "Network sidebar", scope: "Network stats and suggestions", status: "completed" },
    ],
  },
  {
    name: "Discover",
    items: [
      { feature: "People discovery", scope: "Browse and search users by role, location, specialization", status: "completed" },
      { feature: "Discover sidebar", scope: "Quick filters and stats", status: "completed" },
    ],
  },
  {
    name: "Messaging",
    items: [
      { feature: "Conversation list", scope: "Inbox with message preview", status: "completed" },
      { feature: "Message thread", scope: "Real-time chat with read receipts", status: "completed" },
      { feature: "Message categories", scope: "General, Sales, Ops, Support, Complaint", status: "completed" },
      { feature: "Realtime updates", scope: "Live message delivery via websockets", status: "completed" },
    ],
  },
  {
    name: "Notifications",
    items: [
      { feature: "Notification center", scope: "All notifications with read/unread state", status: "completed" },
      { feature: "Notification types", scope: "Like, comment, connection, follow, etc.", status: "completed" },
      { feature: "Mark all as read", scope: "Bulk read action", status: "completed" },
    ],
  },
  {
    name: "Jobs Board",
    items: [
      { feature: "Job listing with filters", scope: "Browse jobs by category, type, location, salary", status: "completed" },
      { feature: "Post job dialog", scope: "Full job posting form", status: "completed" },
      { feature: "Job detail sheet", scope: "Full job details in side panel", status: "completed" },
      { feature: "Apply to job", scope: "Application with cover note and resume", status: "completed" },
      { feature: "My applications panel", scope: "Track application statuses", status: "completed" },
      { feature: "Employer dashboard", scope: "View applicants, manage pipeline", status: "completed" },
      { feature: "Candidate dashboard", scope: "Application tracking for job seekers", status: "completed" },
      { feature: "Saved jobs", scope: "Bookmark jobs for later", status: "completed" },
      { feature: "Role-based posting restrictions", scope: "Only Issuer/Intermediary/Admin can post", status: "completed" },
    ],
  },
  {
    name: "Events",
    items: [
      { feature: "Event listing with filters", scope: "Browse events by category, mode, date", status: "completed" },
      { feature: "Create event dialog", scope: "Full event creation form", status: "completed" },
      { feature: "Event detail sheet", scope: "Full event details with registration", status: "completed" },
      { feature: "Event registration", scope: "Register/cancel with capacity tracking", status: "completed" },
      { feature: "Organizer dashboard", scope: "Manage attendees, export list", status: "completed" },
      { feature: "Event speakers", scope: "Add/manage speakers per event", status: "completed" },
      { feature: "Event check-in (QR)", scope: "QR-based check-in for physical events", status: "completed" },
      { feature: "Role-based event creation", scope: "Only Issuer/Intermediary/Admin can create", status: "completed" },
    ],
  },
  {
    name: "Directory (Marketplace)",
    items: [
      { feature: "Listing browse with filters", scope: "Products and services with category filters", status: "completed" },
      { feature: "Create listing dialog", scope: "Full listing creation form", status: "completed" },
      { feature: "Listing detail sheet", scope: "Full listing details with enquiry", status: "completed" },
      { feature: "Listing comparison", scope: "Compare multiple listings side by side", status: "completed" },
      { feature: "Reviews & ratings", scope: "User reviews with star ratings", status: "completed" },
      { feature: "Enquiry system", scope: "Send enquiries to listing owners", status: "completed" },
      { feature: "Role-based restrictions", scope: "Issuer=Products, Intermediary=Services, Investor=Browse", status: "completed" },
    ],
  },
  {
    name: "Vault (Document Store)",
    items: [
      { feature: "File upload", scope: "Upload documents with metadata", status: "completed" },
      { feature: "File categorization", scope: "Organize by category and tags", status: "completed" },
      { feature: "File sharing (token-based)", scope: "Generate shareable links", status: "completed" },
      { feature: "Shared file viewer", scope: "Public page for shared files", status: "completed" },
      { feature: "Profile vault tab", scope: "Vault integrated in user profile", status: "completed" },
    ],
  },
  {
    name: "Digital Card",
    items: [
      { feature: "Digital business card", scope: "vCard generation with QR code", status: "completed" },
      { feature: "Card customization", scope: "Choose fields to display", status: "completed" },
      { feature: "Lead capture dashboard", scope: "Track who viewed/saved your card", status: "completed" },
      { feature: "Card exchange tracking", scope: "Log card views and saves", status: "completed" },
    ],
  },
  {
    name: "Settings",
    items: [
      { feature: "Notification preferences", scope: "Toggle notification types", status: "completed" },
      { feature: "Privacy settings", scope: "Profile visibility, show email/phone", status: "completed" },
      { feature: "Session management", scope: "View/revoke active sessions", status: "completed" },
      { feature: "Account settings", scope: "Email, password management", status: "completed" },
    ],
  },
  {
    name: "Platform UX",
    items: [
      { feature: "Responsive design", scope: "Mobile, tablet, desktop breakpoints", status: "completed" },
      { feature: "Dark/Light theme", scope: "System-aware theme with toggle", status: "completed" },
      { feature: "Command palette (⌘K)", scope: "Quick navigation and search", status: "completed" },
      { feature: "Skeleton loaders", scope: "Loading states for all data pages", status: "completed" },
      { feature: "Empty state illustrations", scope: "Meaningful empty states", status: "completed" },
      { feature: "Page transitions", scope: "Framer Motion transitions", status: "completed" },
      { feature: "Breadcrumbs", scope: "Contextual navigation breadcrumbs", status: "completed" },
      { feature: "Error boundaries", scope: "Graceful error handling at route level", status: "completed" },
      { feature: "Offline detection", scope: "Toast when network drops", status: "completed" },
      { feature: "Splash screen", scope: "Branded loading screen", status: "completed" },
    ],
  },
  {
    name: "Monetization",
    items: [
      { feature: "Stripe integration", scope: "Subscription billing (Free/Pro/Enterprise)", status: "not_started", note: "Phase 2B — needs Stripe connector" },
      { feature: "Plan gating", scope: "Feature restrictions by plan tier", status: "not_started", note: "Depends on Stripe integration" },
      { feature: "Usage metering", scope: "Track API/storage usage per user", status: "not_started" },
    ],
  },
];

// ─── ADMIN PANEL ───
const ADMIN_MODULES: AuditModule[] = [
  {
    name: "Dashboard Overview",
    items: [
      { feature: "Metric cards with sparklines", scope: "Users, posts, jobs, events counts", status: "completed" },
      { feature: "Growth charts", scope: "Daily growth bar charts", status: "completed" },
      { feature: "Verification funnel", scope: "Donut chart of verification statuses", status: "completed" },
      { feature: "Date range filtering", scope: "7d, 14d, 30d interactive filter", status: "completed" },
      { feature: "CSV data exports", scope: "Export users, verifications, reports", status: "completed" },
      { feature: "Printable PDF summary", scope: "Stakeholder-ready print layout", status: "completed" },
    ],
  },
  {
    name: "User Management",
    items: [
      { feature: "User listing with search", scope: "Browse all users with filters", status: "completed" },
      { feature: "Role assignment", scope: "Assign/remove roles per user", status: "completed" },
      { feature: "User detail view", scope: "View full user profile and activity", status: "completed" },
    ],
  },
  {
    name: "Verification Queue",
    items: [
      { feature: "Pending verification list", scope: "Review submitted verification documents", status: "completed" },
      { feature: "Approve/Reject with notes", scope: "Admin decision workflow", status: "completed" },
      { feature: "Verification request form", scope: "User-facing form to submit docs", status: "completed" },
      { feature: "Auto-verification (SEBI/RBI)", scope: "API-based registration lookup", status: "not_started", note: "Phase 5 — requires regulatory API access" },
    ],
  },
  {
    name: "Content Moderation",
    items: [
      { feature: "Report queue", scope: "View and act on user reports", status: "completed" },
      { feature: "Post removal", scope: "Admin can delete reported posts", status: "completed" },
      { feature: "Report resolution", scope: "Mark reports as resolved/dismissed", status: "completed" },
    ],
  },
  {
    name: "Audit Log",
    items: [
      { feature: "Action log viewer", scope: "Browse all admin/system actions", status: "completed" },
      { feature: "Filter by action/user/date", scope: "Searchable audit trail", status: "completed" },
    ],
  },
  {
    name: "Invitations Pipeline",
    items: [
      { feature: "Create invite", scope: "Invite users by email/phone", status: "completed" },
      { feature: "Bulk import", scope: "CSV bulk invitation upload", status: "completed" },
      { feature: "Registry import", scope: "Import from registry entities", status: "completed" },
      { feature: "Pipeline tracking", scope: "Track invitation statuses (active, converted, etc.)", status: "completed" },
      { feature: "Reminder scheduling", scope: "Auto-reminder system", status: "completed" },
    ],
  },
  {
    name: "Registry",
    items: [
      { feature: "Entity listing", scope: "Browse imported registry entities", status: "completed" },
      { feature: "Entity matching", scope: "Match registry entities to platform users", status: "completed" },
      { feature: "AMFI scraper", scope: "Edge function to scrape AMFI registry", status: "completed" },
    ],
  },
  {
    name: "Sales Pipeline",
    items: [
      { feature: "Lead management", scope: "Track sales leads with stages", status: "completed" },
      { feature: "Lead sources", scope: "Track origin (registry, referral, organic)", status: "completed" },
      { feature: "Priority assignment", scope: "High/medium/low lead priority", status: "completed" },
    ],
  },
  {
    name: "Campaigns",
    items: [
      { feature: "Campaign creation", scope: "Email/notification campaigns", status: "completed" },
      { feature: "Campaign analytics", scope: "Open, click, conversion tracking", status: "completed" },
      { feature: "Campaign execution", scope: "Actually sending emails", status: "incomplete", note: "UI ready; needs email service integration" },
    ],
  },
  {
    name: "Blog Management",
    items: [
      { feature: "CRUD blog posts", scope: "Create, edit, delete, publish articles", status: "completed" },
      { feature: "Survey/Poll management", scope: "Create interactive blog content", status: "completed" },
      { feature: "Featured posts", scope: "Mark posts as featured", status: "completed" },
    ],
  },
  {
    name: "Monitoring & Infrastructure",
    items: [
      { feature: "System health dashboard", scope: "Active sessions, DB load, storage usage", status: "completed" },
      { feature: "Error tracking", scope: "Client-side error capture and display", status: "completed" },
      { feature: "Scaling recommendations", scope: "Dynamic infra recommendations", status: "completed" },
      { feature: "Project health scorecard", scope: "7-dimension project maturity scoring", status: "completed" },
    ],
  },
  {
    name: "Support",
    items: [
      { feature: "Support ticket queue", scope: "View and manage user tickets", status: "completed" },
      { feature: "Ticket assignment", scope: "Assign tickets to team members", status: "completed" },
    ],
  },
  {
    name: "Billing & Features",
    items: [
      { feature: "Billing dashboard", scope: "Revenue overview and subscription management", status: "incomplete", note: "UI placeholder; needs Stripe data" },
      { feature: "Feature flags", scope: "Toggle platform features", status: "incomplete", note: "UI placeholder; needs implementation" },
      { feature: "Notification broadcasts", scope: "Send platform-wide notifications", status: "incomplete", note: "UI ready; backend dispatch pending" },
    ],
  },
];

function getModuleStats(modules: AuditModule[]) {
  let completed = 0, incomplete = 0, not_started = 0, total = 0;
  modules.forEach(m => m.items.forEach(i => {
    total++;
    if (i.status === "completed") completed++;
    else if (i.status === "incomplete") incomplete++;
    else not_started++;
  }));
  return { completed, incomplete, not_started, total, pct: total ? Math.round((completed / total) * 100) : 0 };
}

function ModuleCard({ mod, defaultOpen = false }: { mod: AuditModule; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const stats = useMemo(() => {
    const c = mod.items.filter(i => i.status === "completed").length;
    const inc = mod.items.filter(i => i.status === "incomplete").length;
    const ns = mod.items.filter(i => i.status === "not_started").length;
    return { c, inc, ns, total: mod.items.length, pct: Math.round((c / mod.items.length) * 100) };
  }, [mod]);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{mod.name}</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-emerald-500 font-medium">{stats.c}</span>
                  {stats.inc > 0 && <span className="text-amber-500 font-medium">/ {stats.inc}</span>}
                  {stats.ns > 0 && <span className="text-destructive font-medium">/ {stats.ns}</span>}
                </div>
                <Progress value={stats.pct} className="h-1.5 w-16" />
                {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-2 font-medium">Feature</th>
                    <th className="text-left p-2 font-medium hidden sm:table-cell">Desired Scope</th>
                    <th className="text-center p-2 font-medium w-24">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mod.items.map((item, i) => {
                    const meta = STATUS_META[item.status];
                    const Icon = meta.icon;
                    return (
                      <tr key={i} className="border-t border-border/50">
                        <td className="p-2">
                          <div>
                            <span className="font-medium">{item.feature}</span>
                            <span className="sm:hidden block text-[10px] text-muted-foreground mt-0.5">{item.scope}</span>
                            {item.note && <p className="text-[10px] text-muted-foreground mt-0.5 italic">{item.note}</p>}
                          </div>
                        </td>
                        <td className="p-2 text-muted-foreground hidden sm:table-cell">{item.scope}</td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                            <span className={`text-[10px] ${meta.color} font-medium hidden sm:inline`}>{meta.label}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function SectionSummary({ label, icon: Icon, modules }: { label: string; icon: typeof Globe; modules: AuditModule[] }) {
  const stats = useMemo(() => getModuleStats(modules), [modules]);
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{label}</h3>
          <Badge variant={stats.pct >= 90 ? "default" : stats.pct >= 70 ? "secondary" : "destructive"} className="text-[10px]">
            {stats.pct}%
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
          <span>{stats.completed} done</span>
          <span>{stats.incomplete} partial</span>
          <span>{stats.not_started} pending</span>
          <span className="font-medium">({stats.total} total)</span>
        </div>
        <Progress value={stats.pct} className="h-1 mt-1.5" />
      </div>
    </div>
  );
}

function generateCSV(modules: AuditModule[], section: string): string {
  let csv = "Section,Module,Feature,Desired Scope,Status,Notes\n";
  modules.forEach(mod => {
    mod.items.forEach(item => {
      csv += `"${section}","${mod.name}","${item.feature}","${item.scope}","${item.status}","${item.note || ""}"\n`;
    });
  });
  return csv;
}

export function AdminModuleAudit() {
  const allModules = [...WEBSITE_MODULES, ...APP_MODULES, ...ADMIN_MODULES];
  const overall = useMemo(() => getModuleStats(allModules), []);

  const handleDownload = () => {
    const websiteCSV = generateCSV(WEBSITE_MODULES, "Website");
    const appCSV = generateCSV(APP_MODULES, "App");
    const adminCSV = generateCSV(ADMIN_MODULES, "Admin Panel");
    const header = "Section,Module,Feature,Desired Scope,Status,Notes\n";
    const fullCSV = header +
      websiteCSV.split("\n").slice(1).join("\n") +
      appCSV.split("\n").slice(1).join("\n") +
      adminCSV.split("\n").slice(1).join("\n");

    const blob = new Blob([fullCSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `findoo-module-audit-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">Module Audit Report</h2>
          <p className="text-sm text-muted-foreground">
            End-to-end feature audit · {overall.total} features across {allModules.length} modules
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      {/* Overall Summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-muted" />
                <circle cx="60" cy="60" r="52" fill="none" strokeWidth="8" className="stroke-primary"
                  strokeDasharray={`${overall.pct * 3.27} 327`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{overall.pct}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <SectionSummary label="Website" icon={Globe} modules={WEBSITE_MODULES} />
                <SectionSummary label="App" icon={Smartphone} modules={APP_MODULES} />
                <SectionSummary label="Admin" icon={Shield} modules={ADMIN_MODULES} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="website" className="print:hidden">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="website" className="gap-1.5 text-xs">
            <Globe className="h-3.5 w-3.5" /> Website
          </TabsTrigger>
          <TabsTrigger value="app" className="gap-1.5 text-xs">
            <Smartphone className="h-3.5 w-3.5" /> App
          </TabsTrigger>
          <TabsTrigger value="admin" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" /> Admin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="website" className="space-y-3 mt-4">
          {WEBSITE_MODULES.map(mod => <ModuleCard key={mod.name} mod={mod} />)}
        </TabsContent>
        <TabsContent value="app" className="space-y-3 mt-4">
          {APP_MODULES.map(mod => <ModuleCard key={mod.name} mod={mod} />)}
        </TabsContent>
        <TabsContent value="admin" className="space-y-3 mt-4">
          {ADMIN_MODULES.map(mod => <ModuleCard key={mod.name} mod={mod} />)}
        </TabsContent>
      </Tabs>

      {/* Print: show all */}
      <div className="hidden print:block space-y-4">
        <h2 className="text-base font-bold">Website (Public Pages)</h2>
        {WEBSITE_MODULES.map(mod => <ModuleCard key={mod.name} mod={mod} defaultOpen />)}
        <h2 className="text-base font-bold mt-6">App (Authenticated)</h2>
        {APP_MODULES.map(mod => <ModuleCard key={mod.name} mod={mod} defaultOpen />)}
        <h2 className="text-base font-bold mt-6">Admin Panel</h2>
        {ADMIN_MODULES.map(mod => <ModuleCard key={mod.name} mod={mod} defaultOpen />)}
      </div>

      {/* Footer */}
      <p className="text-[10px] text-muted-foreground text-center print:mt-8">
        Generated {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · FindOO Module Audit v1.0
      </p>
    </div>
  );
}
