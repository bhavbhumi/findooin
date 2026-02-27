import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Shield, Users, Lightbulb, Target, TrendingUp, CheckCircle, ArrowRight, Zap, Globe, Lock, BarChart3, Building2, UserCheck, Handshake, Eye } from "lucide-react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
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
              <Search className="h-3.5 w-3.5" />
              Find · Open · Online
            </div>
            <h2 className="text-2xl font-bold font-heading text-foreground">India's Trust-First Financial Network</h2>
            <p className="text-muted-foreground leading-relaxed">
              FindOO is a professional social network designed exclusively for India's financial ecosystem.
              Unlike general-purpose platforms, every participant on FindOO is verified against regulatory
              databases — SEBI, RBI, IRDAI, AMFI, and PFRDA.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Think of it as the intersection of professional networking and regulatory compliance —
              a space where credentials are verified, content is meaningful, and connections are built
              on a foundation of institutional trust.
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

    <section className="py-12 border-t border-border">
      <div className="container max-w-4xl">
        <motion.h3 className="text-xl font-bold font-heading text-foreground text-center mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          What Makes FindOO Different
        </motion.h3>
        <div className="space-y-4">
          {[
            "Every user undergoes regulatory credential verification before gaining full access",
            "Content is curated for financial professionals — no noise, no spam, no unregistered advice",
            "Role-based features tailored for Issuers, Intermediaries, and Investors",
            "Built-in compliance tools ensure all interactions meet Indian financial regulations",
            "A discovery engine that connects you with the right professionals based on verified expertise",
          ].map((point, i) => (
            <motion.div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-card border border-border"
              initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
              <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">{point}</p>
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
          <h2 className="text-2xl font-bold font-heading text-foreground mb-4">The Problem We're Solving</h2>
          <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            India's financial markets have grown exponentially, yet the ecosystem lacks a unified, trust-verified
            platform for professionals to connect, collaborate, and share knowledge.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: Eye, title: "The Trust Gap", desc: "Retail investors can't distinguish genuine advisors from unregistered operators. Misinformation spreads unchecked on generic social platforms.", color: "text-destructive" },
            { icon: Users, title: "Fragmented Network", desc: "Financial professionals operate in silos. There's no unified platform for verified Issuers, Intermediaries, and Investors to connect.", color: "text-primary" },
            { icon: Lightbulb, title: "Knowledge Void", desc: "Quality market insights are scattered across paid newsletters, closed groups, and unverified sources — hard to find, harder to trust.", color: "text-primary" },
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

        <motion.div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-10 text-center"
          initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <Zap className="h-8 w-8 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold font-heading text-foreground mb-3">The FindOO Solution</h3>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-6">
            We created a platform where trust is the default, not the exception. Where every participant
            is verified, every credential is checked, and every interaction happens within India's
            regulatory framework.
          </p>
          <Button asChild>
            <Link to="/auth?mode=signup">Join the Network <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
          </Button>
        </motion.div>
      </div>
    </section>
  </>
);

/* ── How it works ── */
const HowItWorksContent = () => (
  <>
    <section className="py-16">
      <div className="container max-w-4xl">
        <motion.div className="text-center mb-12" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h2 className="text-2xl font-bold font-heading text-foreground mb-4">Getting Started is Simple</h2>
          <p className="text-muted-foreground">Three steps to join India's most trusted financial network.</p>
        </motion.div>

        <div className="space-y-6">
          {[
            { step: "01", title: "Create Your Profile", desc: "Sign up with your professional details. Select your role — Issuer, Intermediary, or Investor. Add your regulatory credentials and organizational information.", icon: UserCheck },
            { step: "02", title: "Get Verified", desc: "Our system cross-references your credentials against SEBI, RBI, IRDAI, AMFI, and PFRDA databases. Once verified, you receive a trust badge visible on your profile.", icon: Shield },
            { step: "03", title: "Discover & Connect", desc: "Browse verified professionals, share market insights, engage in meaningful discussions, and build a network within a regulated, trust-first ecosystem.", icon: Handshake },
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

        <motion.div className="mt-12 grid md:grid-cols-3 gap-5" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          {[
            { icon: TrendingUp, title: "Share Insights", desc: "Post market commentary, research notes, and professional updates" },
            { icon: Target, title: "Find Experts", desc: "Discover verified professionals with the expertise you need" },
            { icon: BarChart3, title: "Track Trends", desc: "Stay updated with curated financial content and discussions" },
          ].map((item, i) => (
            <div key={item.title} className="rounded-xl border border-border bg-card p-5 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 mx-auto">
                <item.icon className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold font-heading text-card-foreground mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  </>
);

/* ── Who is it for ── */
const WhoIsItForContent = () => (
  <>
    <section className="py-16">
      <div className="container max-w-5xl">
        <motion.div className="text-center mb-12" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h2 className="text-2xl font-bold font-heading text-foreground mb-4">Built for India's Financial Ecosystem</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three distinct roles, one unified platform. Each participant gets tailored tools and features.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Building2,
              role: "Issuers",
              tagline: "Companies & Fund Houses",
              features: [
                "Distribute announcements to verified audiences",
                "Reach intermediaries and investors directly",
                "Share corporate updates & IPO information",
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
                "Connect with potential clients organically",
                "Build professional reputation through verified identity",
              ],
            },
            {
              icon: Users,
              role: "Investors",
              tagline: "Retail & Institutional Investors",
              features: [
                "Find verified financial professionals",
                "Access curated market insights & research",
                "Verify advisor credentials before engaging",
                "Participate in trusted financial discussions",
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
  const [activeTab, setActiveTab] = useState("What is FindOO");
  const Content = tabContentMap[activeTab];

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Explore"
        title="Discover"
        titleAccent="FindOO"
        subtitle="Learn what makes India's trust-first financial network different, and how it can work for you."
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
