import React, { useMemo } from "react";
import findooLogoIcon from "@/assets/findoo-logo-icon.png";

/* ── Laniakea Supercluster Visualization ──
   Cosmic web of filaments flowing toward a central "Great Attractor" — findoo.
   Four distinct streams: Issuers, Intermediaries, Investors, Enablers. */

interface FilamentNode {
  x: number;
  y: number;
  r: number;
  role: Role;
  verified: boolean;
  delay: number;
  speed: number;
}

type Role = "issuer" | "intermediary" | "investor" | "enabler";

interface Filament {
  points: { x: number; y: number }[];
  role: Role;
}

const CX = 250;
const CY = 250;
const VB = 500;

const ROLE_COLORS: Record<Role, string> = {
  issuer: "hsl(var(--issuer))",
  intermediary: "hsl(var(--intermediary))",
  investor: "hsl(var(--investor))",
  enabler: "hsl(var(--enabler))",
};

const ROLE_GLOWS: Record<Role, string> = {
  issuer: "hsl(var(--issuer) / 0.3)",
  intermediary: "hsl(var(--intermediary) / 0.25)",
  investor: "hsl(var(--investor) / 0.2)",
  enabler: "hsl(var(--enabler) / 0.25)",
};

const ROLE_LABELS: Record<Role, string> = {
  issuer: "ISSUERS",
  intermediary: "INTERMEDIARIES",
  investor: "INVESTORS",
  enabler: "ENABLERS",
};

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateFilaments(): Filament[] {
  const roles: Role[] = ["issuer", "intermediary", "investor", "enabler"];
  // 8 filaments — 2 per role, spread across the circle
  const armConfigs: { angle: number; role: Role }[] = [
    { angle: 20, role: "issuer" },
    { angle: 65, role: "issuer" },
    { angle: 110, role: "intermediary" },
    { angle: 155, role: "intermediary" },
    { angle: 200, role: "investor" },
    { angle: 245, role: "investor" },
    { angle: 290, role: "enabler" },
    { angle: 335, role: "enabler" },
  ];
  const filaments: Filament[] = [];

  armConfigs.forEach(({ angle, role }, fi) => {
    const rad = (angle * Math.PI) / 180;
    const points: { x: number; y: number }[] = [];
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const dist = 230 * (1 - t * t);
      const wobble = Math.sin(t * Math.PI * 3.5 + fi * 1.3) * (22 - t * 20);
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
  const roles: Role[] = ["issuer", "intermediary", "investor", "enabler"];

  // More nodes per filament for density
  filaments.forEach((fil) => {
    const count = 10 + Math.floor(seededRandom(seed++) * 6);
    for (let i = 0; i < count; i++) {
      const t = seededRandom(seed++) * 0.88 + 0.04;
      const idx = Math.min(Math.floor(t * (fil.points.length - 1)), fil.points.length - 2);
      const frac = t * (fil.points.length - 1) - idx;
      const p0 = fil.points[idx];
      const p1 = fil.points[idx + 1];
      const x = p0.x + (p1.x - p0.x) * frac + (seededRandom(seed++) - 0.5) * 28;
      const y = p0.y + (p1.y - p0.y) * frac + (seededRandom(seed++) - 0.5) * 28;
      const distFromCenter = Math.sqrt((x - CX) ** 2 + (y - CY) ** 2);
      const r = 1.8 + (distFromCenter / 230) * 3.5 + seededRandom(seed++) * 1.8;
      nodes.push({
        x, y, r,
        role: fil.role,
        verified: seededRandom(seed++) > 0.25,
        delay: seededRandom(seed++) * 4,
        speed: 2.5 + seededRandom(seed++) * 3,
      });
    }
  });

  // Scattered ambient nodes filling the space
  for (let i = 0; i < 30; i++) {
    const angle = seededRandom(seed++) * Math.PI * 2;
    const dist = 40 + seededRandom(seed++) * 180;
    nodes.push({
      x: CX + Math.cos(angle) * dist,
      y: CY + Math.sin(angle) * dist,
      r: 1 + seededRandom(seed++) * 1.8,
      role: roles[Math.floor(seededRandom(seed++) * 4)],
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
    <circle r="2.2" fill={color} opacity="0.8">
      <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} path={path} />
    </circle>
    <circle r="6" fill={color} opacity="0.12">
      <animateMotion dur={`${duration}s`} repeatCount="indefinite" begin={`${delay}s`} path={path} />
    </circle>
  </>
);

/* ── Role label configs — positioned near outer edge of each primary arm ── */
const LABEL_POSITIONS: { role: Role; angle: number }[] = [
  { role: "issuer", angle: 42 },
  { role: "intermediary", angle: 132 },
  { role: "investor", angle: 222 },
  { role: "enabler", angle: 312 },
];

const HeroCosmicNetwork: React.FC = () => {
  const filaments = useMemo(() => generateFilaments(), []);
  const nodes = useMemo(() => generateNodes(filaments), [filaments]);
  const filamentPaths = useMemo(() => filaments.map(f => filamentToPath(f.points)), [filaments]);

  return (
    <div
      className="relative w-full aspect-square max-w-[500px] mx-auto select-none"
      role="img"
      aria-label="India's First Financial Network — verified Issuers, Intermediaries, Investors and Enablers connected in a compliance-governed ecosystem"
    >
      {/* Ambient glow layers */}
      <div className="absolute inset-[10%] rounded-full bg-primary/[0.10] dark:bg-primary/[0.16] blur-3xl" />
      <div className="absolute top-[5%] left-[5%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--issuer)/0.06)] blur-2xl" />
      <div className="absolute bottom-[5%] left-[10%] w-[35%] h-[35%] rounded-full bg-[hsl(var(--investor)/0.05)] blur-2xl" />
      <div className="absolute top-[10%] right-[5%] w-[35%] h-[35%] rounded-full bg-[hsl(var(--intermediary)/0.05)] blur-2xl" />
      <div className="absolute bottom-[8%] right-[5%] w-[35%] h-[35%] rounded-full bg-[hsl(var(--enabler)/0.06)] blur-2xl" />

      <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="lk-center" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <filter id="lk-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="lk-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* Central nebula */}
        <circle cx={CX} cy={CY} r="240" fill="url(#lk-center)" />

        {/* Gravitational wave pulses — more rings */}
        {[0, 1, 2, 3.2].map((delay, i) => (
          <circle key={`wave-${i}`} cx={CX} cy={CY} r="30" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="0.6" opacity="0">
            <animate attributeName="r" from="25" to="235" dur="4.5s" begin={`${delay}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0.06;0" dur="4.5s" begin={`${delay}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Filament streams — glow + dashed line + solid thin core */}
        {filaments.map((fil, i) => (
          <g key={`fil-${i}`}>
            <path d={filamentPaths[i]} fill="none" stroke={ROLE_GLOWS[fil.role]}
              strokeWidth="12" strokeLinecap="round" opacity="0.25" filter="url(#lk-glow)" />
            <path d={filamentPaths[i]} fill="none" stroke={ROLE_COLORS[fil.role]}
              strokeWidth="1.5" strokeLinecap="round" opacity="0.20" strokeDasharray="3 5" />
            <path d={filamentPaths[i]} fill="none" stroke={ROLE_COLORS[fil.role]}
              strokeWidth="0.5" strokeLinecap="round" opacity="0.35" />
          </g>
        ))}

        {/* Inter-node connections — denser web */}
        {nodes.slice(0, 60).map((n, i) => {
          const nearby = nodes
            .filter((m, j) => j !== i && Math.hypot(m.x - n.x, m.y - n.y) < 50)
            .slice(0, 3);
          return nearby.map((m, mi) => (
            <line key={`web-${i}-${mi}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y}
              stroke={ROLE_COLORS[n.role]} strokeWidth="0.35" opacity="0.10" />
          ));
        })}

        {/* Nodes */}
        {nodes.map((n, i) => (
          <g key={`node-${i}`}>
            <circle cx={n.x} cy={n.y} r={n.r + 5} fill={ROLE_GLOWS[n.role]} opacity="0.12" filter="url(#lk-soft)">
              <animate attributeName="r" values={`${n.r + 3};${n.r + 8};${n.r + 3}`}
                dur={`${n.speed}s`} begin={`${n.delay}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.10;0.30;0.10"
                dur={`${n.speed}s`} begin={`${n.delay}s`} repeatCount="indefinite" />
            </circle>
            <circle cx={n.x} cy={n.y} r={n.r} fill={ROLE_COLORS[n.role]} opacity="0.85" />
            {n.verified && n.r > 2.2 && (
              <circle cx={n.x} cy={n.y} r={n.r + 1.8} fill="none"
                stroke={ROLE_COLORS[n.role]} strokeWidth="0.5" opacity="0.35" />
            )}
          </g>
        ))}

        {/* Streaming particles — more per filament */}
        {filaments.map((fil, i) => (
          <g key={`particles-${i}`}>
            {[0, 1, 2, 3].map(p => (
              <StreamParticle key={`sp-${i}-${p}`} path={filamentPaths[i]}
                color={ROLE_COLORS[fil.role]} delay={p * 2} duration={5.5 + i * 0.5} />
            ))}
          </g>
        ))}

        {/* ── Central core — findoo logo ── */}
        <circle cx={CX} cy={CY} r="36" fill="none"
          stroke="hsl(var(--primary))" strokeWidth="0.8" opacity="0.12">
          <animate attributeName="r" values="34;42;34" dur="4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.12;0.04;0.12" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx={CX} cy={CY} r="26" fill="hsl(var(--primary))" opacity="0.18" filter="url(#lk-soft)" />
        <circle cx={CX} cy={CY} r="22" fill="hsl(var(--primary))" opacity="0.95">
          <animate attributeName="r" values="22;24;22" dur="3.5s" repeatCount="indefinite" />
        </circle>
        <circle cx={CX} cy={CY} r="18" fill="hsl(var(--primary))" opacity="1" />

        {/* findoo Logo — image mark */}
        <image
          href={findooLogoIcon}
          x={CX - 14}
          y={CY - 14}
          width="28"
          height="28"
          style={{ borderRadius: "50%" }}
        />

        {/* ── Role labels — high visibility with backdrop pill ── */}
        {LABEL_POSITIONS.map(({ role, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const lx = CX + Math.cos(rad) * 205;
          const ly = CY + Math.sin(rad) * 205;
          const label = ROLE_LABELS[role];
          const pillW = label.length * 7.5 + 28;
          const dotX = lx - pillW / 2 + 12;
          const textX = lx + 8;
          return (
            <g key={role}>
              <rect x={lx - pillW / 2} y={ly - 9} width={pillW} height={18} rx="9"
                fill="hsl(var(--background))" opacity="0.85" />
              <rect x={lx - pillW / 2} y={ly - 9} width={pillW} height={18} rx="9"
                fill={ROLE_COLORS[role]} opacity="0.15" />
              <rect x={lx - pillW / 2} y={ly - 9} width={pillW} height={18} rx="9"
                fill="none" stroke={ROLE_COLORS[role]} strokeWidth="0.5" opacity="0.3" />
              <circle cx={dotX} cy={ly} r="2.5" fill={ROLE_COLORS[role]} opacity="0.9" />
              <text x={textX} y={ly + 0.5} textAnchor="middle" dominantBaseline="central"
                fill={ROLE_COLORS[role]} fontSize="7.5" fontWeight="700"
                fontFamily="Montserrat, sans-serif" letterSpacing="1.2">
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
