/**
 * WhyFindooSection — Section 4: "Why Findoo" narrative blocks
 * Single-column centered layout with 3 thematic blocks + generative SVG art
 */
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import findooLogoIcon from "@/assets/findoo-logo-icon.png";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: "easeOut" as const },
  }),
};

/* ─── SVG Illustration: Concentric Orbits ─── */
function ConcentricOrbitsArt() {
  const cx = 200, cy = 120;
  return (
    <svg viewBox="0 0 400 240" className="w-full h-auto" aria-hidden="true">
      <defs>
        <radialGradient id="orb-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="fin-orbit" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--accent))" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#orb-bg)" rx="12" />
      
      {/* Social orbit */}
      <circle cx={cx} cy={cy} r={95} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeOpacity="0.15" strokeDasharray="4 6" />
      <circle cx={cx} cy={cy} r={65} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 6" />
      
      {/* Financial orbit — highlighted */}
      <motion.circle
        cx={cx} cy={cy} r={35}
        fill="none"
        stroke="url(#fin-orbit)"
        strokeWidth="2.5"
        strokeOpacity="0.8"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      
      {/* Orbit labels */}
      <text x={cx + 70} y={cy - 55} fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.5" fontFamily="var(--font-body)">Social</text>
      <text x={cx + 48} y={cy - 35} fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.6" fontFamily="var(--font-body)">Professional</text>
      <text x={cx + 26} y={cy - 10} fontSize="9" fill="hsl(var(--primary))" opacity="0.9" fontWeight="600" fontFamily="var(--font-heading)">Financial</text>
      
      {/* Nodes on outer orbits */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const r = 95;
        const x = cx + r * Math.cos((deg * Math.PI) / 180);
        const y = cy + r * Math.sin((deg * Math.PI) / 180);
        return <circle key={`o-${i}`} cx={x} cy={y} r={3} fill="hsl(var(--muted-foreground))" opacity="0.2" />;
      })}
      {[0, 90, 180, 270].map((deg, i) => {
        const r = 65;
        const x = cx + r * Math.cos((deg * Math.PI) / 180);
        const y = cy + r * Math.sin((deg * Math.PI) / 180);
        return <circle key={`m-${i}`} cx={x} cy={y} r={3} fill="hsl(var(--muted-foreground))" opacity="0.25" />;
      })}
      {/* Financial orbit nodes — prominent */}
      {[0, 120, 240].map((deg, i) => {
        const r = 35;
        const x = cx + r * Math.cos((deg * Math.PI) / 180);
        const y = cy + r * Math.sin((deg * Math.PI) / 180);
        return (
          <motion.circle
            key={`f-${i}`} cx={x} cy={y} r={5}
            fill="hsl(var(--primary))" opacity="0.7"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 + i * 0.15 }}
          />
        );
      })}
      
      {/* Center glow */}
      <circle cx={cx} cy={cy} r={10} fill="hsl(var(--primary))" opacity="0.15" />
      <circle cx={cx} cy={cy} r={5} fill="hsl(var(--primary))" opacity="0.5" />
    </svg>
  );
}

