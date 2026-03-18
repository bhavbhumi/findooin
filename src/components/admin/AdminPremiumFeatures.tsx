/**
 * AdminPremiumFeatures — Full product spec for premium features
 * broken down by role (Investor, Intermediary, Issuer) with tier mapping,
 * business rationale, free vs Pro vs Enterprise limits, and implementation effort.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3, UserCheck, Landmark, Lock, Unlock, Crown, Gem,
  Clock, Zap, TrendingUp, Shield, Search, FileText, Users,
  Megaphone, Globe, Download, LayoutGrid, Eye, MessageSquare,
  Briefcase, Calendar, Star, Target, Database, Sparkles
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type EffortLevel = "low" | "medium" | "high";
type Tier = "free" | "pro" | "enterprise";

interface FeatureSpec {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  rationale: string;
  tier: Tier;
  freeLimits: string;
  proLimits: string;
  enterpriseLimits: string;
  effort: EffortLevel;
  status: "planned" | "in_progress" | "ready" | "shipped";
  revenueImpact: "low" | "medium" | "high";
}

const ROLE_CONFIG = {
  investor: {
    label: "Investor",
    icon: BarChart3,
    color: "hsl(32 75% 48%)",
    bgClass: "bg-amber-500/10 border-amber-500/20",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    description: "Individual & institutional investors, HNIs, family offices",
  },
  intermediary: {
    label: "Intermediary",
    icon: UserCheck,
    color: "hsl(220 65% 50%)",
    bgClass: "bg-blue-500/10 border-blue-500/20",
    badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
    description: "Financial advisors, distributors, brokers, analysts, RIAs",
  },
  issuer: {
    label: "Issuer",
    icon: Landmark,
    color: "hsl(165 50% 40%)",
    bgClass: "bg-teal-500/10 border-teal-500/20",
    badgeClass: "bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30",
    description: "Listed companies, AMCs, insurance companies, NBFCs, fund houses",
  },
} as const;

type RoleKey = keyof typeof ROLE_CONFIG;

const INVESTOR_FEATURES: FeatureSpec[] = [
  {
    name: "Advanced TrustCircle Discovery",
    icon: Search,
    description: "Filter professionals by certification (SEBI/AMFI/CFP), AUM range, specialization, and location with unlimited saved searches.",
    rationale: "Investors' #1 pain point is finding trustworthy advisors. Advanced filters directly solve this and create strong lock-in.",
    tier: "pro",
    freeLimits: "Top 20 results, 3 saved searches, basic role filter only",
    proLimits: "Full 80 results, unlimited saved searches, all filters (certification, AUM, location, specialization)",
    enterpriseLimits: "All Pro features + custom alerts when matching professionals join + priority matching",
    effort: "medium",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Portfolio Watchlist & Alerts",
    icon: Eye,
    description: "Track issuers, monitor corporate actions (dividends, splits, AGMs), and receive push alerts on new research from followed intermediaries.",
    rationale: "Creates daily engagement loop. Investors return to check watchlist, increasing platform stickiness and ad impression potential.",
    tier: "pro",
    freeLimits: "Follow up to 5 issuers, no alerts",
    proLimits: "Unlimited watchlist, email + in-app alerts for corporate actions and new research",
    enterpriseLimits: "All Pro + SMS alerts, API webhooks, custom trigger conditions",
    effort: "high",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Connection Export",
    icon: Download,
    description: "Export network connections as CSV with mutual connection data, roles, and verification status.",
    rationale: "High-value feature for investors managing relationships across platforms. Low effort, high perceived value.",
    tier: "pro",
    freeLimits: "No export capability",
    proLimits: "Monthly CSV export (up to 500 contacts) with basic fields",
    enterpriseLimits: "Unlimited exports, full data fields, API access",
    effort: "low",
    status: "planned",
    revenueImpact: "medium",
  },
  {
    name: "Enhanced Vault Storage",
    icon: FileText,
    description: "Secure document storage for investment documents, KYC records, and shared research reports.",
    rationale: "Document storage has near-zero marginal cost but high perceived value. Natural upsell from free tier limits.",
    tier: "pro",
    freeLimits: "100 MB, 10 files max",
    proLimits: "5 GB, 200 files, shareable links with expiry",
    enterpriseLimits: "50 GB, unlimited files, team sharing, audit trail",
    effort: "low",
    status: "ready",
    revenueImpact: "medium",
  },
  {
    name: "Platform Insights Dashboard",
    icon: TrendingUp,
    description: "Aggregate market trends, popular sectors, trending research topics, and community sentiment on the platform.",
    rationale: "Unique data only FindOO has — platform activity patterns give investors an information edge unavailable elsewhere.",
    tier: "pro",
    freeLimits: "Basic feed stats only",
    proLimits: "Full dashboard: trending sectors, top research, sentiment heatmap, date range selector",
    enterpriseLimits: "All Pro + downloadable reports, custom date ranges, sector deep-dives",
    effort: "medium",
    status: "planned",
    revenueImpact: "medium",
  },
  {
    name: "Priority Event Access",
    icon: Calendar,
    description: "Early registration for high-demand events, webinars, and AMC presentations. Priority seating at in-person events.",
    rationale: "Creates urgency and FOMO. Events are a core engagement driver — gating priority access monetizes existing infrastructure.",
    tier: "pro",
    freeLimits: "Standard registration (first-come basis)",
    proLimits: "48-hour early access, reserved spots for Pro members",
    enterpriseLimits: "Guaranteed seating, private Q&A access, speaker introductions",
    effort: "low",
    status: "planned",
    revenueImpact: "low",
  },
  {
    name: "Scheduled Posts & Content Tools",
    icon: Clock,
    description: "Schedule posts for optimal engagement times. Pro-only post formats: long-form articles and embedded charts.",
    rationale: "Content creation tools increase posting frequency, which drives engagement for all users — network effect multiplier.",
    tier: "pro",
    freeLimits: "Standard posts only, no scheduling",
    proLimits: "Schedule up to 10 posts, long-form articles, chart embeds",
    enterpriseLimits: "Unlimited scheduling, content calendar, team drafting",
    effort: "low",
    status: "ready",
    revenueImpact: "low",
  },
  {
    name: "White-Label Digital Card",
    icon: Star,
    description: "Customizable digital business card with personal branding, custom colors, and QR code with analytics.",
    rationale: "Digital cards are shared externally, acting as viral acquisition tools. Premium customization drives upgrades.",
    tier: "pro",
    freeLimits: "Standard FindOO-branded card",
    proLimits: "Custom colors, tagline, social links, QR scan analytics",
    enterpriseLimits: "Full white-label (remove FindOO branding), custom domain short links",
    effort: "medium",
    status: "planned",
    revenueImpact: "low",
  },
];

const INTERMEDIARY_FEATURES: FeatureSpec[] = [
  {
    name: "Featured Service Listings",
    icon: Sparkles,
    description: "Boost service listings to the top of directory results with a 'Featured' badge. Higher visibility in relevant searches.",
    rationale: "Direct revenue driver. Intermediaries need clients — featured placement provides measurable lead generation ROI.",
    tier: "pro",
    freeLimits: "1 basic service listing, standard ranking",
    proLimits: "5 listings, 'Featured' badge, priority placement in search results, listing analytics",
    enterpriseLimits: "Unlimited listings, category-level sponsorship, competitor benchmarking",
    effort: "medium",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Advanced Analytics & Content Score",
    icon: BarChart3,
    description: "Full post analytics with engagement metrics, audience demographics, Content Score (0-100), and best posting times.",
    rationale: "Intermediaries are power users who publish research/insights. Analytics help them optimize content strategy and demonstrate ROI.",
    tier: "pro",
    freeLimits: "Basic like/comment counts only",
    proLimits: "Full dashboard: Content Score, audience breakdown, network growth, engagement trends, CSV export",
    enterpriseLimits: "All Pro + team analytics, competitive benchmarking, API access",
    effort: "low",
    status: "shipped",
    revenueImpact: "high",
  },
  {
    name: "Unlimited Job Postings",
    icon: Briefcase,
    description: "Post unlimited job listings with advanced candidate filtering, applicant management, and employer branding.",
    rationale: "Intermediary firms are active recruiters. Job posting limits create natural upgrade pressure at hiring time.",
    tier: "pro",
    freeLimits: "3 active job posts, basic applicant view",
    proLimits: "Unlimited posts, advanced filters, applicant notes, employer dashboard",
    enterpriseLimits: "All Pro + ATS integration, bulk posting, team hiring workflows",
    effort: "low",
    status: "ready",
    revenueImpact: "medium",
  },
  {
    name: "Campaign Manager",
    icon: Megaphone,
    description: "Create targeted outreach campaigns to specific investor segments. Track opens, clicks, and conversions.",
    rationale: "Replaces expensive third-party marketing tools. High willingness-to-pay from intermediaries seeking investor clients.",
    tier: "pro",
    freeLimits: "No campaign access",
    proLimits: "5 campaigns/month, segment by role/location/certification, basic analytics",
    enterpriseLimits: "Unlimited campaigns, A/B testing, automation workflows, CRM integration",
    effort: "high",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Lead Capture from Digital Card",
    icon: Target,
    description: "When someone views/saves your digital card, capture their details as a lead with CRM-style pipeline tracking.",
    rationale: "Converts passive card shares into actionable sales pipeline. Unique value prop not available on generic networking platforms.",
    tier: "pro",
    freeLimits: "See who viewed your card (count only)",
    proLimits: "Full viewer details, lead pipeline (New → Contacted → Converted), export leads",
    enterpriseLimits: "All Pro + team lead assignment, automated follow-up reminders, API webhooks",
    effort: "medium",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Certification Badge Verification",
    icon: Shield,
    description: "Verified certification badges (SEBI RIA, AMFI ARN, CFP, CFA) displayed prominently on profile and listings.",
    rationale: "Trust signal that directly impacts business. Intermediaries pay for credibility — verified badges provide concrete professional value.",
    tier: "pro",
    freeLimits: "Self-declared certifications (no badge)",
    proLimits: "Verified badge after document submission, priority in certification-filtered searches",
    enterpriseLimits: "All Pro + auto-renewal tracking, regulatory compliance dashboard",
    effort: "medium",
    status: "planned",
    revenueImpact: "medium",
  },
  {
    name: "Bulk Digital Cards for Team",
    icon: Users,
    description: "Create and manage digital cards for entire team. Consistent branding, centralized analytics, team directory.",
    rationale: "Enterprise feature that scales revenue per account. Firms with 10+ advisors become high-value accounts.",
    tier: "enterprise",
    freeLimits: "1 personal card only",
    proLimits: "1 personal card with custom branding",
    enterpriseLimits: "Unlimited team cards, org branding, centralized admin, team QR directory",
    effort: "high",
    status: "planned",
    revenueImpact: "medium",
  },
  {
    name: "Scheduled Posts & Research Notes",
    icon: Clock,
    description: "Schedule research publications, create 'Research Note' post type with disclaimers, and track reader engagement.",
    rationale: "Research publishing is core workflow. Scheduling + analytics make FindOO a professional publishing platform, replacing newsletters.",
    tier: "pro",
    freeLimits: "Standard posts only, no scheduling",
    proLimits: "Schedule 20 posts, Research Note format, auto-disclaimer insertion, reader analytics",
    enterpriseLimits: "Unlimited scheduling, team content calendar, compliance review workflow",
    effort: "low",
    status: "ready",
    revenueImpact: "medium",
  },
];

const ISSUER_FEATURES: FeatureSpec[] = [
  {
    name: "Advanced IR Portal",
    icon: Landmark,
    description: "Full Investor Relations portal: financials (Revenue, PAT, Margins), shareholding trends, credit ratings, corporate actions timeline.",
    rationale: "IR is a mandatory function for listed companies. Replacing expensive IR website platforms with FindOO's integrated solution is a strong value prop.",
    tier: "pro",
    freeLimits: "Basic company snapshot (name, BSE/NSE codes, sector)",
    proLimits: "Full financials, shareholding charts, corporate actions, credit ratings, AGM calendar",
    enterpriseLimits: "All Pro + analyst coverage aggregation, investor targeting, IR analytics dashboard",
    effort: "high",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Featured Product Listings",
    icon: Sparkles,
    description: "Promote financial products (MF schemes, bonds, insurance) with featured placement, comparison badges, and promoted search results.",
    rationale: "Direct product distribution channel. Issuers pay for visibility in front of intermediaries who distribute their products.",
    tier: "pro",
    freeLimits: "1 basic product listing, standard ranking",
    proLimits: "10 listings, 'Featured' badge, category sponsorship, listing analytics with lead tracking",
    enterpriseLimits: "Unlimited listings, homepage placement, custom landing pages, A/B testing",
    effort: "medium",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Analyst Coverage Aggregation",
    icon: MessageSquare,
    description: "Auto-aggregate research posts from intermediaries/analysts who tag your company. See what the market is saying about you.",
    rationale: "Unique network-effect feature. Leverages user-generated content to create enterprise value — no competitor offers this.",
    tier: "pro",
    freeLimits: "No analyst coverage view",
    proLimits: "View all tagged research, sentiment summary, top analysts covering you",
    enterpriseLimits: "All Pro + analyst engagement tools, request coverage, analyst relations CRM",
    effort: "medium",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Investor Targeting & Campaigns",
    icon: Target,
    description: "Target campaigns to investors by AUM, location, investment preference, and certification. Track engagement and conversion.",
    rationale: "Replaces roadshow logistics for NFOs and new product launches. Dramatically reduces customer acquisition cost for issuers.",
    tier: "enterprise",
    freeLimits: "No campaign access",
    proLimits: "3 campaigns/month to broad segments",
    enterpriseLimits: "Unlimited campaigns, granular targeting, A/B testing, conversion attribution",
    effort: "high",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Corporate Event Management",
    icon: Calendar,
    description: "Host AGMs, earnings calls, and investor meets with registration management, speaker profiles, and post-event analytics.",
    rationale: "Corporate events are compliance requirements. Integrated event hosting with built-in investor audience is uniquely valuable.",
    tier: "pro",
    freeLimits: "Basic events, 50 attendee cap",
    proLimits: "500 attendees, speaker management, branded event pages, post-event analytics",
    enterpriseLimits: "Unlimited capacity, virtual integration, recording/replay, compliance reporting",
    effort: "medium",
    status: "planned",
    revenueImpact: "medium",
  },
  {
    name: "Org Profile & Team Seats",
    icon: Users,
    description: "Unified company profile with multiple team members. Separate IR, Marketing, and Compliance roles with granular permissions.",
    rationale: "Enterprise accounts generate 5-10x more revenue than individual. Team seats create organizational lock-in.",
    tier: "enterprise",
    freeLimits: "Single user profile only",
    proLimits: "Company profile with 1 admin",
    enterpriseLimits: "Up to 25 team seats, role-based access (IR, Marketing, Compliance), activity audit trail",
    effort: "high",
    status: "planned",
    revenueImpact: "high",
  },
  {
    name: "Compliance & Regulatory Dashboard",
    icon: Shield,
    description: "Track regulatory filings, SEBI compliance deadlines, and automate disclosure reminders. Audit trail for all communications.",
    rationale: "Compliance is non-negotiable for issuers. A dedicated dashboard differentiates FindOO from generic networking platforms.",
    tier: "enterprise",
    freeLimits: "No compliance tools",
    proLimits: "Basic filing reminders",
    enterpriseLimits: "Full dashboard: deadline tracker, disclosure templates, audit trail, team compliance workflows",
    effort: "high",
    status: "planned",
    revenueImpact: "medium",
  },
  {
    name: "API & Data Export",
    icon: Database,
    description: "Programmatic access to listings, event registrations, analytics, and IR data. Integrate with existing CRM/ERP systems.",
    rationale: "Enterprise buyer requirement. API access justifies premium pricing and enables deep system integration.",
    tier: "enterprise",
    freeLimits: "No API access",
    proLimits: "Read-only API (listings, events)",
    enterpriseLimits: "Full CRUD API, webhooks, bulk data export, SSO integration",
    effort: "high",
    status: "planned",
    revenueImpact: "medium",
  },
];

const EFFORT_CONFIG: Record<EffortLevel, { label: string; color: string; days: string }> = {
  low: { label: "Low", color: "bg-green-500", days: "1-3 days" },
  medium: { label: "Medium", color: "bg-amber-500", days: "1-2 weeks" },
  high: { label: "High", color: "bg-red-500", days: "2-4 weeks" },
};

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  planned: { label: "Planned", variant: "outline" },
  in_progress: { label: "In Progress", variant: "secondary" },
  ready: { label: "Ready to Gate", variant: "default" },
  shipped: { label: "Shipped", variant: "default" },
};

const IMPACT_BAR: Record<string, number> = { low: 33, medium: 66, high: 100 };

function FeatureCard({ feature }: { feature: FeatureSpec }) {
  const effort = EFFORT_CONFIG[feature.effort];
  const status = STATUS_CONFIG[feature.status];
  const Icon = feature.icon;

  return (
    <Card className="border border-border/60 hover:border-border transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold leading-tight">{feature.name}</CardTitle>
              <div className="flex items-center gap-1.5 mt-1">
                <Badge variant={status.variant} className="text-[10px] h-4 px-1.5">
                  {status.label}
                </Badge>
                <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize">
                  {feature.tier === "pro" ? (
                    <><Crown className="h-2.5 w-2.5 mr-0.5" /> Pro</>
                  ) : (
                    <><Gem className="h-2.5 w-2.5 mr-0.5" /> Enterprise</>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <CardDescription className="text-xs mt-2 leading-relaxed">
          {feature.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Business Rationale */}
        <div className="bg-muted/50 rounded-md p-2.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Why build this</p>
          <p className="text-xs text-foreground/80 leading-relaxed">{feature.rationale}</p>
        </div>

        {/* Tier Comparison */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Tier limits</p>
          <div className="grid gap-1.5">
            <div className="flex items-start gap-2 text-xs">
              <Unlock className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
              <div><span className="font-medium text-muted-foreground">Free:</span> {feature.freeLimits}</div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <Crown className="h-3 w-3 mt-0.5 text-amber-500 shrink-0" />
              <div><span className="font-medium text-amber-600 dark:text-amber-400">Pro:</span> {feature.proLimits}</div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <Gem className="h-3 w-3 mt-0.5 text-purple-500 shrink-0" />
              <div><span className="font-medium text-purple-600 dark:text-purple-400">Enterprise:</span> {feature.enterpriseLimits}</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Effort & Impact */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground mb-1">Effort ({effort.days})</p>
            <div className="flex items-center gap-1.5">
              <div className={`h-1.5 w-1.5 rounded-full ${effort.color}`} />
              <span className="text-xs font-medium">{effort.label}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-muted-foreground mb-1">Revenue Impact</p>
            <Progress value={IMPACT_BAR[feature.revenueImpact]} className="h-1.5" />
            <span className="text-[10px] text-muted-foreground capitalize mt-0.5 block">{feature.revenueImpact}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RoleSummary({ role, features }: { role: RoleKey; features: FeatureSpec[] }) {
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;
  const proCount = features.filter(f => f.tier === "pro").length;
  const entCount = features.filter(f => f.tier === "enterprise").length;
  const readyCount = features.filter(f => f.status === "ready" || f.status === "shipped").length;
  const highImpact = features.filter(f => f.revenueImpact === "high").length;

  return (
    <div className={`rounded-xl border p-4 ${config.bgClass}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${config.color} / 0.15` }}>
          <Icon className="h-5 w-5" style={{ color: config.color }} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">{config.label}</h3>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="text-center p-2 rounded-lg bg-background/60">
          <p className="text-lg font-bold">{features.length}</p>
          <p className="text-[10px] text-muted-foreground">Total Features</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-background/60">
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{proCount}</p>
          <p className="text-[10px] text-muted-foreground">Pro Tier</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-background/60">
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{entCount}</p>
          <p className="text-[10px] text-muted-foreground">Enterprise</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-background/60">
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{readyCount}</p>
          <p className="text-[10px] text-muted-foreground">Ready / Shipped</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Zap className="h-3 w-3 text-amber-500" />
        <span>{highImpact} high-revenue-impact features identified</span>
      </div>
    </div>
  );
}

