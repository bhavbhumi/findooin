import React, { useMemo } from "react";
import findooLogo from "@/assets/findoo-logo.png";

/* ── Laniakea Supercluster Visualization ──
   Cosmic web of filaments flowing toward a central "Great Attractor" — FindOO.
   Three distinct streams: Issuers, Intermediaries, Investors. */

interface FilamentNode {
  x: number;
  y: number;
  r: number;
  role: "issuer" | "intermediary" | "investor";
  verified: boolean;
  delay: number;
  speed: number;
}

interface Filament {
  points: { x: number; y: number }[];
  role: "issuer" | "intermediary" | "investor";
}

const CX = 250;
const CY = 250;
const VB = 500;

const ROLE_COLORS: Record<string, string> = {
  issuer: "hsl(var(--issuer))",
  intermediary: "hsl(var(--intermediary))",
  investor: "hsl(var(--investor))",
};

const ROLE_GLOWS: Record<string, string> = {
  issuer: "hsl(var(--issuer) / 0.3)",
  intermediary: "hsl(var(--intermediary) / 0.25)",
  investor: "hsl(var(--investor) / 0.2)",
};

const ROLE_LABELS: Record<string, string> = {
  issuer: "ISSUERS",
  intermediary: "INTERMEDIARIES",
  investor: "INVESTORS",
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateFilaments(): Filament[] {
  const roles: Array<"issuer" | "intermediary" | "investor"> = [
    "issuer", "intermediary", "investor",
  ];
  const baseAngles = [30, 110, 195, 280, 340];
  const filaments: Filament[] = [];

  baseAngles.forEach((angle, fi) => {
    const role = roles[fi % 3];
    const rad = (angle * Math.PI) / 180;
    const points: { x: number; y: number }[] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const dist = 230 * (1 - t * t);
      const wobble = Math.sin(t * Math.PI * 3 + fi) * (20 - t * 18);
      const perpRad = rad + Math.PI / 2;
      const px = CX + Math.cos(rad) * dist + Math.cos(perpRad) * wobble;
      const py = CY + Math.sin(rad) * dist + Math.sin(perpRad) * wobble;
      points.push({ x: px, y: py });
    }
    filaments.push({ points, role });
  });

  return filaments;
}

function generateNodes(filaments: Filament[]): FilamentNode[] {
  const nodes: FilamentNode[] = [];
  let seed = 42;

  filaments.forEach((fil) => {
    const count = 8 + Math.floor(seededRandom(seed++) * 5);
    for (let i = 0; i < count; i++) {
      const t = seededRandom(seed++) * 0.85 + 0.05;
      const idx = Math.min(Math.floor(t * (fil.points.length - 1)), fil.points.length - 2);
      const frac = t * (fil.points.length - 1) - idx;
      const p0 = fil.points[idx];
      const p1 = fil.points[idx + 1];
      const x = p0.x + (p1.x - p0.x) * frac + (seededRandom(seed++) - 0.5) * 24;
      const y = p0.y + (p1.y - p0.y) * frac + (seededRandom(seed++) - 0.5) * 24;
      const distFromCenter = Math.sqrt((x - CX) ** 2 + (y - CY) ** 2);
      const r = 2 + (distFromCenter / 230) * 3.5 + seededRandom(seed++) * 1.5;
      nodes.push({
        x, y, r,
        role: fil.role,
        verified: seededRandom(seed++) > 0.3,
        delay: seededRandom(seed++) * 4,
        speed: 2.5 + seededRandom(seed++) * 3,
      });
    }
  });

  for (let i = 0; i < 15; i++) {
    const angle = seededRandom(seed++) * Math.PI * 2;
    const dist = 60 + seededRandom(seed++) * 150;
    const roles: Array<"issuer" | "intermediary" | "investor"> = ["issuer", "intermediary", "investor"];
    nodes.push({
      x: CX + Math.cos(angle) * dist,
      y: CY + Math.sin(angle) * dist,
      r: 1 + seededRandom(seed++) * 1.5,
      role: roles[Math.floor(seededRandom(seed++) * 3)],
      verified: false,
      delay: seededRandom(seed++) * 5,
      speed: 3 + seededRandom(seed++) * 2,
    });
  }

  return nodes;
}

function filamentToPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

const StreamParticle: React.FC<{
  path: string;
  color: string;
  delay: number;
  duration: number;
}> = ({ path, color, delay, duration }) => (
  <>
    <circle r="2" fill={color} opacity="0.7">
      <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} path={path} />
    </circle>
    <circle r="5" fill={color} opacity="0.15">
      <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} path={path} />
    </circle>
  </>
);

/* ── Role label configs — positioned near outer edge of each primary filament ── */
const LABEL_POSITIONS = [
  { role: "issuer", angle: 30 },
  { role: "intermediary", angle: 110 },
  { role: "investor", angle: 195 },
] as const;

