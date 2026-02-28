import { motion, AnimatePresence } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import {
  Search, Shield, Users, Lightbulb, Target, TrendingUp, CheckCircle,
  ArrowRight, Zap, Globe, Lock, BarChart3, Building2, UserCheck,
  Handshake, Eye, MessageSquare, Briefcase, Calendar, Award,
  Bell, FileText, Landmark, Settings, FolderOpen, CreditCard, User,
  XCircle, Package, Wrench, LayoutDashboard
} from "lucide-react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

const tabs = ["What is FindOO", "Why does it exist", "How it works", "Who is it for"];

/* ── What is FindOO ── */
const WhatIsContent = () => (
  <>
    <section className="py-16">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div className="space-y-5" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Landmark className="h-3.5 w-3.5" />
              A new category of network
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">
              The world's first financial network
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              There are social networks for friends. Professional networks for careers.
              Micro-blogging for opinions. Media broadcasters for news.
              But until FindOO — <span className="font-semibold text-foreground">no network purpose-built for finance.</span>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              FindOO is a professional financial network designed exclusively for India's regulated ecosystem.
              Every participant is verified against regulatory databases — SEBI, RBI, IRDAI, AMFI, and PFRDA.
              Trust isn't a feature — it's the foundation.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Think of it as the intersection of professional networking, regulatory compliance,
              and financial services — a space where credentials speak louder than claims.
            </p>
          </motion.div>
          <motion.div className="grid grid-cols-2 gap-4" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            {[
              { icon: Shield, label: "Verified Profiles", desc: "Every professional is credential-checked" },
              { icon: Globe, label: "Open Ecosystem", desc: "Issuers, intermediaries & investors" },
              { icon: Lock, label: "Regulatory First", desc: "Built within India's compliance framework" },
              { icon: BarChart3, label: "Market Insights", desc: "Curated commentary & research" },
            ].map((item, i) => (
              <motion.div key={item.label} className="rounded-xl border border-border bg-card p-5" initial="hidden" animate="visible" variants={fadeUp} custom={i + 2}>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                  <item.icon className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold font-heading text-card-foreground mb-1">{item.label}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>

    {/* Platform Capabilities */}
    <section className="py-12 border-t border-border">
      <div className="container max-w-5xl">
        <motion.h3 className="text-xl font-bold font-heading text-foreground text-center mb-3" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          What's Live on FindOO
        </motion.h3>
        <motion.p className="text-sm text-muted-foreground text-center mb-8 max-w-lg mx-auto" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          A growing ecosystem of features built specifically for financial professionals.
        </motion.p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, title: "Verified Feed", desc: "Market commentary, research notes, polls & surveys from verified professionals", status: "live" },
            { icon: Users, title: "Trust Network", desc: "Follow, connect & build your financial circle with credential-checked professionals", status: "live" },
            { icon: Briefcase, title: "BFSI Job Board", desc: "India's only BFSI-specific job board with employer dashboards & market insights", status: "live" },
            { icon: Shield, title: "Verification Engine", desc: "Upload regulatory credentials, earn trust badges visible across the network", status: "live" },
            { icon: Bell, title: "Smart Notifications", desc: "Stay updated on connections, interactions, and verification status changes", status: "live" },
            { icon: FileText, title: "Content Types", desc: "Articles, announcements, expert finds, requirements & query posts", status: "live" },
            { icon: Calendar, title: "Events & Webinars", desc: "Investor meets, AGMs, industry webinars within the regulated ecosystem", status: "live" },
            { icon: Award, title: "Premium Features", desc: "Advanced analytics, priority visibility & enhanced tools for professionals", status: "coming" },
            { icon: Settings, title: "API Verification", desc: "Automated SEBI/RBI/IRDAI lookups for instant credential verification", status: "coming" },
          ].map((item, i) => (
            <motion.div key={item.title} className="rounded-xl border border-border bg-card p-5 relative"
              initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              {item.status === "coming" && (
                <Badge variant="outline" className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider bg-accent/5 text-accent border-accent/20">
                  Soon
                </Badge>
              )}
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                <item.icon className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold font-heading text-card-foreground mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </>
);

/* ── Why does it exist ── */
const WhyExistsContent = () => (
  <>
    <section className="py-16">
      <div className="container max-w-4xl">
        <motion.div className="text-center mb-12" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h2 className="text-2xl font-bold font-heading text-foreground mb-4">The gap no one filled</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            India has 10Cr+ demat accounts, 44,000+ AMFI distributors, 50,000+ SEBI-registered intermediaries —
            yet the ecosystem lacks a unified, trust-verified platform for professionals to connect.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Eye, title: "The Trust Gap", desc: "Retail investors can't distinguish genuine advisors from unregistered operators. Misinformation spreads unchecked on generic social platforms." },
            { icon: Users, title: "Fragmented Network", desc: "Financial professionals operate in silos — WhatsApp groups, closed forums, paid newsletters. No unified, verified platform exists." },
            { icon: Lightbulb, title: "Knowledge Void", desc: "Quality market insights are scattered. LinkedIn doesn't verify SEBI numbers. Twitter doesn't check AMFI ARNs. Nobody verifies credentials." },
          ].map((item, i) => (
            <motion.div key={item.title} className="rounded-xl border border-border bg-card p-6 text-center"
              initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold font-heading text-card-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Comparison */}
        <motion.div className="rounded-2xl border border-border bg-card p-8 mb-12" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <h3 className="text-base font-bold font-heading text-card-foreground mb-5 text-center">What exists vs. what was missing</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Social Networks", issue: "No identity verification, anonymous financial tips" },
              { label: "Professional Networks", issue: "Generic — no financial regulation awareness" },
              { label: "Terminal Services", issue: "Enterprise pricing, excludes retail & small firms" },
              { label: "Chat Groups", issue: "Unregulated, no compliance, no accountability" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50">
                <div className="h-1.5 w-1.5 rounded-full bg-destructive/50 mt-2 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-card-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.issue}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-10 text-center"
          initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <Zap className="h-8 w-8 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold font-heading text-foreground mb-3">FindOO: The Financial Network</h3>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
            We didn't build a better LinkedIn for finance. We created an entirely new category —
            a <span className="font-semibold text-foreground">financial network</span> where trust is the default,
            credentials are verified, and every interaction happens within India's regulatory framework.
          </p>
          <Button asChild>
            <Link to="/auth?mode=signup">Join the Network <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  </>
);

/* ── Role-based feature data ── */
const roleFeatures = {
  investor: {
    icon: BarChart3,
    label: "Investor",
    tagline: "Retail, HNI, Institutional & NRI",
    colorClass: "text-investor",
    bgClass: "bg-investor/10 border-investor/30",
    activeClass: "bg-investor/15 border-investor ring-2 ring-investor/20",
    features: [
      { module: "Feed", icon: MessageSquare, can: ["Browse all posts", "Like, comment, bookmark & share", "Create text posts & announcements"], cant: ["Create Polls or Surveys"] },
      { module: "Directory", icon: Package, can: ["Browse & compare products and services", "Send enquiries to listings", "Write reviews & ratings"], cant: ["Create product or service listings"] },
      { module: "Jobs", icon: Briefcase, can: ["Browse all active jobs", "Apply with resume & cover note", "Track applications via Candidate Dashboard"], cant: ["Post jobs or access Employer Dashboard"] },
      { module: "Events", icon: Calendar, can: ["Browse & register for events", "Attend webinars and investor meets"], cant: ["Create or organize events"] },
      { module: "Network", icon: Users, can: ["Follow & connect with verified professionals", "Send direct messages"], cant: [] },
      { module: "Vault & Card", icon: FolderOpen, can: ["Store documents securely", "Share digital business card"], cant: [] },
    ],
  },
  intermediary: {
    icon: UserCheck,
    label: "Intermediary",
    tagline: "Advisors, Brokers & Distributors",
    colorClass: "text-intermediary",
    bgClass: "bg-intermediary/10 border-intermediary/30",
    activeClass: "bg-intermediary/15 border-intermediary ring-2 ring-intermediary/20",
    features: [
      { module: "Feed", icon: MessageSquare, can: ["All post types: research, commentary, articles", "Create Polls & Surveys", "Schedule & draft posts"], cant: [] },
      { module: "Directory", icon: Wrench, can: ["List professional services (Advisory, Compliance, etc.)", "Manage enquiries & reviews"], cant: ["Create product listings (Issuer only)"] },
      { module: "Jobs", icon: Briefcase, can: ["Post jobs & access Employer Dashboard", "Apply for jobs as Individual (Candidate Dashboard)", "Browse & save jobs"], cant: [] },
      { module: "Events", icon: Calendar, can: ["Create & organize events", "Manage registrations & speakers", "Access Organizer Dashboard"], cant: [] },
      { module: "Network", icon: Users, can: ["Follow & connect with verified professionals", "Send direct messages"], cant: [] },
      { module: "Vault & Card", icon: FolderOpen, can: ["Store documents securely", "Share digital business card"], cant: [] },
    ],
  },
  issuer: {
    icon: Landmark,
    label: "Issuer",
    tagline: "Companies, AMCs & Fund Houses",
    colorClass: "text-issuer",
    bgClass: "bg-issuer/10 border-issuer/30",
    activeClass: "bg-issuer/15 border-issuer ring-2 ring-issuer/20",
    features: [
      { module: "Feed", icon: MessageSquare, can: ["All post types: announcements, research, articles", "Create Polls & Surveys", "Schedule & draft posts"], cant: [] },
      { module: "Directory", icon: Package, can: ["List financial products (MF, Insurance, PMS, AIF, etc.)", "Manage enquiries & reviews"], cant: ["Create service listings (Intermediary only)"] },
      { module: "Jobs", icon: Briefcase, can: ["Post jobs & access Employer Dashboard", "Browse & save jobs"], cant: ["Candidate Dashboard (Individual accounts only)"] },
      { module: "Events", icon: Calendar, can: ["Create & organize events", "Manage registrations & speakers", "Access Organizer Dashboard"], cant: [] },
      { module: "Network", icon: Users, can: ["Follow & connect with verified professionals", "Send direct messages"], cant: [] },
      { module: "Vault & Card", icon: FolderOpen, can: ["Store documents securely", "Share digital business card"], cant: [] },
    ],
  },
};

type RoleKey = keyof typeof roleFeatures;

/* ── How it works ── */
const HowItWorksContent = () => {
  const [selectedRole, setSelectedRole] = useState<RoleKey>("investor");
  const role = roleFeatures[selectedRole];

  return (
    <>
      {/* Steps section */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <motion.div className="text-center mb-12" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-4">Getting Started is Simple</h2>
            <p className="text-muted-foreground">Three steps to join India's first financial network.</p>
          </motion.div>

          <div className="space-y-6">
            {[
              { step: "01", title: "Create Your Profile", desc: "Sign up with your professional details. Select your role — Issuer, Intermediary, or Investor. Add your regulatory credentials and organizational information.", icon: UserCheck },
              { step: "02", title: "Get Verified", desc: "Upload your SEBI, RBI, IRDAI, AMFI, or PFRDA credentials. Our verification team reviews and issues your trust badge — visible across the entire network.", icon: Shield },
              { step: "03", title: "Discover & Connect", desc: "Browse verified professionals, share market insights, apply to BFSI jobs, engage in meaningful discussions, and build your financial circle.", icon: Handshake },
            ].map((item, i) => (
              <motion.div key={item.step} className="flex gap-6 items-start p-6 rounded-xl border border-border bg-card"
                initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <div className="shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold font-heading text-primary">{item.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-bold font-heading text-card-foreground">{item.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-based features section */}
      <section className="py-16 border-t border-border">
        <div className="container max-w-5xl">
          <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Role-Based Capabilities
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-3">
              What can you do on FindOO?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              Your role shapes your experience. Select a role to explore what features and capabilities are available.
            </p>
          </motion.div>

          {/* Role selector */}
          <motion.div className="flex flex-wrap justify-center gap-3 mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            {(Object.keys(roleFeatures) as RoleKey[]).map((key) => {
              const r = roleFeatures[key];
              const isActive = selectedRole === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedRole(key)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    isActive ? r.activeClass + " shadow-sm" : r.bgClass + " hover:shadow-sm"
                  }`}
                >
                  <r.icon className={`h-4.5 w-4.5 ${r.colorClass}`} />
                  <div className="text-left">
                    <div className={`font-semibold ${isActive ? r.colorClass : "text-card-foreground"}`}>{r.label}</div>
                    <div className="text-[10px] text-muted-foreground font-normal">{r.tagline}</div>
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Feature grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRole}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {role.features.map((feat, i) => (
                <motion.div
                  key={feat.module}
                  className="rounded-xl border border-border bg-card p-5 flex flex-col"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.35 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${roleFeatures[selectedRole].bgClass}`}>
                      <feat.icon className={`h-4 w-4 ${roleFeatures[selectedRole].colorClass}`} />
                    </div>
                    <h4 className="text-sm font-bold font-heading text-card-foreground">{feat.module}</h4>
                  </div>
                  <ul className="space-y-1.5 flex-1">
                    {feat.can.map((c) => (
                      <li key={c} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{c}</span>
                      </li>
                    ))}
                    {feat.cant.map((c) => (
                      <li key={c} className="flex items-start gap-1.5 text-xs text-muted-foreground/60">
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                        <span className="line-through">{c}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Account type note */}
          <motion.div className="mt-8 rounded-xl border border-border bg-muted/30 p-5" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <User className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-bold font-heading text-card-foreground mb-1">Individual vs Entity Accounts</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Individual</span> accounts (personal professionals) can apply for jobs via the Candidate Dashboard across any role.
                  <span className="font-semibold text-foreground"> Entity</span> accounts (companies, firms) focus on employer and organizational capabilities — they can post jobs and manage listings but cannot apply as candidates.
                  Both account types can hold multiple roles and switch between them anytime.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div className="mt-10 text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}>
            <Button asChild size="lg">
              <Link to="/auth?mode=signup">
                Get Started Free <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
};

/* ── Who is it for ── */
const WhoIsItForContent = () => (
  <>
    <section className="py-16">
      <div className="container max-w-5xl">
        <motion.div className="text-center mb-12" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h2 className="text-2xl font-bold font-heading text-foreground mb-4">Built for India's Financial Ecosystem</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three distinct roles, one unified network. Each participant gets tailored tools, verified identity, and role-specific features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Building2,
              role: "Issuers",
              tagline: "Companies, AMCs & Fund Houses",
              features: [
                "Distribute announcements to verified audiences",
                "Reach intermediaries and investors directly",
                "Post BFSI jobs and find verified talent",
                "Build institutional credibility with verified badges",
              ],
            },
            {
              icon: UserCheck,
              role: "Intermediaries",
              tagline: "Advisors, Brokers & Distributors",
              features: [
                "Showcase SEBI/AMFI/IRDAI credentials",
                "Share market commentary & research notes",
                "Discover job opportunities in the BFSI sector",
                "Build professional reputation through verified identity",
              ],
            },
            {
              icon: Users,
              role: "Investors",
              tagline: "Retail, HNI, Institutional & NRI",
              features: [
                "Find verified financial professionals",
                "Access curated market insights & research",
                "Verify advisor credentials before engaging",
                "Explore BFSI career opportunities",
              ],
            },
          ].map((item, i) => (
            <motion.div key={item.role} className="rounded-xl border border-border bg-card p-8 flex flex-col"
              initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold font-heading text-card-foreground">{item.role}</h3>
              <p className="text-sm text-muted-foreground mb-4">{item.tagline}</p>
              <ul className="space-y-2.5 flex-1">
                {item.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="mt-6 w-full" asChild>
                <Link to="/auth?mode=signup">Join as {item.role.slice(0, -1)} <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Regulator ecosystems */}
        <motion.div className="mt-14 text-center" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <p className="text-sm text-muted-foreground mb-4">Regulated ecosystems we serve</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["SEBI", "RBI", "IRDAI", "AMFI", "PFRDA"].map((reg) => (
              <Badge key={reg} variant="outline" className="text-xs px-3 py-1 bg-card">
                {reg}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  </>
);

const tabContentMap: Record<string, React.FC> = {
  "What is FindOO": WhatIsContent,
  "Why does it exist": WhyExistsContent,
  "How it works": HowItWorksContent,
  "Who is it for": WhoIsItForContent,
};

const Explore = () => {
  usePageMeta({ title: "Explore", description: "Discover what FindOO is, why it exists, how it works, and who it's for." });
  const [activeTab, setActiveTab] = useState("What is FindOO");
  const Content = tabContentMap[activeTab];

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Explore"
        title="The Financial Network"
        titleAccent="India Needed"
        subtitle="Not social. Not professional. Financial. Discover what makes FindOO the first network built exclusively for India's regulated financial ecosystem."
        variant="hexagons"
      />

      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="explore-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <Content />
    </PublicPageLayout>
  );
};

export default Explore;