export function AdminPremiumFeatures() {
  const [activeRole, setActiveRole] = useState<RoleKey>("investor");

  const ROLE_FEATURES: Record<RoleKey, FeatureSpec[]> = {
    investor: INVESTOR_FEATURES,
    intermediary: INTERMEDIARY_FEATURES,
    issuer: ISSUER_FEATURES,
  };

  const allFeatures = [...INVESTOR_FEATURES, ...INTERMEDIARY_FEATURES, ...ISSUER_FEATURES];
  const totalPro = allFeatures.filter(f => f.tier === "pro").length;
  const totalEnt = allFeatures.filter(f => f.tier === "enterprise").length;
  const totalReady = allFeatures.filter(f => f.status === "ready" || f.status === "shipped").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">Premium Features Spec</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Role-by-role breakdown of monetizable features with tier mapping, business rationale, and implementation effort.
        </p>
      </div>

      {/* Global Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold">{allFeatures.length}</p>
          <p className="text-xs text-muted-foreground">Total Features</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalPro}</p>
          <p className="text-xs text-muted-foreground">Pro Features</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalEnt}</p>
          <p className="text-xs text-muted-foreground">Enterprise Features</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalReady}</p>
          <p className="text-xs text-muted-foreground">Ready to Ship</p>
        </Card>
      </div>

      {/* Role Tabs */}
      <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as RoleKey)}>
        <TabsList className="w-full grid grid-cols-3">
          {(Object.keys(ROLE_CONFIG) as RoleKey[]).map((role) => {
            const config = ROLE_CONFIG[role];
            const RoleIcon = config.icon;
            return (
              <TabsTrigger key={role} value={role} className="gap-1.5 text-xs">
                <RoleIcon className="h-3.5 w-3.5" />
                {config.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(ROLE_CONFIG) as RoleKey[]).map((role) => (
          <TabsContent key={role} value={role} className="space-y-4 mt-4">
            <RoleSummary role={role} features={ROLE_FEATURES[role]} />

            {/* Pro Features */}
            {ROLE_FEATURES[role].filter(f => f.tier === "pro").length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-semibold">Pro Tier Features</h2>
                  <Badge variant="outline" className="text-[10px]">
                    {ROLE_FEATURES[role].filter(f => f.tier === "pro").length} features
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLE_FEATURES[role].filter(f => f.tier === "pro").map((feature) => (
                    <FeatureCard key={feature.name} feature={feature} />
                  ))}
                </div>
              </div>
            )}

            {/* Enterprise Features */}
            {ROLE_FEATURES[role].filter(f => f.tier === "enterprise").length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Gem className="h-4 w-4 text-purple-500" />
                  <h2 className="text-sm font-semibold">Enterprise Tier Features</h2>
                  <Badge variant="outline" className="text-[10px]">
                    {ROLE_FEATURES[role].filter(f => f.tier === "enterprise").length} features
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLE_FEATURES[role].filter(f => f.tier === "enterprise").map((feature) => (
                    <FeatureCard key={feature.name} feature={feature} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
