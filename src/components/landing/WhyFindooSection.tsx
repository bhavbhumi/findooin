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

/* ─── Peek strip height for inactive cards ─── */
const PEEK_H = 44; // px – enough for tag + title line

/* ─── Stacked Card Carousel ─── */
export default function WhyFindooSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const bringToTop = useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

  const rotateNext = useCallback(() => {
    setActiveIndex(prev => (prev + 1) % cards.length);
  }, []);

  // Build ordered list: active first, then the rest in order
  const orderedIndices = [
    activeIndex,
    ...cards.map((_, i) => i).filter(i => i !== activeIndex),
  ];

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

      {/* Card Stack Container */}
      <div className="max-w-2xl mx-auto flex flex-col gap-0">
        {orderedIndices.map((cardIndex, stackPos) => {
          const card = cards[cardIndex];
          const isActive = stackPos === 0;

          return (
            <motion.div
              key={cardIndex}
              layout
              className={`rounded-xl border overflow-hidden transition-shadow ${
                isActive
                  ? "bg-card shadow-md border-border cursor-pointer"
                  : "bg-card/70 shadow-sm border-border/40 cursor-pointer hover:bg-card/90"
              }`}
              onClick={() => (isActive ? rotateNext() : bringToTop(cardIndex))}
              transition={{
                layout: { type: "spring", stiffness: 350, damping: 32, mass: 0.7 },
              }}
            >
              {/* Tag + Title strip (always visible) */}
              <div
                className={`flex items-center gap-3 px-4 ${
                  isActive ? "pt-3 pb-2" : "py-2"
                }`}
                style={!isActive ? { height: `${PEEK_H}px` } : undefined}
              >
                <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-primary/[0.08] text-primary text-[10px] font-semibold tracking-wider uppercase">
                  {card.tag}
                </span>
                <span
                  className={`text-sm font-semibold font-heading truncate ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {card.headline}
                </span>
                {isActive && (
                  <motion.span
                    className="ml-auto shrink-0 flex items-center gap-0.5 text-[10px] text-muted-foreground/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </motion.span>
                )}
              </div>

              {/* Expanded content (only for active card) */}
              <AnimatePresence initial={false}>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {/* Art — compact aspect ratio */}
                    <div className="mx-4 rounded-lg border border-border/30 bg-muted/20 overflow-hidden aspect-[5/2]">
                      {card.art}
                    </div>

                    {/* Body */}
                    <div className="px-4 pt-2.5 pb-4 text-[13px] sm:text-sm text-muted-foreground leading-relaxed">
                      {card.body}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => bringToTop(i)}
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
