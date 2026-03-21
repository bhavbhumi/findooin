import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Shield, Eye, Users, Award, TrendingUp, Target, Briefcase, MapPin, Clock, Send, Newspaper, ExternalLink, Calendar, Landmark, Globe, Zap } from "lucide-react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

const tabs = ["Company", "Career", "Press"];

const values = [
  { letter: "F", icon: Shield, title: "Trust First", description: "Every entity is verified against regulatory databases — SEBI, RBI, IRDAI, AMFI, and PFRDA." },
  { letter: "I", icon: Eye, title: "Transparency", description: "Clear credentials, verified badges, and open communication between all participants." },
  { letter: "N", icon: Users, title: "Community", description: "A professional network built on mutual respect, knowledge sharing, and ethical conduct." },
  { letter: "D", icon: Award, title: "Quality", description: "Curated insights, verified professionals, and meaningful connections over noise." },
  { letter: "O", icon: TrendingUp, title: "Growth", description: "Tools and features that help every participant grow their practice and knowledge." },
  { letter: "O", icon: Target, title: "Compliance", description: "Built within India's regulatory framework to ensure every interaction meets standards." },
];

const openings = [
  { title: "Full-Stack Developer", department: "Engineering", location: "Mumbai, India", type: "Full-time" },
  { title: "Product Designer", department: "Design", location: "Remote, India", type: "Full-time" },
  { title: "Compliance Analyst", department: "Legal & Compliance", location: "Mumbai, India", type: "Full-time" },
  { title: "Content Strategist", department: "Marketing", location: "Remote, India", type: "Full-time" },
];

const pressItems = [
  { title: "FindOO launches the world's first trust-verified financial network", source: "Economic Times", date: "Feb 2026", url: "#" },
  { title: "Why India needs a dedicated financial network — and how FindOO is building it", source: "Mint", date: "Jan 2026", url: "#" },
  { title: "FindOO raises seed funding to build India's financial professional ecosystem", source: "Inc42", date: "Dec 2025", url: "#" },
  { title: "The future of financial networking: FindOO's regulatory-first approach", source: "Business Standard", date: "Nov 2025", url: "#" },
];

