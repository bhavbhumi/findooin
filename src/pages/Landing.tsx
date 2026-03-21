import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield, Users, TrendingUp, Building2, UserCheck, BarChart3,
  ArrowRight, CheckCircle2, Briefcase, Calendar, MessageSquare,
  Globe, Zap, Lock, Search, Landmark, Award, Activity, Presentation,
  Clock, Heart, Sparkles as SparklesIcon
} from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { format } from "date-fns";
import CosmicValueSection from "@/components/landing/CosmicValueSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import WhyFindooSection from "@/components/landing/WhyFindooSection";
import HeroCosmicNetwork from "@/components/landing/HeroCosmicNetwork";
import { Button } from "@/components/ui/button";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import sebiLogo from "@/assets/regulators/sebi-logo.avif";
import amfiLogo from "@/assets/regulators/amfi-logo.jpeg";
import irdaiLogo from "@/assets/regulators/irdai-logo.jpg";
import rbiLogo from "@/assets/regulators/rbi-logo.png";
import pfrdaLogo from "@/assets/regulators/pfrda-logo.svg";
import {
  GlowBlob,
  Sparkles,
  DiamondGrid,
} from "@/components/decorative/SectionDecorations";
import { SpaceDust, CometStreaks, DistantStars } from "@/components/decorative/SpaceElements";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};




const platformFeatures = [
  {
    icon: MessageSquare,
    title: "Verified Feed",
    desc: "Market commentary, research notes, polls & surveys — from verified professionals with drafts, scheduling & post analytics.",
    status: "live",
  },
  {
    icon: Users,
    title: "Trust Network",
    desc: "Connect with credential-verified professionals. Follow, connect, message — with granular tab privacy controls.",
    status: "live",
  },
  {
    icon: Briefcase,
    title: "BFSI Job Board",
    desc: "India's only BFSI-focused job board with role-based dashboards, applicant tracking & employer insights.",
    status: "live",
  },
  {
    icon: Shield,
    title: "Verification Engine",
    desc: "Upload regulatory credentials. Get verified against SEBI, RBI, IRDAI, AMFI & PFRDA databases. Earn a trust badge.",
    status: "live",
  },
  {
    icon: Calendar,
    title: "Events & Webinars",
    desc: "Investor meets, AGMs, industry webinars — discover, host & manage events with check-in, speakers & organizer dashboards.",
    status: "live",
  },
  {
    icon: Award,
    title: "Gamification & XP",
    desc: "Earn XP for every action, level up through 5 tiers, unlock profile flair, complete weekly challenges & climb the leaderboard.",
    status: "live",
  },
  {
    icon: Globe,
    title: "Product & Service Showcase",
    desc: "List financial products or professional services with reviews, comparisons, enquiry workflows & lead capture.",
    status: "live",
  },
  {
    icon: Lock,
    title: "Vault & Digital Card",
    desc: "Secure document storage with share links, vCard downloads & QR-powered digital business cards for networking.",
    status: "live",
  },
];