/* ─── SVG Illustration: Noise to Structured Network ─── */
function NoiseToStructureArt() {
  // Left side: chaotic nodes
  const chaosNodes = Array.from({ length: 18 }, (_, i) => ({
    x: 20 + Math.sin(i * 7.3) * 60 + 50,
    y: 30 + Math.cos(i * 5.1) * 70 + 50,
  }));
  
  // Right side: structured grid
  const structuredNodes = [
    { x: 270, y: 50 }, { x: 310, y: 50 }, { x: 350, y: 50 },
    { x: 250, y: 90 }, { x: 290, y: 90 }, { x: 330, y: 90 }, { x: 370, y: 90 },
    { x: 270, y: 130 }, { x: 310, y: 130 }, { x: 350, y: 130 },
    { x: 250, y: 170 }, { x: 290, y: 170 }, { x: 330, y: 170 }, { x: 370, y: 170 },
    { x: 270, y: 210 }, { x: 310, y: 210 }, { x: 350, y: 210 },
  ];

  return (
    <svg viewBox="0 0 400 240" className="w-full h-auto" aria-hidden="true">
      <defs>
        <linearGradient id="ns-bg" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--destructive))" stopOpacity="0.04" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="arrow-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <rect width="400" height="240" fill="url(#ns-bg)" rx="12" />
      
      {/* Chaos side — messy lines */}
      {chaosNodes.slice(0, 12).map((n, i) => {
        const target = chaosNodes[(i + 3) % chaosNodes.length];
        return (
          <line key={`cl-${i}`} x1={n.x} y1={n.y} x2={target.x} y2={target.y}
            stroke="hsl(var(--muted-foreground))" strokeWidth="0.5" strokeOpacity="0.15" />
        );
      })}
      {chaosNodes.map((n, i) => (
        <circle key={`cn-${i}`} cx={n.x} cy={n.y} r={2.5}
          fill="hsl(var(--muted-foreground))" opacity={0.2 + (i % 3) * 0.1} />
      ))}
      
      {/* Label */}
      <text x="60" y="232" fontSize="8" fill="hsl(var(--muted-foreground))" opacity="0.4" textAnchor="middle" fontFamily="var(--font-body)">Noise</text>
      
      {/* Transformation arrow */}
      <motion.path
        d="M 180 120 L 220 120"
        stroke="url(#arrow-grad)" strokeWidth="2" fill="none"
        markerEnd="url(#arrowhead)"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      />
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--primary))" opacity="0.6" />
        </marker>
      </defs>
      
      {/* Structured side — clean connections */}
      {structuredNodes.map((n, i) => {
        // Connect to nearby nodes
        return structuredNodes.slice(i + 1).filter(t => {
          const dist = Math.sqrt((n.x - t.x) ** 2 + (n.y - t.y) ** 2);
          return dist < 55;
        }).map((t, j) => (
          <motion.line
            key={`sl-${i}-${j}`} x1={n.x} y1={n.y} x2={t.x} y2={t.y}
            stroke="hsl(var(--primary))" strokeWidth="0.8" strokeOpacity="0.2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.8 + i * 0.03 }}
          />
        ));
      })}
      {structuredNodes.map((n, i) => (
        <motion.circle
          key={`sn-${i}`} cx={n.x} cy={n.y} r={4}
          fill="hsl(var(--primary))" opacity="0.6"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1 + i * 0.04 }}
        />
      ))}
      
      <text x="310" y="232" fontSize="8" fill="hsl(var(--primary))" opacity="0.6" textAnchor="middle" fontFamily="var(--font-body)">Signal</text>
    </svg>
  );
}

