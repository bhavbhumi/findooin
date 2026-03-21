import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

type RoleType = "issuer" | "intermediary" | "investor";

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  roleType: RoleType;
}

const testimonials: Testimonial[] = [
  {
    quote: "findoo has completely transformed how I discover and connect with verified financial professionals. The trust badges give me confidence that I'm dealing with regulated entities.",
    name: "Priya Mehta",
    role: "Wealth Advisor",
    location: "Mumbai",
    rating: 5,
    roleType: "intermediary",
  },
  {
    quote: "As a SEBI-registered RIA, findoo gives me the credibility platform I was looking for. My client inquiries increased 3x after getting verified on the network.",
    name: "Varun Kapoor",
    role: "Registered Investment Adviser",
    location: "Delhi",
    rating: 5,
    roleType: "intermediary",
  },
  {
    quote: "Finally, a network where I can verify credentials before taking financial advice. The verification engine is a game-changer for retail investors like me.",
    name: "Anita Krishnan",
    role: "Retail Investor",
    location: "Chennai",
    rating: 5,
    roleType: "investor",
  },
  {
    quote: "Our NFO reach increased significantly after listing on findoo's verified directory. The quality of connections is unmatched compared to generic platforms.",
    name: "Rajesh Sharma",
    role: "Product Head, AMC",
    location: "Mumbai",
    rating: 5,
    roleType: "issuer",
  },
  {
    quote: "The BFSI job board on findoo is exactly what the industry needed. We found pre-verified candidates with the right certifications in record time.",
    name: "Deepak Malhotra",
    role: "HR Director, NBFC",
    location: "Bangalore",
    rating: 5,
    roleType: "issuer",
  },
  {
    quote: "What sets findoo apart is accountability. Every profile, every post comes from a verified entity. No more anonymous noise — just signal.",
    name: "Karan Patel",
    role: "Research Analyst",
    location: "Mumbai",
    rating: 5,
    roleType: "investor",
  },
];

/* ── Role gradient configs ── */
const roleGradients: Record<RoleType, { from: string; via: string; to: string; accent: string }> = {
  issuer: {
    from: "hsl(var(--issuer))",
    via: "hsl(165 50% 30%)",
    to: "hsl(200 45% 20%)",
    accent: "hsl(var(--issuer) / 0.15)",
  },
  intermediary: {
    from: "hsl(var(--intermediary))",
    via: "hsl(240 60% 40%)",
    to: "hsl(260 50% 25%)",
    accent: "hsl(var(--intermediary) / 0.15)",
  },
  investor: {
    from: "hsl(var(--investor))",
    via: "hsl(45 65% 40%)",
    to: "hsl(20 50% 25%)",
    accent: "hsl(var(--investor) / 0.15)",
  },
};

/* ── Generative network art SVG ── */
function NetworkArt({ roleType, seed }: { roleType: RoleType; seed: number }) {
  const g = roleGradients[roleType];
  const gradId = `net-grad-${seed}`;

  // Generate deterministic nodes
  const rng = (s: number) => {
    let x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const nodes: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < 28; i++) {
    nodes.push({
      x: rng(seed + i * 7) * 300,
      y: rng(seed + i * 13 + 3) * 120,
      r: 1.2 + rng(seed + i * 11) * 2.5,
    });
  }

  // Generate connections between nearby nodes
  const connections: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80 && connections.length < 40) {
        connections.push({ x1: nodes[i].x, y1: nodes[i].y, x2: nodes[j].x, y2: nodes[j].y });
      }
    }
  }

  return (
    <svg
      viewBox="0 0 300 120"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={g.from} stopOpacity="0.7" />
          <stop offset="50%" stopColor={g.via} stopOpacity="0.5" />
          <stop offset="100%" stopColor={g.to} stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id={`${gradId}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={g.from} stopOpacity="0.3" />
          <stop offset="100%" stopColor={g.to} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dark base */}
      <rect width="300" height="120" fill={`url(#${gradId})`} />

      {/* Glow cluster */}
      <circle cx={150 + (rng(seed + 99) - 0.5) * 100} cy={60} r="60" fill={`url(#${gradId}-glow)`} />

      {/* Connection lines */}
      {connections.map((c, i) => (
        <line
          key={i}
          x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="0.5"
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill="rgba(255,255,255,0.6)"
          opacity={0.4 + rng(seed + i * 5) * 0.6}
        />
      ))}
    </svg>
  );
}

/* ── Role label badge ── */
const roleBadgeClasses: Record<RoleType, string> = {
  issuer: "bg-issuer/15 text-issuer border-issuer/25",
  intermediary: "bg-intermediary/15 text-intermediary border-intermediary/25",
  investor: "bg-investor/15 text-investor border-investor/25",
};

const roleLabels: Record<RoleType, string> = {
  issuer: "Issuer",
  intermediary: "Intermediary",
  investor: "Investor",
};

/* ── Testimonial Card ── */
function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  return (
    <motion.div
      className="min-w-[300px] sm:min-w-[320px] lg:min-w-0 snap-start rounded-xl border border-border bg-card overflow-hidden flex flex-col hover:shadow-xl hover:border-primary/10 transition-all duration-300 group"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1, y: 0,
          transition: { delay: index * 0.1, duration: 0.5, ease: "easeOut" },
        },
      }}
    >
      {/* Network art header */}
      <div className="relative h-24 overflow-hidden">
        <NetworkArt roleType={t.roleType} seed={index * 37 + 42} />
        {/* Role badge overlay */}
        <div className="absolute top-3 left-3">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border backdrop-blur-sm ${roleBadgeClasses[t.roleType]}`}>
            {roleLabels[t.roleType]}
          </span>
        </div>
        {/* Quote mark overlay */}
        <div className="absolute bottom-2 right-3 text-white/20 text-4xl font-serif leading-none select-none">"</div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-3">
          {Array.from({ length: t.rating }).map((_, s) => (
            <Star key={s} className="h-3.5 w-3.5 fill-gold text-gold" />
          ))}
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">
          "{t.quote}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-3 pt-3 border-t border-border/60">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {t.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
            <p className="text-xs text-muted-foreground truncate">{t.role} · {t.location}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Section ── */
const PAGE_SIZE = 3;

export default function TestimonialsSection() {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(testimonials.length / PAGE_SIZE);

  const next = useCallback(() => setPage((p) => (p + 1) % totalPages), [totalPages]);
  const prev = useCallback(() => setPage((p) => (p - 1 + totalPages) % totalPages), [totalPages]);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const visible = testimonials.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      {/* Section header */}
      <motion.div
        className="text-center mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 24 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-1">
          Gaining Trust
        </h2>
        <p className="text-muted-foreground text-base">
          Voices from the Ecosystem
        </p>
      </motion.div>

      {/* Desktop: animated grid, Tablet: 2 cols, Mobile: 1 col */}
      <div className="relative">
        {/* Desktop/Tablet grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((t, i) => (
              <motion.div
                key={`${page}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <TestimonialCard t={t} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:hidden scrollbar-hide">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} index={i} />
          ))}
        </div>

        {/* Carousel controls (desktop/tablet) */}
        <div className="hidden sm:flex items-center justify-center gap-3 mt-6">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={prev}
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === page ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/25"
                }`}
                onClick={() => setPage(i)}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={next}
            aria-label="Next testimonials"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* CTA Footer */}
      <motion.div
        className="text-center mt-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
      >
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors story-link"
        >
          View all voices
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </>
  );
}
