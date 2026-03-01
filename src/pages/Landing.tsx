import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Users, TrendingUp, Building2, UserCheck, BarChart3,
  ArrowRight, CheckCircle2, Briefcase, Calendar, MessageSquare,
  Globe, Zap, Lock, Search, Landmark, Award, Activity, Presentation,
  Clock, Heart, Star, Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import networkBrainHero from "@/assets/network-brain-hero.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const valueProps = [
  {
    title: "Trust and Confidence",
    description: "Thousands trust FindOO for verified, credible connections across India's financial ecosystem — because your growth depends on who you trust.",
  },
  {
    title: "Clarity Over Chaos",
    description: "No anonymous tips, no unverified claims. Just transparent, verified professionals building meaningful financial connections.",
  },
  {
    title: "Beyond Transactions, Towards Transformation",
    description: "Not just a directory — a living financial ecosystem. From verified feeds and jobs to events, we connect every participant seamlessly.",
  },
];

const testimonials = [
  {
    quote: "FindOO has completely transformed how I discover and connect with verified financial professionals. The trust badges give me confidence that I'm dealing with regulated entities.",
    name: "Priya Mehta",
    role: "Wealth Advisor",
    location: "Mumbai",
    rating: 5,
  },
  {
    quote: "As a SEBI-registered RIA, FindOO gives me the credibility platform I was looking for. My client inquiries increased 3x after getting verified on the network.",
    name: "Varun Kapoor",
    role: "Registered Investment Adviser",
    location: "Delhi",
    rating: 5,
  },
  {
    quote: "Finally, a network where I can verify credentials before taking financial advice. The verification engine is a game-changer for retail investors like me.",
    name: "Anita Krishnan",
    role: "Retail Investor",
    location: "Chennai",
    rating: 5,
  },
  {
    quote: "Our NFO reach increased significantly after listing on FindOO's verified directory. The quality of connections is unmatched compared to generic platforms.",
    name: "Rajesh Sharma",
    role: "Product Head, AMC",
    location: "Mumbai",
    rating: 5,
  },
  {
    quote: "The BFSI job board on FindOO is exactly what the industry needed. We found pre-verified candidates with the right certifications in record time.",
    name: "Deepak Malhotra",
    role: "HR Director, NBFC",
    location: "Bangalore",
    rating: 5,
  },
  {
    quote: "What sets FindOO apart is accountability. Every profile, every post comes from a verified entity. No more anonymous noise — just signal.",
    name: "Karan Patel",
    role: "Research Analyst",
    location: "Mumbai",
    rating: 5,
  },
];

