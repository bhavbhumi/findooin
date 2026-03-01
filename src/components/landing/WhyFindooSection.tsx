/**
 * WhyFindooSection — Stacked card deck: Tag → Title → Content → Data badges → BG image right
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ChevronDown, Building2, Users, UserCheck, Briefcase } from "lucide-react";

/* ─── Background Decorations (shown on right side of card) ─── */

function OrbitsBackground() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-1/3 lg:w-[40%] overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-l from-primary/[0.08] via-primary/[0.03] to-transparent" />
      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-48 h-48 opacity-[0.1]" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="100" cy="100" r="65" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeDasharray="3 5" />
        <circle cx="100" cy="100" r="38" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        <circle cx="100" cy="100" r="12" fill="hsl(var(--primary))" opacity="0.3" />
      </svg>
      {[
        { x: "75%", y: "20%", size: 6 },
        { x: "60%", y: "65%", size: 4 },
        { x: "85%", y: "45%", size: 5 },
      ].map((d, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/20"
          style={{ left: d.x, top: d.y, width: d.size, height: d.size }}
          animate={{ y: [0, -6, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
      <svg className="absolute right-6 bottom-6 w-32 h-24 opacity-[0.07]" viewBox="0 0 160 128">
        <line x1="20" y1="100" x2="80" y2="30" stroke="hsl(var(--primary))" strokeWidth="1" />
        <line x1="80" y1="30" x2="140" y2="70" stroke="hsl(var(--primary))" strokeWidth="1" />
        <line x1="140" y1="70" x2="60" y2="90" stroke="hsl(var(--primary))" strokeWidth="1" />
        <circle cx="20" cy="100" r="4" fill="hsl(var(--primary))" />
        <circle cx="80" cy="30" r="5" fill="hsl(var(--primary))" />
        <circle cx="140" cy="70" r="4" fill="hsl(var(--primary))" />
      </svg>
    </div>
  );
}

function SignalBackground() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-1/3 lg:w-[40%] overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-l from-destructive/[0.04] via-primary/[0.03] to-transparent" />
      <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-56 h-40 opacity-[0.06]" viewBox="0 0 280 220">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`d${i}`} x1={i * 40} y1="0" x2={i * 40 - 60} y2="220" stroke="hsl(var(--primary))" strokeWidth="0.8" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 44} x2="280" y2={i * 44} stroke="hsl(var(--primary))" strokeWidth="0.5" />
        ))}
      </svg>
      <svg className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-8 opacity-[0.14]" viewBox="0 0 64 32">
        <line x1="4" y1="16" x2="52" y2="16" stroke="hsl(var(--primary))" strokeWidth="2" />
        <polygon points="48,8 60,16 48,24" fill="hsl(var(--primary))" />
      </svg>
      {[
        { x: "65%", y: "15%", s: 8 },
        { x: "80%", y: "70%", s: 6 },
      ].map((d, i) => (
        <motion.div
          key={i}
          className="absolute bg-primary/15"
          style={{ left: d.x, top: d.y, width: d.s, height: d.s, transform: "rotate(45deg)" }}
          animate={{ rotate: [45, 90, 45], opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function EcosystemBackground() {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-1/3 lg:w-[40%] overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-l from-primary/[0.06] via-transparent to-transparent" />
      <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-44 h-44 opacity-[0.08]" viewBox="0 0 200 200">
        <polygon points="100,10 178,55 178,145 100,190 22,145 22,55" fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
        <polygon points="100,40 152,68 152,132 100,160 48,132 48,68" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="100" cy="100" r="16" fill="hsl(var(--primary))" opacity="0.12" />
        <circle cx="100" cy="100" r="6" fill="hsl(var(--primary))" opacity="0.25" />
      </svg>
      {[0, 60, 120, 180, 240, 300].map((deg, i) => {
        const r = 70;
        const cx = 50 + r * Math.cos((deg * Math.PI) / 180);
        const cy = 50 + r * Math.sin((deg * Math.PI) / 180);
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/20"
            style={{ right: `${8 + cx * 0.25}%`, top: `${15 + cy * 0.45}%`, width: 4, height: 4 }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
          />
        );
      })}
    </div>
  );
}

/* ─── Stat Badge (2-line: icon+value / label) ─── */
const statBadges = [
  { icon: Building2, value: 7000, suffix: "+", label: "Issuers" },
  { icon: Users, value: 35000, suffix: "+", label: "Intermediaries" },
  { icon: UserCheck, value: 7, suffix: " Cr+", label: "Investors" },
  { icon: Briefcase, value: 6, suffix: " Lakh+", label: "Professionals" },
];

function DataStripHorizontal() {
  return (
    <div className="flex items-stretch gap-2 flex-wrap">
      {statBadges.map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div
            key={s.label}
            className="flex items-center gap-2 rounded-lg border border-border/30 bg-card/60 backdrop-blur-sm px-3 py-1.5 min-w-0"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
          >
            <Icon className="h-4 w-4 text-primary/60 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-bold font-heading text-foreground leading-none">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ─── Card Data ─── */
const cards = [
  {
    tag: "Category Creation",
    title: "The Third Network of Your Life",
    content: "You have networks for your social world. You have networks for your professional world. Your financial world is the third — and most consequential — yet it has no dedicated, trusted network. Findoo is not an evolution of existing platforms. It is a new category.",
    bg: <OrbitsBackground />,
  },
  {
    tag: "Purpose Over Generic Noise",
    title: "Built for Financial Signal, Not Social Noise",
    content: "Generic networks dilute expertise, mute informed voices, and blur regulation. Skills are not mapped. Intent is not visible. Discovery is accidental. Findoo is purpose-driven, compliance-aware, and market-neutral — where credibility is structured and meaningful engagement is amplified.",
    bg: <SignalBackground />,
  },
  {
    tag: "Neutral Ecosystem Infrastructure",
    title: "A Neutral Layer for a Vast Ecosystem",
    content: "One ecosystem with a neutral connective layer. Findoo is not an issuer. Findoo is not an intermediary. Findoo is the infrastructure that enables them all.",
    bg: <EcosystemBackground />,
  },
];

/* ─── Stacked Card Carousel ─── */
export default function WhyFindooSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const rotateNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % cards.length);
  }, []);

  const inactiveIndices = cards
    .map((_, i) => i)
    .filter(i => i !== activeIndex);

  return (
    <div>
      {/* Section Header */}
      <motion.div
        className="text-center mb-5 lg:mb-6"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-1.5">
          Why Findoo
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Your financial life deserves its own trusted network.
        </p>
      </motion.div>

      {/* Stacked Deck */}
      <div className="flex flex-col items-center max-w-5xl mx-auto">
        {/* ── Inactive peek strips ── */}
        {inactiveIndices.map((cardIndex, i) => {
          const card = cards[cardIndex];
          const depth = inactiveIndices.length - 1 - i;
          const widthPercent = depth === 1 ? 78 : 88;
          const opacity = depth === 1 ? 0.45 : 0.65;

          return (
            <motion.button
              key={cardIndex}
              layout
              onClick={() => setActiveIndex(cardIndex)}
              className="rounded-t-xl border border-b-0 border-border/40 bg-card/60 backdrop-blur-sm
                cursor-pointer hover:bg-card/80 transition-colors overflow-hidden"
              style={{ width: `${widthPercent}%`, maxWidth: `${widthPercent}%` }}
              animate={{ opacity }}
              transition={{ layout: { type: "spring", stiffness: 400, damping: 30 } }}
            >
              <div className="flex items-center gap-2 px-4 py-2 h-10">
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-primary/[0.07] text-primary text-[9px] font-semibold tracking-wider uppercase">
                  {card.tag}
                </span>
                <span className="text-xs font-medium font-heading text-muted-foreground truncate">
                  {card.title}
                </span>
              </div>
            </motion.button>
          );
        })}

        {/* ── Active card ── */}
        <motion.div
          layout
          className="w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden cursor-pointer relative"
          onClick={rotateNext}
          transition={{ layout: { type: "spring", stiffness: 350, damping: 32, mass: 0.7 } }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Background decoration on right */}
              {cards[activeIndex].bg}

              {/* Content area */}
              <div className="relative z-10 px-5 sm:px-6 py-4 sm:py-5 lg:pr-[42%]">
                {/* Tag */}
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/[0.08] text-primary text-[10px] font-semibold tracking-wider uppercase mb-2">
                  {cards[activeIndex].tag}
                </span>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground leading-snug mb-2.5">
                  {cards[activeIndex].title}
                </h3>

                {/* Content */}
                <p className="text-[13px] sm:text-sm text-muted-foreground leading-relaxed mb-4">
                  {cards[activeIndex].content}
                </p>

                {/* Data strip — horizontal badges */}
                <DataStripHorizontal />
              </div>

              {/* Click hint */}
              <div className="absolute bottom-2 right-3 z-10 flex items-center gap-0.5 text-[10px] text-muted-foreground/40">
                <ChevronDown className="h-3 w-3" />
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-4">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-5 bg-primary"
                  : "w-2 bg-muted-foreground/25 hover:bg-muted-foreground/40"
              }`}
              aria-label={`Go to: ${cards[i].tag}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