const Landing = () => {
  const { data: blogPosts } = useBlogPosts(3);

  usePageMeta({ title: "India's First Financial Network", description: "FindOO is India's first financial network — Financially Social. Connecting verified Issuers, Intermediaries, and Investors across SEBI, RBI, IRDAI, AMFI & PFRDA ecosystems.", path: "/" });

  return (
    <PublicPageLayout>
      {/* ═══ HERO ═══ */}
      <section className="relative pt-8 pb-6 lg:pt-10 lg:pb-8 overflow-hidden space-void-blue">
        {/* Subtle glow — no geometric mesh */}
        <GlowBlob position="top-left" color="primary" size="lg" />
        <GlowBlob position="bottom-right" color="accent" size="md" />
        <CometStreaks count={4} />
        <SpaceDust count={25} />
        <DistantStars count={15} />

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

              <h1 className="text-[1.7rem] sm:text-4xl lg:text-5xl xl:text-[3.5rem] font-bold font-heading tracking-tight text-foreground leading-[1.08] mb-4">
                India's First{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Financial Network</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed mb-6">
                Where India's entire BFSI ecosystem connects — verified, compliant, and trusted by design.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <Button size="lg" className="h-11 px-6 sm:px-8 text-sm sm:text-base rounded-md" asChild>
                    <Link to="/auth?mode=signup">
                      Join FindOO
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-11 px-6 sm:px-8 text-sm sm:text-base rounded-md" asChild>
                    <Link to="/explore">Explore Platform</Link>
                  </Button>
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-medium tracking-wide">It's free forever — no credit card required</span>
              </div>

              {/* 3 Icon Stat Badges */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
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
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/[0.08]">
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

            {/* Right — Hero Cosmic Network */}
            <motion.div
              className="relative w-full max-w-sm lg:max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <HeroCosmicNetwork />
            </motion.div>
          </div>

          {/* ─── Regulator Strip ─── */}
          <motion.div
            className="mt-8 pt-5 border-t border-border/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex items-center justify-center gap-3 sm:gap-5 flex-nowrap">
              <span className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-widest whitespace-nowrap hidden sm:block">
                Built for India's regulated BFSI ecosystem
              </span>
              <span className="hidden sm:block w-px h-4 bg-border/40" />
              {[
                { src: sebiLogo, name: "SEBI" },
                { src: amfiLogo, name: "AMFI" },
                { src: irdaiLogo, name: "IRDAI" },
                { src: rbiLogo, name: "RBI" },
                { src: pfrdaLogo, name: "PFRDA" },
              ].map((reg) => (
                <div key={reg.name} className="flex items-center gap-1.5 select-none">
                  <img
                    src={reg.src}
                    alt={`${reg.name} logo`}
                    className="h-8 w-auto max-w-[36px] object-contain opacity-50 dark:opacity-35 grayscale dark:invert"
                  />
                  <span className="text-[11px] font-heading font-semibold text-muted-foreground/50 tracking-wide">
                    {reg.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ VALUE PROPOSITIONS — Cosmic Network ═══ */}
      <section className="py-8 lg:py-10 relative overflow-hidden space-nebula-teal">
        <SpaceDust count={12} />
        <div className="container relative">
          <CosmicValueSection />
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-8 lg:py-10 relative overflow-hidden space-dust-gold">
        <DistantStars count={8} />
        <DiamondGrid className="bottom-8 left-8 hidden lg:block" />
        <div className="container relative">
          <TestimonialsSection />
        </div>
      </section>

      {/* ═══ WHY FINDOO ═══ */}
      <section className="py-8 lg:py-10 relative overflow-hidden space-emerald">
        <GlowBlob position="top-left" color="primary" size="lg" />
        <div className="container max-w-4xl relative">
          <WhyFindooSection />
        </div>
      </section>


      {/* ═══ PLATFORM FEATURES ═══ */}
      <section className="py-8 lg:py-10 relative overflow-hidden space-void-blue">
        <SpaceDust count={15} />
        <GlowBlob position="center" color="primary" size="xl" className="opacity-50" />
        
        
        <div className="container max-w-5xl relative">
          <motion.div
            className="text-center mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-3">
              A full-stack financial network
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              Not just networking — FindOO is a complete operating system for India's financial professionals.
            </p>
          </motion.div>
          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible md:pb-0">
            {platformFeatures.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="min-w-[260px] snap-start md:min-w-0 rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5 relative hover:shadow-lg hover:border-primary/15 transition-all duration-300 group"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                {feat.status === "coming" && (
                  <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/10 text-gold">
                    Coming Soon
                  </span>
                )}
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/[0.12] to-primary/[0.04] text-primary mb-3 group-hover:shadow-md group-hover:shadow-primary/10 transition-shadow">
                  <feat.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold font-heading text-card-foreground mb-2">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA — "Signup for FREE" with celebrating gradient ═══ */}
      <section className="py-10 lg:py-12 relative overflow-hidden">
        {/* Multi-layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-[hsl(var(--accent))]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/[0.05]" />

        {/* Celebrating decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Radiating rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.06]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.08]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-white/[0.10]" />

          {/* Confetti-style floating shapes */}
          <motion.div
            className="absolute top-[15%] left-[10%] w-3 h-3 rounded-full bg-gold/40"
            animate={{ y: [0, -12, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[20%] right-[12%] w-2.5 h-2.5 rounded-sm bg-white/20 rotate-45"
            animate={{ y: [0, -16, 0], rotate: [45, 225, 405] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-[20%] left-[18%] w-2 h-2 rounded-full bg-gold/30"
            animate={{ y: [0, -10, 0], x: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute bottom-[25%] right-[15%] w-3.5 h-1 rounded-full bg-white/15 rotate-12"
            animate={{ y: [0, -14, 0], rotate: [12, 192, 372] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
          />
          <motion.div
            className="absolute top-[40%] left-[5%] w-1.5 h-4 rounded-full bg-gold/20 rotate-[-20deg]"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          />
          <motion.div
            className="absolute top-[35%] right-[8%] w-2 h-2 rounded-full bg-white/25"
            animate={{ scale: [1, 1.4, 1], opacity: [0.25, 0.5, 0.25] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
          />

          {/* Gold glow blobs */}
          <div className="absolute -top-16 right-1/4 w-[280px] h-[280px] rounded-full bg-gold/[0.08] blur-3xl" />
          <div className="absolute -bottom-20 left-1/3 w-[320px] h-[320px] rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <Sparkles />

        <div className="container relative">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            {/* Celebrating icon cluster */}
            <motion.div
              className="flex items-center justify-center gap-2 mb-5"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <SparklesIcon className="h-5 w-5 text-gold" />
              <span className="text-sm font-semibold text-white/80 tracking-wide uppercase">It's Free Forever</span>
              <SparklesIcon className="h-5 w-5 text-gold" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-4 leading-tight">
              Join India's Financial Network
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
              Modern and verified tools to Connect, Discover and Grow in India's regulated financial ecosystem.
            </p>

            {/* Gradient-bordered CTA button */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="h-14 px-12 text-base font-bold rounded-xl bg-gradient-to-r from-gold to-gold/80 text-primary-foreground hover:from-gold/90 hover:to-gold/70 shadow-xl shadow-gold/20 border border-gold/30"
                asChild
              >
                <Link to="/auth?mode=signup">
                  Signup for FREE
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              className="mt-6 flex items-center justify-center gap-4 text-white/50 text-xs"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> No credit card</span>
              <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Secure & encrypted</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> 100% verified</span>
            </motion.div>
          </motion.div>
        </div>
      </section>


      {/* ═══ LATEST FROM FINDOO — Blog tease ═══ */}
      <section className="py-8 lg:py-10 relative overflow-hidden space-dust-gold">
        <GlowBlob position="bottom-right" color="primary" size="md" />
        
        <div className="container max-w-5xl relative">
          <motion.div
            className="flex items-center justify-between mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground">Latest from FindOO</h2>
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all Insights <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </motion.div>
          {(!blogPosts || blogPosts.length === 0) ? (
            <div className="md:col-span-3 text-center py-8">
              <p className="text-muted-foreground text-sm">Insights coming soon. Stay tuned!</p>
            </div>
          ) : null}
          {/* Horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {(blogPosts ?? []).map((post, i) => (
              <motion.div
                key={post.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="block rounded-xl border border-border bg-card/80 backdrop-blur-sm overflow-hidden hover:shadow-lg hover:border-primary/10 transition-all duration-300 group"
                >
                  {/* Cover image or gradient placeholder */}
                  <div className="h-36 bg-gradient-to-br from-primary/[0.1] via-accent/[0.05] to-muted/30 relative overflow-hidden">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 opacity-[0.06]">
                        <svg className="w-full h-full" viewBox="0 0 300 130" preserveAspectRatio="none">
                          <line x1="30" y1="20" x2="120" y2="60" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                          <line x1="120" y1="60" x2="250" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                          <line x1="80" y1="100" x2="200" y2="110" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                          <circle cx="30" cy="20" r="2" fill="currentColor" className="text-primary" />
                          <circle cx="120" cy="60" r="2.5" fill="currentColor" className="text-primary" />
                          <circle cx="250" cy="30" r="2" fill="currentColor" className="text-primary" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-2 capitalize">{post.category} · {post.read_time_minutes} min read</p>
                    <h3 className="text-base font-bold font-heading text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-3">{post.published_at ? format(new Date(post.published_at), "MMM yyyy") : ""}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Landing;