const clientSegments = [
  { icon: BarChart3, title: "Retail Investors", desc: "Salaried professionals & business owners building long-term wealth" },
  { icon: TrendingUp, title: "HNI & Institutional", desc: "CXOs, family offices & institutional investors seeking verified access" },
  { icon: Globe, title: "NRI Investors", desc: "Indians abroad connecting with regulated financial intermediaries" },
  { icon: Building2, title: "Corporate & Entities", desc: "AMCs, NBFCs, insurance companies & listed corporates" },
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

const Landing = () => {
  usePageMeta({ title: "India's First Financial Network", description: "FindOO is India's first financial network — Financially Social. Connecting verified Issuers, Intermediaries, and Investors across SEBI, RBI, IRDAI, AMFI & PFRDA ecosystems." });

  return (
    <PublicPageLayout>
      {/* ═══ HERO ═══ */}
      <section className="relative pt-12 pb-10 lg:pt-16 lg:pb-14 overflow-hidden">
        {/* Subtle gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />

        <div className="container relative">
          <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 lg:gap-12 items-center">

            {/* Left — Text */}
            <motion.div
              className="mt-8 lg:mt-0"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={0}
            >
              {/* Tag */}
              <motion.span
                className="inline-block px-3.5 py-1 rounded-full bg-primary/[0.08] text-primary text-xs font-semibold tracking-wide mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Financially Social
              </motion.span>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold font-heading tracking-tight text-foreground leading-[1.08] mb-4">
                Connect. Share. Discover.{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Prosper Together.</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-6">
                Build Trusted Relationships with Verified Professionals and Entities across India's Financial Ecosystem and Turn Insights into Opportunities.
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 mb-8">
                <Button size="lg" className="h-12 px-8 text-base rounded-md" asChild>
                  <Link to="/auth?mode=signup">
                    Join Findoo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base rounded-md" asChild>
                  <Link to="/explore">Explore Platform</Link>
                </Button>
              </div>

              {/* 3 Icon Stat Badges */}
              <div className="flex flex-wrap items-center gap-5 sm:gap-6">
                {[
                  { icon: Lock, label: "End to End", sub: "Encrypted" },
                  { icon: Activity, label: "99.9%", sub: "Uptime" },
                  { icon: Shield, label: "100% Verified", sub: "Network" },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2.5"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/[0.08]">
                      <stat.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-tight">{stat.label}</p>
                      <p className="text-xs text-muted-foreground">{stat.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — Hero Illustration */}
            <motion.div
              className="relative w-full max-w-sm lg:max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative">
                {/* Soft glow */}
                <div className="absolute inset-[10%] bg-gradient-to-br from-primary/[0.08] via-accent/[0.04] to-transparent rounded-full blur-3xl" />
                <img
                  src={networkBrainHero}
                  alt="FindOO — The brain of your financial life"
                  className="relative w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </div>

          {/* ─── Inline Media Bar ─── */}
          <motion.div
            className="mt-10 pt-6 border-t border-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              <span className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mr-2">Featured in</span>
              {["Economic Times", "Mint", "CNBC TV18", "Business Standard", "Forbes India", "Money Control", "NDTV Profit"].map((name) => (
                <span key={name} className="text-sm font-heading font-semibold text-muted-foreground/40 tracking-wide select-none">
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ VALUE PROPOSITIONS — "Achieve and Prosper" style ═══ */}
      <section className="py-14 relative overflow-hidden">
        <div className="container">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">
            {/* Left — Heading + value props */}
            <div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
              >
                <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-3">
                  Achieve and Prosper
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Your financial progress, our priority.
                </p>
              </motion.div>

              <div className="space-y-5">
                {valueProps.map((prop, i) => (
                  <motion.div
                    key={prop.title}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i + 1}
                  >
                    <h3 className="text-xl font-bold font-heading text-foreground mb-2">{prop.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{prop.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right — Brand ecosystem logos / visual */}
            <motion.div
              className="mt-12 lg:mt-0 flex items-center justify-center"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative">
                {/* Orbital ring visual */}
                <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-border relative flex items-center justify-center">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-border/60 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center mb-3">
                        <span className="text-xl font-bold text-primary-foreground font-heading">F</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">FindOO</p>
                    </div>
                  </div>
                  {/* Orbiting role icons */}
                  {[
                    { icon: Building2, angle: 0, color: "bg-issuer text-issuer-foreground" },
                    { icon: UserCheck, angle: 120, color: "bg-intermediary text-intermediary-foreground" },
                    { icon: BarChart3, angle: 240, color: "bg-investor text-investor-foreground" },
                  ].map((item, i) => {
                    const radius = 140;
                    const angleRad = (item.angle * Math.PI) / 180;
                    const x = Math.cos(angleRad) * radius;
                    const y = Math.sin(angleRad) * radius;
                    return (
                      <motion.div
                        key={i}
                        className={`absolute w-11 h-11 rounded-xl ${item.color} flex items-center justify-center shadow-md`}
                        style={{
                          left: `calc(50% + ${x}px - 22px)`,
                          top: `calc(50% + ${y}px - 22px)`,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
                      >
                        <item.icon className="h-5 w-5" />
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* "Explore" link */}
          <motion.div
            className="mt-8 text-center lg:text-left"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              Explore our Platform <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-14 bg-muted/30 border-y border-border relative overflow-hidden">
        <div className="container">
          <motion.div
            className="text-center mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-3">
              Trusted by Thousands
            </h2>
            <p className="text-muted-foreground text-lg">
              Voices from India's financial community
            </p>
          </motion.div>

          {/* Testimonial cards — horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible scrollbar-hide">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="min-w-[280px] lg:min-w-0 snap-start rounded-xl border border-border bg-card p-5 flex flex-col"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                {/* Rating */}
                <div className="flex items-center gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-foreground">{t.rating}.0</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                  <span className="ml-auto text-xs text-muted-foreground">{t.location} 🇮🇳</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHOM WE SERVE ═══ */}
      <section className="py-14 relative overflow-hidden">
        <div className="container">
          <motion.div
            className="text-center mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-3">
              Whom we serve
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for every participant in India's regulated financial ecosystem — a growing network of verified professionals.
            </p>
          </motion.div>

          {/* Client segments */}
          <motion.div
            className="mb-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={1}
          >
            <h3 className="text-lg font-bold font-heading text-foreground mb-2">Participants</h3>
            <p className="text-sm text-muted-foreground mb-4">Connecting verified entities across segments</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {clientSegments.map((seg, i) => (
                <motion.div
                  key={seg.title}
                  className="rounded-xl border border-border bg-card p-5 text-center hover:shadow-md transition-shadow"
                  variants={fadeUp}
                  custom={i + 2}
                >
                  <div className="h-12 w-12 mx-auto rounded-xl bg-primary/[0.08] flex items-center justify-center mb-3">
                    <seg.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h4 className="text-sm font-bold font-heading text-foreground mb-1">{seg.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{seg.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Partners + Principals — side by side cards */}
          <div className="grid md:grid-cols-2 gap-5">
            <motion.div
              className="rounded-xl border border-border bg-card p-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={1}
            >
              <h3 className="text-lg font-bold font-heading text-foreground mb-1">Intermediaries</h3>
              <p className="text-sm text-muted-foreground mb-4">Professionals who grow with the network</p>
              <div className="text-3xl font-bold font-heading text-foreground mb-4">
                <AnimatedCounter value={44000} suffix="+" />
              </div>
              <p className="text-xs text-muted-foreground mb-4">AMFI-registered distributors nationwide</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> MF Distributors & RIAs</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Insurance Agents & Brokers</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Research Analysts & Advisors</li>
              </ul>
              <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-6 hover:underline">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>

            <motion.div
              className="rounded-xl border border-border bg-card p-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
            >
              <h3 className="text-lg font-bold font-heading text-foreground mb-1">Issuers & Principals</h3>
              <p className="text-sm text-muted-foreground mb-4">Institutions who power the ecosystem</p>
              <div className="text-3xl font-bold font-heading text-foreground mb-4">
                <AnimatedCounter value={5000} suffix="+" />
              </div>
              <p className="text-xs text-muted-foreground mb-4">SEBI-regulated entities</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> AMCs & Fund Houses</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Banks, NBFCs & Insurance Companies</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" /> Listed Corporates & Exchanges</li>
              </ul>
              <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-6 hover:underline">
                Learn more <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          </div>

          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button variant="outline" className="rounded-xl" asChild>
              <Link to="/explore">
                Explore Our Network
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══ PLATFORM FEATURES ═══ */}
      <section className="py-14 bg-muted/30 border-y border-border relative overflow-hidden">
        <div className="container max-w-5xl">
          <motion.div
            className="text-center mb-8"
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="rounded-xl border border-border bg-card p-5 relative"
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
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/[0.08] text-primary mb-3">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold font-heading text-card-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA — "Open Account" style ═══ */}
      <section className="py-16 bg-brand text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] rounded-full border border-white/10" />
          <div className="absolute -bottom-16 -right-16 w-[250px] h-[250px] rounded-full border border-white/[0.07]" />
        </div>
        <div className="container relative">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Join India's Financial Network
            </h2>
            <p className="text-white/70 text-lg mb-6">
              Modern and verified tools to Connect, Discover and Grow in India's regulated financial ecosystem.
            </p>
            <Button
              size="lg"
              className="h-13 px-10 text-base rounded-xl bg-white text-foreground hover:bg-white/90"
              asChild
            >
              <Link to="/auth?mode=signup">
                Signup for FREE
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══ PITCH DECKS ═══ */}
      <section className="py-14 relative overflow-hidden">
        <div className="container max-w-5xl">
          <motion.div
            className="text-center mb-8"
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
              See how FindOO serves every participant in India's financial ecosystem.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  className="group block rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${deck.color} mb-4 group-hover:scale-110 transition-transform`}>
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

      {/* ═══ LATEST FROM FINDOO — Blog tease ═══ */}
      <section className="py-14 border-t border-border">
        <div className="container max-w-5xl">
          <motion.div
            className="flex items-center justify-between mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl font-bold font-heading text-foreground">Latest from FindOO</h2>
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all Insights <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { tag: "Platform · Launch", title: "Why India needs a dedicated Financial Network", excerpt: "Social media is noisy. Professional networks are generic. Here's why a purpose-built financial network changes everything.", date: "Feb 2026" },
              { tag: "Trust · Verification", title: "How FindOO's Verification Engine works", excerpt: "From SEBI registration to AMFI credentials — a look at how FindOO verifies every financial professional on the network.", date: "Feb 2026" },
              { tag: "Industry · Insights", title: "The state of BFSI networking in 2026", excerpt: "An analysis of how financial professionals connect, collaborate and discover opportunities in today's fragmented ecosystem.", date: "Feb 2026" },
            ].map((post, i) => (
              <motion.div
                key={i}
                className="rounded-xl border border-border bg-card overflow-hidden hover:shadow-md transition-shadow"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                {/* Placeholder cover */}
                <div className="h-32 bg-gradient-to-br from-primary/[0.08] to-accent/[0.04]" />
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">{post.tag}</p>
                  <h3 className="text-base font-bold font-heading text-foreground mb-2 leading-snug">{post.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <p className="text-xs text-muted-foreground mt-3">{post.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Landing;