const HeroCosmicNetwork: React.FC = () => {
  const filaments = useMemo(() => generateFilaments(), []);
  const nodes = useMemo(() => generateNodes(filaments), [filaments]);
  const filamentPaths = useMemo(() => filaments.map(f => filamentToPath(f.points)), [filaments]);

  return (
    <div
      className="relative w-full aspect-square max-w-[500px] mx-auto select-none"
      role="img"
      aria-label="India's First Financial Network — verified Issuers, Intermediaries and Investors connected in a compliance-governed ecosystem"
    >
      {/* Ambient glow */}
      <div className="absolute inset-[15%] rounded-full bg-primary/[0.08] dark:bg-primary/[0.14] blur-3xl" />

      <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lk-center" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="40%" stopColor="hsl(var(--primary))" stopOpacity="0.08" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <filter id="lk-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx={CX} cy={CY} r="240" fill="url(#lk-center)" />

        {/* Gravitational wave pulses */}
        {[0, 1.2, 2.4].map((delay, i) => (
          <circle key={`wave-${i}`} cx={CX} cy={CY} r="30" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0">
            <animate attributeName="r" from="30" to="220" dur="4s" begin={`${delay}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.05;0" dur="4s" begin={`${delay}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Filament streams */}
        {filaments.map((fil, i) => (
          <g key={`fil-${i}`}>
            <path d={filamentPaths[i]} fill="none" stroke={ROLE_GLOWS[fil.role]}
              strokeWidth="8" strokeLinecap="round" opacity="0.3" filter="url(#lk-glow)" />
            <path d={filamentPaths[i]} fill="none" stroke={ROLE_COLORS[fil.role]}
              strokeWidth="1" strokeLinecap="round" opacity="0.25" strokeDasharray="4 6" />
          </g>
        ))}

        {/* Inter-node connections */}
        {nodes.slice(0, 35).map((n, i) => {
          const nearby = nodes
            .filter((m, j) => j !== i && Math.hypot(m.x - n.x, m.y - n.y) < 55)
            .slice(0, 2);
          return nearby.map((m, mi) => (
            <line key={`web-${i}-${mi}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y}
              stroke={ROLE_COLORS[n.role]} strokeWidth="0.3" opacity="0.12" />
          ));
        })}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={`node-${i}`}>
            <circle cx={n.x} cy={n.y} r={n.r + 4} fill={ROLE_GLOWS[n.role]} opacity="0.15">
              <animate attributeName="r" values={`${n.r + 3};${n.r + 7};${n.r + 3}`}
                dur={`${n.speed}s`} begin={`${n.delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.12;0.28;0.12"
                dur={`${n.speed}s`} begin={`${n.delay}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={n.x} cy={n.y} r={n.r} fill={ROLE_COLORS[n.role]} opacity="0.85" />
            {n.verified && n.r > 2.5 && (
              <circle cx={n.x} cy={n.y} r={n.r + 1.5} fill="none"
                stroke={ROLE_COLORS[n.role]} strokeWidth="0.6" opacity="0.4" />
            )}
          </g>
        ))}

        {/* Streaming particles */}
        {filaments.map((fil, i) => (
          <g key={`particles-${i}`}>
            {[0, 1, 2].map(p => (
              <StreamParticle key={`sp-${i}-${p}`} path={filamentPaths[i]}
                color={ROLE_COLORS[fil.role]} delay={p * 2.5} duration={6 + i * 0.8} />
            ))}
          </g>
        ))}

        {/* ── Central core — FindOO logo ── */}
        <circle cx={CX} cy={CY} r="34" fill="none"
          stroke="hsl(var(--primary))" strokeWidth="0.6" opacity="0.15">
          <animate attributeName="r" values="32;38;32" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.15;0.06;0.15" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx={CX} cy={CY} r="22" fill="hsl(var(--primary))" opacity="0.95">
          <animate attributeName="r" values="22;24;22" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={CX} cy={CY} r="18" fill="hsl(var(--primary))" opacity="1" />

        {/* FindOO Logo — stylised "F" mark */}
        <g transform={`translate(${CX - 8}, ${CY - 10})`}>
          <text
            x="8" y="14"
            textAnchor="middle"
            dominantBaseline="central"
            fill="hsl(var(--primary-foreground))"
            fontSize="16"
            fontWeight="800"
            fontFamily="Montserrat, sans-serif"
            letterSpacing="0.5"
          >
            F
          </text>
        </g>

        {/* ── Role labels — high visibility with backdrop pill ── */}
        {LABEL_POSITIONS.map(({ role, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const lx = CX + Math.cos(rad) * 205;
          const ly = CY + Math.sin(rad) * 205;
          const label = ROLE_LABELS[role];
          const pillW = label.length * 5.8 + 16;
          return (
            <g key={role}>
              {/* Semi-transparent pill background */}
              <rect
                x={lx - pillW / 2}
                y={ly - 8}
                width={pillW}
                height={16}
                rx="8"
                fill="hsl(var(--background))"
                opacity="0.7"
              />
              <rect
                x={lx - pillW / 2}
                y={ly - 8}
                width={pillW}
                height={16}
                rx="8"
                fill={ROLE_COLORS[role]}
                opacity="0.12"
              />
              {/* Color dot */}
              <circle cx={lx - pillW / 2 + 10} cy={ly} r="2.5" fill={ROLE_COLORS[role]} opacity="0.9" />
              {/* Label text */}
              <text
                x={lx + 4}
                y={ly + 0.5}
                textAnchor="middle"
                dominantBaseline="central"
                fill={ROLE_COLORS[role]}
                fontSize="7"
                fontWeight="700"
                fontFamily="Montserrat, sans-serif"
                letterSpacing="1.5"
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default HeroCosmicNetwork;