/* ─── SVG Illustration: Multi-cluster Neutral Core ─── */
function NeutralCoreArt() {
  const cx = 200, cy = 120;
  
  // 3 clusters positioned around center
  const clusters = [
    { label: "Issuers", color: "var(--issuer)", angle: -90, radius: 75, count: 6 },
    { label: "Intermediaries", color: "var(--intermediary)", angle: 150, radius: 75, count: 8 },
    { label: "Investors", color: "var(--investor)", angle: 30, radius: 75, count: 7 },
  ];

  return (
    <svg viewBox="0 0 400 240" className="w-full h-auto" aria-hidden="true">
      <defs>
        <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill="url(#core-glow)" rx="12" />
      
      {/* Cluster nodes and connections to center */}
      {clusters.map((cluster, ci) => {
        const clusterCx = cx + cluster.radius * Math.cos((cluster.angle * Math.PI) / 180);
        const clusterCy = cy + cluster.radius * Math.sin((cluster.angle * Math.PI) / 180);
        
        const nodes = Array.from({ length: cluster.count }, (_, i) => {
          const a = (i / cluster.count) * Math.PI * 2;
          const r = 22 + (i % 2) * 8;
          return {
            x: clusterCx + r * Math.cos(a),
            y: clusterCy + r * Math.sin(a),
          };
        });
        
        return (
          <g key={cluster.label}>
            {/* Connection lines from cluster center to main center */}
            <motion.line
              x1={clusterCx} y1={clusterCy} x2={cx} y2={cy}
              stroke={`hsl(${cluster.color})`} strokeWidth="1.5" strokeOpacity="0.25"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: ci * 0.2 }}
            />
            
            {/* Intra-cluster connections */}
            {nodes.map((n, i) => (
              <line key={`ic-${ci}-${i}`}
                x1={n.x} y1={n.y} x2={clusterCx} y2={clusterCy}
                stroke={`hsl(${cluster.color})`} strokeWidth="0.5" strokeOpacity="0.15"
              />
            ))}
            
            {/* Cluster nodes */}
            {nodes.map((n, i) => (
              <motion.circle
                key={`cn-${ci}-${i}`} cx={n.x} cy={n.y} r={3}
                fill={`hsl(${cluster.color})`} opacity="0.5"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + ci * 0.15 + i * 0.04 }}
              />
            ))}
            
            {/* Cluster label */}
            <text
              x={clusterCx}
              y={clusterCy + (cluster.angle === -90 ? -35 : 40)}
              fontSize="8" fill={`hsl(${cluster.color})`} opacity="0.7"
              textAnchor="middle" fontFamily="var(--font-body)" fontWeight="500"
            >
              {cluster.label}
            </text>
          </g>
        );
      })}
      
      {/* Central neutral core */}
      <motion.circle
        cx={cx} cy={cy} r={22}
        fill="hsl(var(--primary))" opacity="0.1"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      />
      <motion.circle
        cx={cx} cy={cy} r={16}
        fill="hsl(var(--primary))" opacity="0.15"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      <image
        href={findooLogoIcon}
        x={cx - 11} y={cy - 11}
        width={22} height={22}
        className="pointer-events-none"
      />
    </svg>
  );
}

/* ─── Data Strip Component ─── */
function DataStrip() {
  const stats = [
    { value: 7000, suffix: "+", label: "Issuers", sublabel: "AMCs, NBFCs, Insurers" },
    { value: 35000, suffix: "+", label: "Intermediaries", sublabel: "MFDs, RIAs, Brokers" },
    { value: 7, suffix: " Cr+", label: "Investors", sublabel: "Retail & HNI" },
    { value: 6, suffix: " Lakh+", label: "Individual Intermediaries", sublabel: "Licensed Professionals" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-6">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          className="text-center p-4 rounded-lg border border-border/60 bg-card/50 backdrop-blur-sm"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="text-2xl lg:text-3xl font-bold font-heading text-foreground">
            <AnimatedCounter value={stat.value} suffix={stat.suffix} />
          </div>
          <p className="text-sm font-semibold text-foreground mt-1">{stat.label}</p>
          <p className="text-xs text-muted-foreground">{stat.sublabel}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Main Section ─── */
export default function WhyFindooSection() {
  const blocks = [
    {
      tag: "Category Creation",
      headline: "The Third Network of Your Life",
      body: (
        <>
          <p className="mb-3">
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
          <p className="mb-3">
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
          <p className="mb-3">One ecosystem with a neutral connective layer.</p>
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

  return (
    <div>
      {/* Section Header */}
      <motion.div
        className="text-center mb-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
      >
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-3">
          Why Findoo
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Your financial life deserves its own trusted network.
        </p>
      </motion.div>

      {/* Thematic Blocks */}
      <div className="space-y-16 max-w-3xl mx-auto">
        {blocks.map((block, i) => (
          <motion.div
            key={block.tag}
            className="relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            custom={i}
          >
            {/* Tag pill */}
            <span className="inline-block px-3 py-1 rounded-full bg-primary/[0.08] text-primary text-[11px] font-semibold tracking-wider uppercase mb-4">
              {block.tag}
            </span>

            {/* Headline */}
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-foreground mb-4 leading-tight">
              {block.headline}
            </h3>

            {/* Art */}
            <div className="rounded-xl border border-border/50 bg-muted/30 overflow-hidden mb-5">
              {block.art}
            </div>

            {/* Body */}
            <div className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {block.body}
            </div>

            {/* Separator (except last) */}
            {i < blocks.length - 1 && (
              <div className="mt-12 border-b border-border/40" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
