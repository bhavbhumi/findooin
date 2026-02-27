import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Users, TrendingUp, Building2, UserCheck, BarChart3,
  ArrowRight, CheckCircle2, Briefcase, Calendar, MessageSquare,
  Globe, Zap, Lock, Search, Landmark, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { usePageMeta } from "@/hooks/usePageMeta";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const roles = [
  {
    icon: Building2,
    title: "Issuers",
    description: "Listed companies, AMCs, NBFCs, Banks & Insurance companies — reach verified investors and intermediaries directly.",
    color: "bg-issuer/10 text-issuer",
  },
  {
    icon: UserCheck,
    title: "Intermediaries",
    description: "Brokers, RIAs, MF Distributors, Research Analysts — build trust with verified SEBI/AMFI/IRDAI credentials.",
    color: "bg-intermediary/10 text-intermediary",
  },
  {
    icon: BarChart3,
    title: "Investors",
    description: "Retail, HNI, Institutional & NRI investors — discover verified entities, access quality insights, and connect with confidence.",
    color: "bg-investor/10 text-investor",
  },
];

const trustPoints = [
  "SEBI, RBI, IRDAI, AMFI & PFRDA regulated entities",
  "Manual verification with trust badges",
  "Role-based access & privacy controls",
  "Multi-role support — grow from Investor to Intermediary",
];

const platformFeatures = [
  {
    icon: MessageSquare,
    title: "Verified Feed",
    desc: "Market commentary, research notes & insights — from verified professionals, not anonymous accounts.",
    status: "live",
  },
  {
    icon: Users,
    title: "Trust Network",
    desc: "Connect with credential-verified professionals. Follow, connect, and build your financial circle.",
    status: "live",
  },
  {
    icon: Briefcase,
    title: "BFSI Job Board",
    desc: "India's only BFSI-focused job board with verified employers, role-based dashboards & market insights.",
    status: "live",
  },
  {
    icon: Shield,
    title: "Verification Engine",
    desc: "Upload your regulatory credentials. Get verified. Earn a trust badge that signals credibility network-wide.",
    status: "live",
  },
  {
    icon: Calendar,
    title: "Events & Webinars",
    desc: "Investor meets, AGM listings, industry webinars — discover and host events within the regulated ecosystem.",
    status: "live",
  },
  {
    icon: Award,
    title: "Premium Features",
    desc: "Advanced analytics, priority visibility, and enhanced tools for serious financial professionals.",
    status: "coming",
  },
];

const categoryComparisons = [
  { platform: "Social Networks", gap: "No identity verification, rampant misinformation, anonymous financial advice" },
  { platform: "Professional Networks", gap: "Generic — not built for financial regulation, no SEBI/RBI credential checks" },
  { platform: "Bloomberg / Reuters", gap: "Terminal-based, enterprise-only pricing — excludes retail and small intermediaries" },
  { platform: "WhatsApp / Telegram", gap: "Unregulated tip-sharing, no accountability, no compliance framework" },
];

const Landing = () => {
  usePageMeta({ title: "India's First Financial Network", description: "FindOO is India's first financial network — Financially Social. Connecting verified Issuers, Intermediaries, and Investors across SEBI, RBI, IRDAI, AMFI & PFRDA ecosystems." });

  return (
    <PublicPageLayout>
      {/* Hero */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-16 -right-16 w-[340px] h-[340px] rounded-full border-2 border-primary/[0.06]"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <motion.div
            className="absolute -top-8 -right-8 w-[260px] h-[260px] rounded-full border border-accent/[0.08]"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-1/4 left-[8%] w-4 h-4 rotate-45 border border-primary/[0.12]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.div
            className="absolute top-[38%] left-[5%] w-2.5 h-2.5 rotate-12 bg-accent/[0.1] rounded-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          <motion.div
            className="absolute bottom-12 left-[6%] grid grid-cols-4 gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-primary/[0.08]" />
            ))}
          </motion.div>
          <motion.div
            className="absolute top-[55%] right-[7%] w-px h-24 bg-gradient-to-b from-transparent via-primary/[0.1] to-transparent rotate-[25deg]"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          />
          <motion.div
            className="absolute bottom-20 right-[12%] w-2 h-2 rounded-full bg-accent/20"
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="container relative">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 mb-6 text-sm text-muted-foreground">
              <Landmark className="h-3.5 w-3.5 text-accent" />
              Financially Social — The world's first financial network
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tight text-foreground leading-[1.1] mb-6">
              Not social. Not professional.
              <br />
              <span className="text-accent">Financial.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
              There are social networks. Professional networks. Micro-blogging platforms. Media broadcasters.
              But until now — <span className="font-semibold text-foreground">no financial network.</span>
            </p>
            <p className="text-base text-muted-foreground max-w-xl mx-auto mb-10">
              FindOO is where India's verified Issuers, Intermediaries, and Investors discover,
              connect, and transact — within a regulated, trust-first framework.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/auth?mode=signup">
                  Join FindOO
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link to="/explore">Explore the Platform</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Gap Section */}
      <section className="py-20 border-t border-border">
        <div className="container max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              The gap that no one filled
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              India's financial ecosystem has 10Cr+ demat accounts, 44,000+ AMFI-registered distributors,
              and thousands of SEBI-regulated entities — yet no dedicated platform connects them.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {categoryComparisons.map((item, i) => (
              <motion.div
                key={item.platform}
                className="flex items-start gap-3 p-5 rounded-xl border border-border bg-card"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                <div className="h-2 w-2 rounded-full bg-destructive/60 mt-2 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{item.platform}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.gap}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="mt-10 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={5}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Zap className="h-4 w-4" />
              FindOO fills this gap — purpose-built for finance.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              Built for every participant
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              One platform. Every role. Verified trust at every layer.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                className="rounded-xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${role.color} mb-5`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading text-card-foreground mb-3">{role.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{role.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="container max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              A full-stack financial network
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Not just networking — FindOO is a complete operating system for India's financial professionals.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {platformFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="rounded-xl border border-border bg-card p-6 relative"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                {feat.status === "coming" && (
                  <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    Coming Soon
                  </span>
                )}
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold font-heading text-card-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
                Trust is not optional
              </h2>
              <p className="text-primary-foreground/70 text-lg leading-relaxed">
                Every Issuer and Intermediary goes through verification.
                Upload your SEBI, RBI, or IRDAI registration — earn a verified badge
                that signals credibility to the entire network.
              </p>
            </motion.div>
            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {trustPoints.map((point, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  variants={fadeUp}
                  custom={i + 1}
                >
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-primary-foreground/90">{point}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              The financial network India was waiting for
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Whether you're a retail investor, a SEBI-registered advisor, or a listed company — there's a place for you. Be part of history.
            </p>
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/auth?mode=signup">
                Create Your Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Landing;
