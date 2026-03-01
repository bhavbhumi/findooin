import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Users, TrendingUp, Building2, UserCheck, BarChart3,
  ArrowRight, CheckCircle2, Briefcase, Calendar, MessageSquare,
  Globe, Zap, Lock, Search, Landmark, Award, Activity, Presentation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import networkBrainBW from "@/assets/network-brain-bw.png";

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
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.06] to-transparent" />
        
        {/* Network Brain BW background */}
        <motion.div
          className="absolute right-0 top-0 w-[55%] h-full pointer-events-none opacity-[0.07] dark:opacity-[0.04]"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.07, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <img src={networkBrainBW} alt="" className="w-full h-full object-contain object-right-top" aria-hidden="true" />
        </motion.div>
        {/* Decorative elements — VISIBLE */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large gradient blob top-right */}
          <div className="absolute -top-32 -right-32 w-[500px] h-[400px] bg-gradient-to-bl from-primary/[0.1] via-accent/[0.05] to-transparent rounded-full blur-3xl" />
          {/* Concentric rings */}
          <motion.div
            className="absolute -top-16 -right-16 w-[340px] h-[340px] rounded-full border-2 border-primary/20 dark:border-accent/25"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <motion.div
            className="absolute -top-8 -right-8 w-[260px] h-[260px] rounded-full border border-primary/15 dark:border-accent/20"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-[30px] right-[30px] w-[180px] h-[180px] rounded-full border border-primary/10"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
          />
          {/* Diamond shapes left */}
          <motion.div
            className="absolute top-1/4 left-[8%] w-6 h-6 rotate-45 border-2 border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.div
            className="absolute top-[38%] left-[5%] w-4 h-4 rotate-12 bg-accent/15 rounded-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />
          {/* Dot grid — left */}
          <motion.div
            className="absolute bottom-12 left-[6%] grid grid-cols-5 gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/15" />
            ))}
          </motion.div>
          {/* Gradient line */}
          <motion.div
            className="absolute top-[55%] right-[7%] w-px h-32 bg-gradient-to-b from-transparent via-primary/25 to-transparent rotate-[25deg]"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          />
          {/* Pulsing accent dot */}
          <motion.div
            className="absolute bottom-20 right-[12%] w-3 h-3 rounded-full bg-accent/30"
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Bottom-left gradient blob */}
          <div className="absolute bottom-0 left-0 w-[350px] h-[200px] bg-gradient-to-tr from-primary/[0.06] to-transparent rounded-full blur-3xl" />
          {/* Cross accent right */}
          <motion.div
            className="absolute top-[20%] right-[15%] w-8 h-px bg-primary/20"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          />
          <motion.div
            className="absolute top-[20%] right-[15%] w-px h-8 bg-primary/20 -translate-x-[15px]"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
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

          {/* Social Proof Stats */}
          <motion.div
            className="max-w-3xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            {[
              { value: 10, suffix: "Cr+", label: "Demat Accounts", icon: BarChart3 },
              { value: 44000, suffix: "+", label: "AMFI Distributors", icon: UserCheck },
              { value: 5000, suffix: "+", label: "SEBI Entities", icon: Shield },
              { value: 100, suffix: "%", label: "Verified Network", icon: CheckCircle2 },
            ].map((stat, i) => (
              <div key={i} className="text-center rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
                <stat.icon className="h-4 w-4 mx-auto mb-2 text-accent" />
                <div className="text-2xl sm:text-3xl font-bold font-heading text-foreground">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            {[
              { icon: Shield, label: "SEBI Ready" },
              { icon: Lock, label: "End-to-End Encrypted" },
              { icon: Activity, label: "99.9% Uptime" },
            ].map((badge, i) => (
              <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-muted-foreground">
                <badge.icon className="h-3 w-3 text-primary" />
                {badge.label}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* The Gap Section */}
      <section className="py-20 border-t border-border relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[400px] h-[300px] bg-gradient-to-br from-destructive/[0.04] to-transparent rounded-full blur-3xl" />
          <motion.div
            className="absolute top-16 right-[8%] w-16 h-16 rounded-full border-2 border-primary/15"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute bottom-12 left-[5%] w-5 h-5 rotate-45 bg-primary/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.div
            className="absolute top-1/2 right-[4%] grid grid-cols-4 gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/12" />
            ))}
          </motion.div>
        </div>
        <div className="container max-w-5xl relative">
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
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent/15 text-accent text-sm font-semibold">
              <Zap className="h-4 w-4" />
              FindOO fills this gap — purpose-built for finance.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-20 right-0 w-[400px] h-[300px] bg-gradient-to-tl from-primary/[0.06] to-transparent rounded-full blur-3xl" />
          <motion.div
            className="absolute top-20 left-[4%] w-20 h-20 rounded-full border border-accent/15"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="absolute bottom-16 right-[6%] w-4 h-4 rotate-45 border-2 border-primary/15"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
        </div>
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
      <section className="py-20 border-t border-border bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-gradient-to-bl from-primary/[0.05] to-transparent rounded-full blur-3xl" />
          <motion.div
            className="absolute bottom-8 left-[3%] grid grid-cols-6 gap-2"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-primary/12" />
            ))}
          </motion.div>
          <motion.div
            className="absolute top-24 right-[5%] w-8 h-8 rotate-12 border border-accent/15 rounded-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </div>
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
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent mb-4">
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
      <section className="py-20 bg-brand text-white relative overflow-hidden">
        {/* Trust section decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full border border-white/10" />
          <div className="absolute -bottom-16 -right-16 w-[250px] h-[250px] rounded-full border border-white/[0.07]" />
          <div className="absolute top-1/3 right-[8%] w-4 h-4 rotate-45 bg-white/10" />
          <div className="absolute bottom-12 left-[10%] grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-white/15" />
            ))}
          </div>
        </div>
        <div className="container relative">
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
              <p className="text-white/70 text-lg leading-relaxed">
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
                  <span className="text-white/90">{point}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pitch Decks Section */}
      <section className="py-20 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-[400px] h-[250px] bg-gradient-to-tr from-primary/[0.05] to-transparent rounded-full blur-3xl" />
          <motion.div
            className="absolute top-12 right-[6%] w-12 h-12 rounded-full border border-accent/15"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute bottom-20 left-[4%] w-3 h-3 rotate-45 bg-primary/15"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
        </div>
        <div className="container max-w-5xl">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 mb-4 text-sm text-muted-foreground">
              <Presentation className="h-3.5 w-3.5 text-accent" />
              Explore our pitch decks
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              Four perspectives. One platform.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              See how FindOO serves every participant in India's financial ecosystem — from regulators to retail investors.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Landmark, title: "Regulators", desc: "Compliance by design", color: "bg-primary/10 text-primary", to: "/pitch/regulator" },
              { icon: Building2, title: "Issuers", desc: "Verified distribution", color: "bg-issuer/10 text-issuer", to: "/pitch/issuer" },
              { icon: UserCheck, title: "Intermediaries", desc: "Professional network", color: "bg-intermediary/10 text-intermediary", to: "/pitch/intermediary" },
              { icon: BarChart3, title: "Investors", desc: "Trust-first discovery", color: "bg-investor/10 text-investor", to: "/pitch/investor" },
            ].map((deck, i) => (
              <motion.div
                key={deck.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                <Link
                  to={deck.to}
                  className="group block rounded-xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${deck.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <deck.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold font-heading text-card-foreground mb-1">{deck.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{deck.desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View Deck <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Visual Section */}
      <section className="py-20 border-t border-border relative overflow-hidden">
        {/* Decorative geometric bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 left-0 w-[450px] h-[350px] bg-gradient-to-br from-primary/[0.07] to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-16 right-0 w-[350px] h-[250px] bg-gradient-to-tl from-accent/[0.05] to-transparent rounded-full blur-3xl" />
          <motion.div
            className="absolute top-12 left-[8%] w-48 h-48 rounded-full border-2 border-primary/15"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2 }}
          />
          <motion.div
            className="absolute bottom-16 right-[10%] w-32 h-32 rounded-full border border-accent/15"
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          />
          <motion.div
            className="absolute top-1/3 right-[5%] grid grid-cols-5 gap-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/15" />
            ))}
          </motion.div>
          <motion.div
            className="absolute bottom-1/4 left-[15%] w-8 h-8 rotate-45 border-2 border-primary/15"
            initial={{ opacity: 0, rotate: 0 }}
            whileInView={{ opacity: 1, rotate: 45 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.div
            className="absolute top-[60%] left-[5%] w-3 h-3 rounded-full bg-accent/25"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>

        <div className="container max-w-5xl relative">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              How the ecosystem connects
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              FindOO is the connective tissue between India's financial participants — enabling verified discovery, trusted communication, and compliant collaboration.
            </p>
          </motion.div>

          {/* Ecosystem visual — interconnected nodes */}
          <motion.div
            className="relative max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            <div className="grid grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: Shield, label: "Regulators", sub: "SEBI · RBI · IRDAI", color: "border-primary/30 bg-primary/[0.06]" },
                { icon: Building2, label: "Issuers", sub: "AMCs · NBFCs · Banks", color: "border-issuer/30 bg-issuer/[0.06]" },
                { icon: UserCheck, label: "Intermediaries", sub: "MFDs · RIAs · Agents", color: "border-intermediary/30 bg-intermediary/[0.06]" },
              ].map((node, i) => (
                <motion.div
                  key={node.label}
                  className={`rounded-2xl border-2 ${node.color} p-5 sm:p-6 text-center`}
                  variants={fadeUp}
                  custom={i + 2}
                >
                  <node.icon className="h-7 w-7 mx-auto mb-3 text-foreground/70" />
                  <p className="text-sm font-bold font-heading text-foreground">{node.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{node.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Center node */}
            <motion.div
              className="mx-auto -mt-4 mb-4 w-fit"
              variants={fadeUp}
              custom={5}
            >
              <div className="relative z-10 rounded-full bg-brand px-6 py-3 text-center shadow-lg">
                <p className="text-sm font-bold text-white tracking-wide">FindOO</p>
                <p className="text-[10px] text-white/70 uppercase tracking-widest">Financially Social</p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-md mx-auto">
              {[
                { icon: BarChart3, label: "Investors", sub: "Retail · HNI · NRI", color: "border-investor/30 bg-investor/[0.06]" },
                { icon: Globe, label: "Ecosystem", sub: "Events · Jobs · Directory", color: "border-accent/20 bg-accent/[0.04]" },
              ].map((node, i) => (
                <motion.div
                  key={node.label}
                  className={`rounded-2xl border-2 ${node.color} p-5 sm:p-6 text-center`}
                  variants={fadeUp}
                  custom={i + 6}
                >
                  <node.icon className="h-7 w-7 mx-auto mb-3 text-foreground/70" />
                  <p className="text-sm font-bold font-heading text-foreground">{node.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{node.sub}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-16 border-t border-border bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[350px] h-[300px] bg-gradient-to-bl from-primary/[0.06] to-transparent rounded-full blur-3xl" />
          <motion.div
            className="absolute bottom-8 left-[6%] w-10 h-10 rounded-full border border-primary/15"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          />
          <motion.div
            className="absolute top-12 left-[50%] w-3 h-3 rotate-45 bg-accent/15"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
        <div className="container max-w-4xl relative">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { quote: "Finally, a network where I can verify who I'm talking to before sharing market views.", persona: "— SEBI-registered RIA, Mumbai" },
                { quote: "Our NFO reach increased 3x after listing on FindOO's verified directory.", persona: "— Product Head, mid-size AMC" },
                { quote: "As a retail investor, I feel safer knowing every advisor has verified credentials.", persona: "— HNI Investor, Bengaluru" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="rounded-xl border border-border bg-card p-6 text-left"
                  variants={fadeUp}
                  custom={i + 1}
                >
                  <p className="text-sm text-muted-foreground leading-relaxed italic mb-4">"{item.quote}"</p>
                  <p className="text-xs font-medium text-foreground/70">{item.persona}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
