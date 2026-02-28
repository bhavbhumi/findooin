import {
  Shield, Users, Eye, Lightbulb, BarChart3, Globe, Lock, Landmark,
  UserCheck, CheckCircle, FileText, Bell, Calendar, Award, Briefcase,
  Search, TrendingUp, Target, Zap, MessageSquare, Building2,
  CreditCard, FolderOpen, ArrowRight, Settings, AlertTriangle,
  Scale, Handshake, Layers, Database, BookOpen, Package
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface SlidePoint {
  icon: LucideIcon;
  title: string;
  desc: string;
}

export interface SlideStat {
  value: string;
  label: string;
  sub?: string;
}

export interface SlideStep {
  num: number;
  title: string;
  desc: string;
}

export interface SlideComparison {
  feature: string;
  others: boolean;
  findoo: boolean;
}

export interface PitchSlide {
  id: string;
  template: "cover" | "problem" | "solution" | "features" | "stats" | "steps" | "highlight" | "cta";
  title: string;
  subtitle?: string;
  badge?: string;
  points?: SlidePoint[];
  stats?: SlideStat[];
  steps?: SlideStep[];
  comparison?: SlideComparison[];
  comparisonLabel?: string;
  highlightTitle?: string;
  highlightPoints?: string[];
  ctaText?: string;
  ctaLink?: string;
  ctaSub?: string;
}

export interface PitchDeckData {
  persona: string;
  slug: string;
  tagline: string;
  description: string;
  colorHsl: string;
  icon: LucideIcon;
  slides: PitchSlide[];
}

/* ════════════════════════════════════════════════════
   REGULATOR DECK
   ════════════════════════════════════════════════════ */
const regulatorSlides: PitchSlide[] = [
  {
    id: "reg-1",
    template: "cover",
    title: "Strengthening India's Financial Ecosystem",
    subtitle: "A verified network built within India's regulatory framework — where compliance is not a feature, it's the foundation.",
    badge: "For Regulators & Policy Makers",
  },
  {
    id: "reg-2",
    template: "problem",
    title: "The Unregulated Digital Landscape",
    subtitle: "India's financial ecosystem faces a growing digital trust crisis.",
    points: [
      { icon: AlertTriangle, title: "Unverified Advice", desc: "Financial tips spread unchecked on social media — no credential verification, no accountability." },
      { icon: Users, title: "Fragmented Networks", desc: "44,000+ AMFI distributors and 50,000+ SEBI intermediaries operate in isolated silos — WhatsApp groups, closed forums." },
      { icon: Eye, title: "Investor Vulnerability", desc: "10Cr+ demat account holders have no reliable way to verify if an advisor is genuinely registered." },
    ],
  },
  {
    id: "reg-3",
    template: "solution",
    title: "FindOO: Compliance by Design",
    subtitle: "Every interaction on FindOO is anchored to verified regulatory credentials.",
    points: [
      { icon: Shield, title: "Identity Verification", desc: "Every professional verified against SEBI, AMFI, IRDAI, RBI, and PFRDA databases." },
      { icon: Database, title: "Full Audit Trail", desc: "Every post, connection, and interaction is logged with tamper-proof audit records." },
      { icon: Scale, title: "Content Governance", desc: "Automated moderation aligned with financial regulatory standards and community guidelines." },
      { icon: Lock, title: "Role-Based Access", desc: "Issuers, intermediaries, and investors see role-appropriate features — no cross-contamination." },
    ],
  },
  {
    id: "reg-4",
    template: "features",
    title: "Built-In Regulatory Infrastructure",
    subtitle: "The tools regulators need to oversee a healthy digital financial ecosystem.",
    points: [
      { icon: Shield, title: "Credential Engine", desc: "Multi-regulator verification with badge system visible across the network" },
      { icon: FileText, title: "Audit Logs", desc: "Complete activity trail — posts, connections, reports — accessible to administrators" },
      { icon: AlertTriangle, title: "Report System", desc: "Community-driven flagging with admin review queue and resolution tracking" },
      { icon: Users, title: "User Governance", desc: "Admin dashboard for user management, content moderation, and verification queues" },
      { icon: Lock, title: "Data Protection", desc: "Row-level security, encrypted sessions, and privacy-first architecture" },
      { icon: BarChart3, title: "Platform Analytics", desc: "Real-time visibility into ecosystem health, user behavior, and compliance metrics" },
    ],
  },
  {
    id: "reg-5",
    template: "stats",
    title: "India's Financial Ecosystem in Numbers",
    subtitle: "The scale of the opportunity FindOO addresses.",
    stats: [
      { value: "50,000+", label: "SEBI Intermediaries", sub: "Registered professionals" },
      { value: "44,000+", label: "AMFI Distributors", sub: "ARN holders nationwide" },
      { value: "10Cr+", label: "Demat Accounts", sub: "Retail investor base" },
      { value: "5", label: "Regulators Integrated", sub: "SEBI, AMFI, IRDAI, RBI, PFRDA" },
    ],
  },
  {
    id: "reg-6",
    template: "steps",
    title: "How Regulators Benefit",
    subtitle: "A verified network creates a healthier ecosystem for everyone.",
    steps: [
      { num: 1, title: "Ecosystem Visibility", desc: "See how professionals interact, share insights, and build networks — in real time." },
      { num: 2, title: "Reduced Misinformation", desc: "Verified identities and moderated content eliminate anonymous financial tips." },
      { num: 3, title: "Faster Fraud Detection", desc: "Community reporting + audit trails enable proactive identification of bad actors." },
      { num: 4, title: "Digital Infrastructure", desc: "A compliance-ready platform that can integrate with regulatory APIs and databases." },
    ],
  },
  {
    id: "reg-7",
    template: "highlight",
    title: "Regulatory API Integration Roadmap",
    subtitle: "FindOO is building direct integrations with India's financial regulators.",
    highlightTitle: "Planned Integrations",
    highlightPoints: [
      "SEBI Registration Number Lookup — automated verification of intermediary credentials",
      "AMFI ARN Validation — real-time check against the AMFI distributor database",
      "IRDAI License Verification — insurance agent and broker credential checks",
      "RBI Registered Entity Search — NBFC and bank verification",
      "PFRDA POP Verification — pension fund distributor validation",
    ],
  },
  {
    id: "reg-8",
    template: "cta",
    title: "Let's Build a Safer Financial Ecosystem — Together",
    subtitle: "FindOO is open to regulatory partnerships, API integrations, and collaborative frameworks that protect India's investors.",
    ctaText: "Partner with FindOO",
    ctaLink: "/contact",
    ctaSub: "Reach out to discuss regulatory collaboration and ecosystem integration.",
  },
];

/* ════════════════════════════════════════════════════
   ISSUER DECK
   ════════════════════════════════════════════════════ */
const issuerSlides: PitchSlide[] = [
  {
    id: "iss-1",
    template: "cover",
    title: "Reach India's Verified Distribution Network",
    subtitle: "Showcase your products to credential-checked intermediaries and informed investors — on the only platform built for regulated finance.",
    badge: "For AMCs, Insurance Companies & NBFCs",
  },
  {
    id: "iss-2",
    template: "problem",
    title: "Distribution Challenges in 2024",
    subtitle: "Traditional distribution channels are fragmented, expensive, and opaque.",
    points: [
      { icon: Users, title: "Fragmented Channels", desc: "Distributors scattered across WhatsApp, email, and physical meets — no centralized reach." },
      { icon: Eye, title: "Unverified Networks", desc: "No way to confirm if the intermediary promoting your product is actually AMFI/SEBI registered." },
      { icon: BarChart3, title: "Zero Engagement Data", desc: "Traditional distribution offers no visibility into who viewed, shared, or inquired about your products." },
    ],
  },
  {
    id: "iss-3",
    template: "solution",
    title: "FindOO Product Directory",
    subtitle: "A marketplace where every viewer is a verified financial professional.",
    points: [
      { icon: Package, title: "Product Showcase", desc: "List mutual funds, insurance, PMS, AIF, bonds, FDs, NPS, and IPO/NFO products with rich detail." },
      { icon: Target, title: "Verified Audience", desc: "Every intermediary on FindOO is credential-checked — your products reach genuine distributors." },
      { icon: BarChart3, title: "Real-Time Analytics", desc: "Track views, enquiries, bookmarks, and engagement metrics for every listing." },
      { icon: Handshake, title: "Direct Lead Capture", desc: "Intermediaries can enquire directly — no middlemen, no cold calls." },
    ],
  },
  {
    id: "iss-4",
    template: "features",
    title: "Everything an Issuer Needs",
    subtitle: "Purpose-built tools for product issuers in India's financial ecosystem.",
    points: [
      { icon: Package, title: "Product Listings", desc: "9 product categories with detailed specs, highlights, and risk profiles" },
      { icon: BarChart3, title: "Analytics Dashboard", desc: "Views, enquiries, and engagement metrics updated in real time" },
      { icon: Calendar, title: "Event Management", desc: "Host NFO launches, investor meets, and earnings calls with registration tracking" },
      { icon: MessageSquare, title: "Content Feed", desc: "Publish research notes, market commentary, and announcements to verified professionals" },
      { icon: Shield, title: "Brand Verification", desc: "Verified issuer badge builds trust across all your content and listings" },
      { icon: Bell, title: "Smart Notifications", desc: "Get notified when intermediaries enquire, save, or share your products" },
    ],
  },
  {
    id: "iss-5",
    template: "stats",
    title: "The Distribution Opportunity",
    subtitle: "India's financial distribution network is massive — and FindOO connects you to it.",
    stats: [
      { value: "44,000+", label: "AMFI Distributors", sub: "Verified ARN holders" },
      { value: "9", label: "Product Categories", sub: "MF, Insurance, PMS, AIF..." },
      { value: "₹0", label: "Listing Cost", sub: "Free to list products" },
      { value: "100%", label: "Verified Audience", sub: "Every user credential-checked" },
    ],
  },
  {
    id: "iss-6",
    template: "steps",
    title: "How It Works for Issuers",
    subtitle: "From listing to lead capture — a seamless workflow.",
    steps: [
      { num: 1, title: "Create Your Profile", desc: "Sign up as an Issuer and verify your entity credentials." },
      { num: 2, title: "List Your Products", desc: "Add products with category, risk level, returns info, and highlights." },
      { num: 3, title: "Get Discovered", desc: "Verified intermediaries browse, compare, and shortlist your products." },
      { num: 4, title: "Capture Leads", desc: "Receive direct enquiries and track engagement analytics." },
    ],
  },
  {
    id: "iss-7",
    template: "highlight",
    title: "Why FindOO Over LinkedIn or WhatsApp?",
    subtitle: "A purpose-built platform vs. generic social tools.",
    comparison: [
      { feature: "Verified Financial Professionals", others: false, findoo: true },
      { feature: "Product Directory with Categories", others: false, findoo: true },
      { feature: "Lead Capture & Enquiry System", others: false, findoo: true },
      { feature: "Real-Time Engagement Analytics", others: false, findoo: true },
      { feature: "BFSI-Specific Content Feed", others: false, findoo: true },
      { feature: "Event Management for NFO/IPO", others: false, findoo: true },
    ],
    comparisonLabel: "LinkedIn / WhatsApp",
  },
  {
    id: "iss-8",
    template: "cta",
    title: "Start Reaching Verified Intermediaries Today",
    subtitle: "List your first product in under 5 minutes. No listing fees. No contracts.",
    ctaText: "List Your Products",
    ctaLink: "/auth?mode=signup",
    ctaSub: "Free to join. Free to list. Start building your verified distribution network.",
  },
];

/* ════════════════════════════════════════════════════
   INTERMEDIARY DECK
   ════════════════════════════════════════════════════ */
const intermediarySlides: PitchSlide[] = [
  {
    id: "int-1",
    template: "cover",
    title: "Your Professional Financial Network",
    subtitle: "Connect with verified peers. Discover products. Share knowledge. Grow your practice — on the only network built for financial intermediaries.",
    badge: "For MFDs, RIAs, Insurance Agents & Advisors",
  },
  {
    id: "int-2",
    template: "problem",
    title: "The Intermediary's Challenge",
    subtitle: "Financial professionals deserve better tools than WhatsApp groups and generic social media.",
    points: [
      { icon: Users, title: "Isolated Practice", desc: "No verified peer network — you're connected to thousands of strangers, not verified professionals." },
      { icon: Search, title: "Product Discovery Gap", desc: "Finding and comparing products across AMCs, insurers, and NBFCs requires dozens of platforms." },
      { icon: Briefcase, title: "Career Stagnation", desc: "No BFSI-specific job board. Opportunities are hidden in informal channels and closed groups." },
    ],
  },
  {
    id: "int-3",
    template: "solution",
    title: "FindOO: Built for Financial Intermediaries",
    subtitle: "Everything you need to build, grow, and manage your financial practice — in one verified platform.",
    points: [
      { icon: UserCheck, title: "Verified Peer Network", desc: "Every connection is credential-checked. Build a circle of trust with genuine professionals." },
      { icon: Package, title: "Product Discovery", desc: "Browse and compare products from issuers — MFs, insurance, PMS, AIFs, bonds, and more." },
      { icon: MessageSquare, title: "Knowledge Sharing", desc: "Share market commentary, research notes, and insights with your verified network." },
      { icon: Briefcase, title: "BFSI Job Board", desc: "India's only BFSI-specific job board with employer dashboards and salary insights." },
    ],
  },
  {
    id: "int-4",
    template: "features",
    title: "Your Complete Professional Toolkit",
    subtitle: "Every tool a financial intermediary needs, purpose-built and free.",
    points: [
      { icon: Users, title: "Network Building", desc: "Follow, connect, and build your financial circle with verified peers" },
      { icon: Package, title: "Product Directory", desc: "Browse services from issuers with category filters and comparison tools" },
      { icon: Briefcase, title: "Job Board", desc: "Find BFSI roles or hire talent — with employer and candidate dashboards" },
      { icon: CreditCard, title: "Digital Card", desc: "QR-enabled business card with verification badges and one-tap sharing" },
      { icon: Calendar, title: "Events", desc: "Attend webinars, investor meets, and training sessions from the ecosystem" },
      { icon: FolderOpen, title: "Secure Vault", desc: "Store and share professional documents — certifications, licenses, reports" },
    ],
  },
  {
    id: "int-5",
    template: "stats",
    title: "A Growing Ecosystem",
    subtitle: "FindOO is building India's largest verified financial network.",
    stats: [
      { value: "10,000+", label: "Verified Professionals", sub: "Across all roles" },
      { value: "500+", label: "BFSI Jobs", sub: "Active listings" },
      { value: "25,000+", label: "Posts & Insights", sub: "Market commentary & research" },
      { value: "100+", label: "Events Monthly", sub: "Webinars, meets & trainings" },
    ],
  },
  {
    id: "int-6",
    template: "steps",
    title: "Get Started in Minutes",
    subtitle: "From signup to verified professional — a simple journey.",
    steps: [
      { num: 1, title: "Create Your Profile", desc: "Sign up as an Intermediary. Add your specializations, certifications, and experience." },
      { num: 2, title: "Get Verified", desc: "Upload your AMFI ARN, SEBI registration, or IRDAI license for credential verification." },
      { num: 3, title: "Build Your Network", desc: "Connect with verified peers, follow issuers, and join professional discussions." },
      { num: 4, title: "Grow Your Practice", desc: "Discover products, attend events, find job opportunities, and share your expertise." },
    ],
  },
  {
    id: "int-7",
    template: "highlight",
    title: "Your Digital Identity, Elevated",
    subtitle: "The FindOO Digital Card is your professional identity — verified, shareable, and always up to date.",
    highlightTitle: "Digital Card Features",
    highlightPoints: [
      "QR code for instant sharing — at events, meetings, or in your email signature",
      "Verification badges visible to everyone — SEBI, AMFI, IRDAI credentials displayed",
      "One-tap contact saving — recipients can save your details directly to their phone",
      "Lead tracking dashboard — see who viewed and saved your card",
      "Always current — updates automatically when you update your profile",
    ],
  },
  {
    id: "int-8",
    template: "cta",
    title: "Join India's Financial Network — Free Forever",
    subtitle: "No subscription. No hidden fees. Just a verified professional network built for people like you.",
    ctaText: "Create Your Profile",
    ctaLink: "/auth?mode=signup",
    ctaSub: "Free for individual professionals. Always.",
  },
];

/* ════════════════════════════════════════════════════
   INVESTOR DECK
   ════════════════════════════════════════════════════ */
const investorSlides: PitchSlide[] = [
  {
    id: "inv-1",
    template: "cover",
    title: "Trust, Verified. Advice, Validated.",
    subtitle: "India's first network where every financial professional is credential-checked against regulatory databases. Your financial journey starts with trust.",
    badge: "For Retail & Institutional Investors",
  },
  {
    id: "inv-2",
    template: "problem",
    title: "The Investor's Dilemma",
    subtitle: "In a world of information overload, trust is the scarcest resource.",
    points: [
      { icon: AlertTriangle, title: "Unverified Advice", desc: "Anyone can call themselves a 'financial advisor' on social media. No credentials required." },
      { icon: Search, title: "No Way to Verify", desc: "Checking if someone is actually SEBI-registered requires navigating complex regulatory databases." },
      { icon: Eye, title: "Information Overload", desc: "Thousands of financial products, hundreds of advisors — and no trusted platform to compare them." },
    ],
  },
  {
    id: "inv-3",
    template: "solution",
    title: "FindOO: Where Trust is Built In",
    subtitle: "Every professional on FindOO has been verified against India's regulatory databases.",
    points: [
      { icon: Shield, title: "Verified Credentials", desc: "Every advisor, distributor, and issuer is checked against SEBI, AMFI, IRDAI, RBI, and PFRDA." },
      { icon: UserCheck, title: "Transparent Profiles", desc: "See registration numbers, experience years, specializations, and endorsements — all verified." },
      { icon: MessageSquare, title: "Community Insights", desc: "Market commentary and research from verified professionals — not anonymous internet strangers." },
      { icon: Lock, title: "Your Privacy Protected", desc: "Control what you share. Granular privacy settings for your profile and activity." },
    ],
  },
  {
    id: "inv-4",
    template: "features",
    title: "Everything an Investor Needs",
    subtitle: "Make informed decisions with tools built specifically for you.",
    points: [
      { icon: Search, title: "Find Verified Advisors", desc: "Browse credential-checked professionals by specialization, location, and experience" },
      { icon: Package, title: "Compare Products", desc: "Side-by-side comparison of mutual funds, insurance, bonds, and more from verified issuers" },
      { icon: MessageSquare, title: "Community Feed", desc: "Follow market insights, research notes, and announcements from verified experts" },
      { icon: Calendar, title: "Attend Events", desc: "Join investor meets, earnings calls, and educational webinars from the ecosystem" },
      { icon: AlertTriangle, title: "Report Bad Actors", desc: "Flag unverified claims or misleading content — with admin review and resolution" },
      { icon: Bell, title: "Stay Updated", desc: "Smart notifications on market events, advisor updates, and platform highlights" },
    ],
  },
  {
    id: "inv-5",
    template: "stats",
    title: "A Network You Can Trust",
    subtitle: "Numbers that demonstrate FindOO's commitment to verification and trust.",
    stats: [
      { value: "100%", label: "Verified Professionals", sub: "Every credential checked" },
      { value: "5", label: "Regulatory Databases", sub: "SEBI, AMFI, IRDAI, RBI, PFRDA" },
      { value: "9", label: "Product Categories", sub: "MF to IPO/NFO" },
      { value: "₹0", label: "Cost for Investors", sub: "Free forever" },
    ],
  },
  {
    id: "inv-6",
    template: "steps",
    title: "Your Journey on FindOO",
    subtitle: "From curious investor to informed decision-maker.",
    steps: [
      { num: 1, title: "Create Your Profile", desc: "Sign up as an Investor. Tell us your interests and investment preferences." },
      { num: 2, title: "Browse Verified Advisors", desc: "Find credential-checked professionals filtered by specialization and location." },
      { num: 3, title: "Explore Products", desc: "Compare financial products from verified issuers with detailed specs." },
      { num: 4, title: "Make Informed Decisions", desc: "Follow expert insights, attend events, and connect with trusted professionals." },
    ],
  },
  {
    id: "inv-7",
    template: "highlight",
    title: "Every Badge Tells a Story",
    subtitle: "Verification badges on FindOO are earned — not self-declared.",
    highlightTitle: "What Verification Means",
    highlightPoints: [
      "SEBI Registered — Verified against the Securities and Exchange Board of India database",
      "AMFI Certified — ARN number validated with the Association of Mutual Funds in India",
      "IRDAI Licensed — Insurance license checked against the Insurance Regulatory Authority",
      "Experience Verified — Professional tenure and credentials independently confirmed",
      "Trust Score — Algorithmic score based on endorsements, activity, and verification depth",
    ],
  },
  {
    id: "inv-8",
    template: "cta",
    title: "Start Your Financial Journey with Trust",
    subtitle: "Join India's first verified financial network. Browse professionals, compare products, and make informed decisions — all for free.",
    ctaText: "Start Exploring",
    ctaLink: "/auth?mode=signup",
    ctaSub: "Free for all investors. No ads. No spam. Just trust.",
  },
];

/* ════════════════════════════════════════════════════
   EXPORT ALL DECKS
   ════════════════════════════════════════════════════ */
export const pitchDecks: PitchDeckData[] = [
  {
    persona: "Regulator",
    slug: "regulator",
    tagline: "Compliance by Design",
    description: "How FindOO strengthens India's financial ecosystem through verified identities, audit trails, and regulatory infrastructure.",
    colorHsl: "260 45% 45%",
    icon: Scale,
    slides: regulatorSlides,
  },
  {
    persona: "Issuer",
    slug: "issuer",
    tagline: "Verified Distribution",
    description: "Reach India's credential-checked intermediaries and informed investors through FindOO's product directory and engagement tools.",
    colorHsl: "165 50% 40%",
    icon: Landmark,
    slides: issuerSlides,
  },
  {
    persona: "Intermediary",
    slug: "intermediary",
    tagline: "Your Professional Network",
    description: "Connect with verified peers, discover products, find BFSI jobs, and grow your practice — on the network built for you.",
    colorHsl: "220 65% 50%",
    icon: UserCheck,
    slides: intermediarySlides,
  },
  {
    persona: "Investor",
    slug: "investor",
    tagline: "Trust, Verified",
    description: "Browse verified advisors, compare products, and make informed financial decisions on India's first credential-checked network.",
    colorHsl: "32 75% 48%",
    icon: BarChart3,
    slides: investorSlides,
  },
];

export const getDeckBySlug = (slug: string) => pitchDecks.find((d) => d.slug === slug);