const About = () => {
  usePageMeta({ title: "About", description: "Learn about FindOO — India's first financial network. Company, careers, and press.", path: "/about" });
  const [activeTab, setActiveTab] = useState("Company");

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="About"
        title="Building the World's First"
        titleAccent="Financial Network"
        subtitle="Connecting verified Issuers, Intermediaries, and Investors within a regulated, transparent ecosystem — because finance deserved its own network."
        variant="hexagons"
        context="about"
      />

      {/* Tabs */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="about-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Company Tab */}
      {activeTab === "Company" && (
        <>
          <section className="py-16">
            <div className="container">
              <div className="grid md:grid-cols-5 gap-12 items-start">
                <motion.div className="md:col-span-3 space-y-5" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                  <h2 className="text-2xl font-bold font-heading text-foreground">Our Story</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    There are social networks for friends. Professional networks for careers.
                    Micro-blogging platforms for opinions. Media broadcasters for news.
                    But the world's largest and fastest-growing financial market — India —
                    had no dedicated network for its financial professionals and investors.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">FindOO</span> was born to fill this gap.
                    Not as a better version of something that exists — but as an entirely new category.
                    A <span className="font-semibold text-primary">financial network</span> where trust is built-in,
                    credentials are verified against SEBI, RBI, IRDAI, AMFI & PFRDA databases,
                    and every connection carries the weight of institutional credibility.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    We named our platform <span className="font-semibold text-primary">FindOO</span> — representing
                    the ability to <em>Find</em> and connect with the right financial professionals through an
                    <em> Open Online</em> ecosystem. Every feature we build serves one purpose: making India's financial
                    ecosystem more transparent, accessible, and trustworthy.
                  </p>
                </motion.div>

                <motion.div className="md:col-span-2" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                  <div className="rounded-2xl border border-border bg-card p-8 text-center">
                    <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                      <span className="text-5xl font-bold font-heading text-primary">F</span>
                    </div>
                    <h3 className="text-lg font-bold font-heading text-card-foreground">FindOO</h3>
                    <p className="text-sm text-muted-foreground mt-1">Find · Open · Online</p>
                    <p className="text-xs text-muted-foreground mt-3 italic">"Financially Social"</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="py-12 border-t border-border">
            <div className="container max-w-4xl">
              <div className="grid md:grid-cols-2 gap-10">
                <motion.div className="rounded-xl border border-border bg-card p-8" initial="hidden" animate="visible" variants={fadeUp} custom={2}>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Target className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold font-heading text-card-foreground mb-3">Our Mission</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    To build the world's first financial network — a trust-verified ecosystem where
                    India's Issuers, Intermediaries, and Investors can discover, connect, share insights,
                    find talent, and transact with confidence within a regulated framework.
                  </p>
                </motion.div>

                <motion.div className="rounded-xl border border-border bg-card p-8" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                    <Globe className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold font-heading text-card-foreground mb-3">Our Vision</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    A financial ecosystem where trust is the default, not the exception. Where credentials
                    are instantly verifiable, where quality insights replace noise, and where every market
                    participant — from retail investor to listed company — has equal access to a transparent network.
                  </p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* The Opportunity */}
          <section className="py-12 border-t border-border">
            <div className="container max-w-4xl">
              <motion.div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-bold font-heading text-foreground">The Opportunity</h3>
                </div>
                <div className="grid sm:grid-cols-3 gap-6 text-center">
                  {[
                    { stat: "15Cr+", label: "Demat accounts in India" },
                    { stat: "50,000+", label: "SEBI-registered intermediaries" },
                    { stat: "0", label: "Financial networks that existed" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-2xl font-bold font-heading text-primary">{item.stat}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Values */}
          <section className="py-12 border-t border-border">
            <div className="container max-w-5xl">
              <motion.h2 className="text-2xl font-bold font-heading text-foreground text-center mb-10" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                Our Values
              </motion.h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {values.map((v, i) => (
                  <motion.div
                    key={v.title}
                    className="rounded-xl border border-border bg-card p-6 flex items-start gap-4"
                    initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                  >
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 text-sm font-bold">
                      {v.letter}
                    </div>
                    <div>
                      <h3 className="text-base font-bold font-heading text-card-foreground mb-1">{v.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Career Tab */}
      {activeTab === "Career" && (
        <section className="py-12">
          <div className="container">
            <motion.div
              className="flex items-center gap-3 mb-10 pb-6 border-b border-border"
              initial="hidden" animate="visible" variants={fadeUp} custom={0}
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-foreground">Join Our Team</h3>
                <p className="text-sm text-muted-foreground">Help us build a category that doesn't exist yet — the world's first financial network.</p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5 mb-12">
              {[
                { icon: Zap, title: "Category Creation", desc: "You're not iterating on something that exists. You're building an entirely new category of platform." },
                { icon: Users, title: "Collaborative Culture", desc: "Small, focused teams with the autonomy to ship fast and learn from real financial professionals." },
                { icon: Award, title: "Growth First", desc: "Learning budgets, mentorship, and clear career progression for every team member." },
              ].map((item, i) => (
                <motion.div key={item.title} className="rounded-xl border border-border bg-card p-6"
                  initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold font-heading text-card-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.h3 className="text-xl font-bold font-heading text-foreground mb-6" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
              Open Positions
            </motion.h3>
            <div className="space-y-3">
              {openings.map((job, i) => (
                <motion.div key={job.title}
                  className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/20 transition-colors"
                  initial="hidden" animate="visible" variants={fadeUp} custom={i + 5}
                >
                  <div>
                    <h4 className="text-base font-semibold font-heading text-card-foreground">{job.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.type}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="shrink-0">
                    <Send className="h-3.5 w-3.5 mr-1.5" /> Apply
                  </Button>
                </motion.div>
              ))}
            </div>

            <motion.div className="mt-12 rounded-xl bg-primary/[0.04] border border-primary/10 p-8 text-center"
              initial="hidden" animate="visible" variants={fadeUp} custom={9}>
              <h4 className="text-lg font-bold font-heading text-foreground mb-2">Don't see the right role?</h4>
              <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
                We're always interested in hearing from talented people who want to shape the future of financial networking.
              </p>
              <Button asChild>
                <a href="mailto:careers@findoo.in">Send Your Resume</a>
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Press Tab */}
      {activeTab === "Press" && (
        <section className="py-12">
          <div className="container">
            <motion.div
              className="flex items-center gap-3 mb-10 pb-6 border-b border-border"
              initial="hidden" animate="visible" variants={fadeUp} custom={0}
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-foreground">Press & Media</h3>
                <p className="text-sm text-muted-foreground">Coverage about FindOO — the world's first financial network.</p>
              </div>
            </motion.div>

            <div className="space-y-4 max-w-3xl">
              {pressItems.map((item, i) => (
                <motion.a key={item.title} href={item.url}
                  className="block rounded-xl border border-border bg-card p-6 hover:border-primary/20 hover:shadow-sm transition-all group"
                  initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-semibold font-heading text-card-foreground group-hover:text-primary transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground/70">{item.source}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{item.date}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  </div>
                </motion.a>
              ))}
            </div>

            <motion.div className="mt-12 rounded-xl bg-primary/[0.04] border border-primary/10 p-8 text-center max-w-3xl"
              initial="hidden" animate="visible" variants={fadeUp} custom={6}>
              <h4 className="text-lg font-bold font-heading text-foreground mb-2">Media Inquiries</h4>
              <p className="text-sm text-muted-foreground mb-4">
                For press inquiries, interviews, or media kits, reach out to our communications team.
              </p>
              <Button variant="outline" asChild>
                <a href="mailto:press@findoo.in">press@findoo.in</a>
              </Button>
            </motion.div>
          </div>
        </section>
      )}
    </PublicPageLayout>
  );
};

export default About;
