import { motion } from "framer-motion";
import { useState } from "react";
import { Shield, Eye, Users, Award, TrendingUp, Target } from "lucide-react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

const tabs = ["Company", "Mission", "Values"];

const values = [
  { letter: "F", icon: Shield, title: "Trust First", description: "Every entity is verified against regulatory databases — SEBI, RBI, IRDAI, AMFI, and PFRDA." },
  { letter: "I", icon: Eye, title: "Transparency", description: "Clear credentials, verified badges, and open communication between all participants." },
  { letter: "N", icon: Users, title: "Community", description: "A professional network built on mutual respect, knowledge sharing, and ethical conduct." },
  { letter: "D", icon: Award, title: "Quality", description: "Curated insights, verified professionals, and meaningful connections over noise." },
  { letter: "O", icon: TrendingUp, title: "Growth", description: "Tools and features that help every participant grow their practice and knowledge." },
  { letter: "O", icon: Target, title: "Compliance", description: "Built within India's regulatory framework to ensure every interaction meets standards." },
];

const About = () => {
  const [activeTab, setActiveTab] = useState("Company");

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="About"
        title="India's Trust-First"
        titleAccent="Financial Network"
        subtitle="Connecting verified Issuers, Intermediaries, and Investors within a regulated, transparent ecosystem."
        decoration={
          <svg width="200" height="200" viewBox="0 0 200 200" className="text-primary">
            <circle cx="150" cy="50" r="80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <circle cx="160" cy="40" r="50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          </svg>
        }
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
        <section className="py-16">
          <div className="container">
            <div className="grid md:grid-cols-5 gap-12 items-start">
              <motion.div className="md:col-span-3 space-y-5" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                <h2 className="text-2xl font-bold font-heading text-foreground">Our Story</h2>
                <p className="text-muted-foreground leading-relaxed">
                  India's financial markets have grown exponentially — yet finding verified, trustworthy
                  professionals remains a challenge. Retail investors struggle to distinguish genuine advisors
                  from unregistered operators. Regulated intermediaries lack a professional platform to
                  showcase their credentials. And issuers need better channels to reach their target audience.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">FindOO</span> was born to solve this trust gap.
                  By combining regulatory verification with a professional social network, we've created a space
                  where credentials speak louder than claims, and every connection is built on a foundation
                  of verified trust.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We named our platform <span className="font-semibold text-primary">FindOO</span>, representing
                  the ability to <em>Find</em> and connect with the right financial professionals through an
                  <em> Open Online</em> ecosystem.
                </p>
              </motion.div>

              <motion.div className="md:col-span-2" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                <div className="rounded-2xl border border-border bg-card p-8 text-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-5xl font-bold font-heading text-primary">F</span>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-card-foreground">FindOO</h3>
                  <p className="text-sm text-muted-foreground mt-1">Find · Open · Online</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Mission Tab */}
      {activeTab === "Mission" && (
        <section className="py-16">
          <div className="container max-w-4xl">
            <div className="grid md:grid-cols-2 gap-10">
              <motion.div className="rounded-xl border border-border bg-card p-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Target className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold font-heading text-card-foreground mb-3">Our Mission</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To democratize access to India's financial ecosystem by creating a verified, trust-first
                  network where every participant — from retail investors to SEBI-registered advisors — can
                  discover, connect, and share insights with confidence.
                </p>
              </motion.div>

              <motion.div className="rounded-xl border border-border bg-card p-8" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Eye className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold font-heading text-card-foreground mb-3">Our Vision</h2>
                <p className="text-muted-foreground leading-relaxed">
                  A financial ecosystem where trust is the default, not the exception. Where every market
                  participant can verify credentials instantly, access quality insights freely, and build
                  professional relationships that drive India's capital markets forward.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Values Tab */}
      {activeTab === "Values" && (
        <section className="py-16">
          <div className="container max-w-5xl">
            <motion.h2 className="text-2xl font-bold font-heading text-foreground text-center mb-10" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              Our Values
            </motion.h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  className="rounded-xl border border-border bg-card p-6 flex items-start gap-4"
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={i + 1}
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
      )}
    </PublicPageLayout>
  );
};

export default About;
