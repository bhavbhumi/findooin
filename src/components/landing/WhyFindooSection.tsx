/**
 * WhyFindooSection — "Why Findoo" with stacked card carousel / deck rotation
 */
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ChevronDown } from "lucide-react";
import findooLogoIcon from "@/assets/findoo-logo-icon.png";

/* ─── SVG Illustrations (kept compact) ─── */

function ConcentricOrbitsArt() {
  const cx = 200, cy = 100;
  return (
    <svg viewBox="0 0 400 200" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="orb-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="fin-orbit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="url(#orb-bg)" />
      <circle cx={cx} cy={cy} r={85} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeOpacity="0.12" strokeDasharray="4 6" />
      <circle cx={cx} cy={cy} r={58} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeOpacity="0.18" strokeDasharray="4 6" />
      <motion.circle cx={cx} cy={cy} r={30} fill="none" stroke="url(#fin-orbit)" strokeWidth="2.5" strokeOpacity="0.8"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} />
      <text x={cx + 62} y={cy - 48} fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.5">Social</text>
      <text x={cx + 42} y={cy - 28} fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.6">Professional</text>
      <text x={cx + 22} y={cy - 6} fontSize="9" fill="hsl(var(--primary))" opacity="0.9" fontWeight="600">Financial</text>
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const x = cx + 85 * Math.cos((deg * Math.PI) / 180);
        const y = cy + 85 * Math.sin((deg * Math.PI) / 180);
        return <circle key={i} cx={x} cy={y} r={3} fill="hsl(var(--muted-foreground))" opacity="0.2" />;
      })}
      {[0, 120, 240].map((deg, i) => {
        const x = cx + 30 * Math.cos((deg * Math.PI) / 180);
        const y = cy + 30 * Math.sin((deg * Math.PI) / 180);
        return <motion.circle key={i} cx={x} cy={y} r={5} fill="hsl(var(--primary))" opacity="0.7"
          initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 + i * 0.15 }} />;
      })}
      <circle cx={cx} cy={cy} r={8} fill="hsl(var(--primary))" opacity="0.15" />
      <circle cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" opacity="0.5" />
    </svg>
  );
}

function NoiseToStructureArt() {
  const chaosNodes = Array.from({ length: 16 }, (_, i) => ({
    x: 20 + Math.sin(i * 7.3) * 55 + 45,
    y: 20 + Math.cos(i * 5.1) * 60 + 45,
  }));
  const structuredNodes = [
    { x: 270, y: 40 }, { x: 310, y: 40 }, { x: 350, y: 40 },
    { x: 250, y: 75 }, { x: 290, y: 75 }, { x: 330, y: 75 }, { x: 370, y: 75 },
    { x: 270, y: 110 }, { x: 310, y: 110 }, { x: 350, y: 110 },
    { x: 250, y: 145 }, { x: 290, y: 145 }, { x: 330, y: 145 }, { x: 370, y: 145 },
    { x: 270, y: 180 }, { x: 310, y: 180 }, { x: 350, y: 180 },
  ];
  return (
    <svg viewBox="0 0 400 200" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="ns-bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.04" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
        </linearGradient>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--primary))" opacity="0.6" />
        </marker>
      </defs>
      <rect width="400" height="200" fill="url(#ns-bg)" />
      {chaosNodes.slice(0, 10).map((n, i) => {
        const t = chaosNodes[(i + 3) % chaosNodes.length];
        return <line key={i} x1={n.x} y1={n.y} x2={t.x} y2={t.y} stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeOpacity="0.15" />;
      })}
      {chaosNodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={2.5} fill="hsl(var(--muted-foreground))" opacity={0.2 + (i % 3) * 0.1} />)}
      <text x="60" y="195" fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.4" textAnchor="middle">Noise</text>
      <motion.path d="M 180 100 L 220 100" stroke="hsl(var(--primary))" strokeWidth="2" strokeOpacity="0.4" fill="none" markerEnd="url(#arrowhead)"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.5 }} />
      {structuredNodes.map((n, i) =>
        structuredNodes.slice(i + 1).filter(t => Math.sqrt((n.x - t.x) ** 2 + (n.y - t.y) ** 2) < 50).map((t, j) => (
          <motion.line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={t.x} y2={t.y}
            stroke="hsl(var(--primary))" strokeWidth="0.8" strokeOpacity="0.2"
            initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: 0.8 + i * 0.03 }} />
        ))
      )}
      {structuredNodes.map((n, i) => (
        <motion.circle key={i} cx={n.x} cy={n.y} r={4} fill="hsl(var(--primary))" opacity="0.6"
          initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1 + i * 0.04 }} />
      ))}
      <text x="310" y="195" fontSize="8" fill="hsl(var(--primary))" opacity="0.6" textAnchor="middle">Signal</text>
    </svg>
  );
}

function NeutralCoreArt() {
  const cx = 200, cy = 100;
  const clusters = [
    { label: "Issuers", color: "var(--issuer)", angle: -90, radius: 68, count: 6 },
    { label: "Intermediaries", color: "var(--intermediary)", angle: 150, radius: 68, count: 7 },
    { label: "Investors", color: "var(--investor)", angle: 30, radius: 68, count: 6 },
  ];
  return (
    <svg viewBox="0 0 400 200" className="w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="400" height="200" fill="url(#core-glow)" />
      {clusters.map((cluster, ci) => {
        const clCx = cx + cluster.radius * Math.cos((cluster.angle * Math.PI) / 180);
        const clCy = cy + cluster.radius * Math.sin((cluster.angle * Math.PI) / 180);
        const nodes = Array.from({ length: cluster.count }, (_, i) => {
          const a = (i / cluster.count) * Math.PI * 2;
          const r = 18 + (i % 2) * 6;
          return { x: clCx + r * Math.cos(a), y: clCy + r * Math.sin(a) };
        });
        return (
          <g key={ci}>
            <motion.line x1={clCx} y1={clCy} x2={cx} y2={cy} stroke={`hsl(${cluster.color})`} strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: ci * 0.2 }} />
            {nodes.map((n, i) => <line key={i} x1={n.x} y1={n.y} x2={clCx} y2={clCy} stroke={`hsl(${cluster.color})`} strokeWidth="0.5" strokeOpacity="0.15" />)}
            {nodes.map((n, i) => <motion.circle key={`n${i}`} cx={n.x} cy={n.y} r={3} fill={`hsl(${cluster.color})`} opacity="0.5"
              initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 + ci * 0.15 + i * 0.04 }} />)}
            <text x={clCx} y={clCy + (cluster.angle === -90 ? -28 : 35)} fontSize="7" fill={`hsl(${cluster.color})`} opacity="0.7" textAnchor="middle" fontWeight="500">{cluster.label}</text>
          </g>
        );
      })}
      <motion.circle cx={cx} cy={cy} r={18} fill="hsl(var(--primary))" opacity="0.1" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} />
      <motion.circle cx={cx} cy={cy} r={13} fill="hsl(var(--primary))" opacity="0.15" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} />
      <image href={findooLogoIcon} x={cx - 9} y={cy - 9} width={18} height={18} className="pointer-events-none" />
    </svg>
  );
}

/* ─── Data Strip ─── */
function DataStrip() {
  const stats = [
    { value: 7000, suffix: "+", label: "Issuers", sublabel: "AMCs, NBFCs, Insurers" },
    { value: 35000, suffix: "+", label: "Intermediaries", sublabel: "MFDs, RIAs, Brokers" },
    { value: 7, suffix: " Cr+", label: "Investors", sublabel: "Retail & HNI" },
    { value: 6, suffix: " Lakh+", label: "Professionals", sublabel: "Licensed Individuals" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 my-4">
      {stats.map((stat, i) => (
        <motion.div key={stat.label} className="text-center p-3 rounded-lg border border-border/40 bg-card/40"
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
          <div className="text-xl lg:text-2xl font-bold font-heading text-foreground">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
          </div>
          <p className="text-xs font-semibold text-foreground mt-0.5">{stat.label}</p>
          <p className="text-[10px] text-muted-foreground">{stat.sublabel}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Card Data ─── */
const cards = [
  {
    tag: "Category Creation",
    headline: "The Third Network of Your Life",
    body: (
      <>
        <p className="mb-2">
          You have networks for your social world. You have networks for your professional world.
          Your financial world is the third — and most consequential — yet it has no dedicated, trusted network.
        </p>
        <p className="font-medium text-foreground">
          Findoo is not an evolution of existing platforms. It is a new category.
        </p>
      </>
    ),
    art: <ConcentricOrbitsArt />,
  },
  {
    tag: "Purpose Over Generic Noise",
    headline: "Built for Financial Signal, Not Social Noise",
    body: (
      <>
        <p className="mb-2">
          Generic networks dilute expertise, mute informed voices, and blur regulation.
          Skills are not mapped. Intent is not visible. Discovery is accidental.
        </p>
        <p className="font-medium text-foreground">
          Findoo is purpose-driven, compliance-aware, and market-neutral —
          where credibility is structured and meaningful engagement is amplified.
        </p>
      </>
    ),
    art: <NoiseToStructureArt />,
  },
  {
    tag: "Neutral Ecosystem Infrastructure",
    headline: "A Neutral Layer for a Vast Ecosystem",
    body: (
      <>
        <DataStrip />
        <p className="mb-2">One ecosystem with a neutral connective layer.</p>
        <p className="text-foreground font-medium leading-relaxed">
          Findoo is not an issuer.<br />
          Findoo is not an intermediary.<br />
          Findoo is the infrastructure that enables them all.
        </p>
      </>
    ),
    art: <NeutralCoreArt />,
  },
];

/* ─── Stacked Card Carousel ─── */
export default function WhyFindooSection() {
  const [order, setOrder] = useState([0, 1, 2]);

  const rotateNext = useCallback(() => {
    setOrder(prev => {
      const next = [...prev];
      const top = next.shift()!;
      next.push(top);
      return next;
    });
  }, []);

  // Stack layout: order[0] = top, order[1] = middle, order[2] = bottom
  const stackVariants = {
    top: {
      y: 0,
      scale: 1,
      opacity: 1,
      zIndex: 30,
      filter: "blur(0px)",
    },
    middle: {
      y: 56,
      scale: 0.96,
      opacity: 0.7,
      zIndex: 20,
      filter: "blur(0px)",
    },
    bottom: {
      y: 100,
      scale: 0.92,
      opacity: 0.4,
      zIndex: 10,
      filter: "blur(1px)",
    },
  };

  const positionForIndex = (cardIndex: number) => {
    const pos = order.indexOf(cardIndex);
    if (pos === 0) return "top";
    if (pos === 1) return "middle";
    return "bottom";
  };

  return (
    <div>
      {/* Section Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-2">
          Why Findoo
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
          Your financial life deserves its own trusted network.
        </p>
      </motion.div>

      {/* Stacked Card Deck */}
      <div className="max-w-2xl mx-auto relative" style={{ minHeight: "520px" }}>
        {cards.map((card, cardIndex) => {
          const position = positionForIndex(cardIndex);
          const isTop = position === "top";

          return (
            <motion.div
              key={cardIndex}
              className={`absolute inset-x-0 rounded-xl border bg-card shadow-lg overflow-hidden
                ${isTop ? "cursor-pointer border-border" : "border-border/40"}
              `}
              animate={stackVariants[position]}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }}
              onClick={isTop ? rotateNext : undefined}
              style={{ transformOrigin: "top center" }}
            >
              {/* Card Tag + Indicator */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/[0.08] text-primary text-[11px] font-semibold tracking-wider uppercase">
                  {card.tag}
                </span>
                {isTop && (
                  <motion.span
                    className="flex items-center gap-1 text-[11px] text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Tap to rotate
                    <ChevronDown className="h-3 w-3" />
                  </motion.span>
                )}
              </div>

              {/* Headline */}
              <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground px-5 pb-3 leading-tight">
                {card.headline}
              </h3>

              {/* Art */}
              <div className="mx-5 rounded-lg border border-border/30 bg-muted/20 overflow-hidden aspect-[2/1]">
                {card.art}
              </div>

              {/* Body (only fully visible on top card, but rendered for layout) */}
              <div className="px-5 pt-3 pb-5 text-sm text-muted-foreground leading-relaxed">
                {card.body}
              </div>
            </motion.div>
          );
        })}

        {/* Peek labels for stacked cards */}
        <div className="absolute bottom-0 inset-x-0 flex justify-center gap-2 pb-2" style={{ zIndex: 5 }}>
          {order.map((cardIndex, pos) => (
            <button
              key={cardIndex}
              onClick={() => {
                // Move clicked card to top
                setOrder(prev => {
                  const next = prev.filter(i => i !== cardIndex);
                  next.unshift(cardIndex);
                  return next;
                });
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                pos === 0
                  ? "w-6 bg-primary"
                  : "w-3 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
              aria-label={`Go to: ${cards[cardIndex].tag}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
