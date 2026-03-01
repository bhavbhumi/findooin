import React, { useState, useEffect, useCallback, useRef } from "react";
import findooLogoIcon from "@/assets/findoo-logo-icon.png";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ── */
interface OrbitNode {
  id: string;
  role: "issuer" | "intermediary" | "investor";
  label: string;
  angle: number;          // degrees
  verified: boolean;
}

interface ConnectionLine {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

/* ── Config ── */
const ROLE_META: Record<string, { color: string; glow: string; label: string }> = {
  issuer:       { color: "hsl(var(--issuer))",       glow: "hsl(var(--issuer) / 0.5)",       label: "Issuer" },
  intermediary: { color: "hsl(var(--intermediary))",  glow: "hsl(var(--intermediary) / 0.5)",  label: "Intermediary" },
  investor:     { color: "hsl(var(--investor))",      glow: "hsl(var(--investor) / 0.35)",     label: "Investor" },
};

const ORBITS = {
  issuer:       { radius: 90,  nodes: 5 },
  intermediary: { radius: 145, nodes: 7 },
  investor:     { radius: 200, nodes: 9 },
} as const;

const CENTER = 250; // SVG viewBox center

function buildNodes(): OrbitNode[] {
  const nodes: OrbitNode[] = [];
  (Object.keys(ORBITS) as Array<keyof typeof ORBITS>).forEach((role) => {
    const { radius: _, nodes: count } = ORBITS[role];
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i + (role === "intermediary" ? 15 : role === "investor" ? 8 : 0);
      nodes.push({
        id: `${role}-${i}`,
        role,
        label: ROLE_META[role].label,
        angle,
        verified: Math.random() > 0.3,
      });
    }
  });
  return nodes;
}

function nodePos(role: string, angle: number) {
  const r = ORBITS[role as keyof typeof ORBITS].radius;
  const rad = (angle * Math.PI) / 180;
  return { x: CENTER + Math.cos(rad) * r, y: CENTER + Math.sin(rad) * r };
}

/* ── Component ── */
interface Props {
  highlightedOrbit: string | null;
}

const CosmicNetworkVisualization: React.FC<Props> = ({ highlightedOrbit }) => {
  const [nodes] = useState<OrbitNode[]>(() => buildNodes());
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string } | null>(null);
  const [connections, setConnections] = useState<ConnectionLine[]>([]);
  const [pulseKey, setPulseKey] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Periodic verification pulse
  useEffect(() => {
    const interval = setInterval(() => setPulseKey((k) => k + 1), 4000);
    return () => clearInterval(interval);
  }, []);

  // Random constellation connections
  useEffect(() => {
    const interval = setInterval(() => {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      if (a.id === b.id || a.role === b.role) return;
      const posA = nodePos(a.role, a.angle);
      const posB = nodePos(b.role, b.angle);
      const conn: ConnectionLine = { id: `${a.id}-${b.id}-${Date.now()}`, from: posA, to: posB };
      setConnections((prev) => [...prev.slice(-4), conn]);
    }, 2200);
    return () => clearInterval(interval);
  }, [nodes]);

  // Remove old connections
  useEffect(() => {
    if (connections.length === 0) return;
    const timer = setTimeout(() => setConnections((prev) => prev.slice(1)), 1800);
    return () => clearTimeout(timer);
  }, [connections]);

  const handleNodeHover = useCallback(
    (e: React.MouseEvent<SVGCircleElement>, node: OrbitNode) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const pos = nodePos(node.role, node.angle);
      const scaleX = rect.width / 500;
      const scaleY = rect.height / 500;
      setTooltip({
        x: rect.left + pos.x * scaleX,
        y: rect.top + pos.y * scaleY - 12,
        label: node.label,
      });
    },
    []
  );

  const dimmed = (role: string) => highlightedOrbit !== null && highlightedOrbit !== role;

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto">
      <svg
        ref={svgRef}
        viewBox="0 0 500 500"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial glow for center */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          {/* Pulse gradient */}
          <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0.03" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background ambient glow */}
        <circle cx={CENTER} cy={CENTER} r="220" fill="url(#centerGlow)" />

        {/* Orbit rings */}
        {(Object.entries(ORBITS) as [string, { radius: number; nodes: number }][]).map(
          ([role, { radius }]) => (
            <circle
              key={role}
              cx={CENTER}
              cy={CENTER}
              r={radius}
              fill="none"
              stroke={ROLE_META[role].color}
              strokeWidth={dimmed(role) ? 0.3 : 0.7}
              strokeDasharray="4 6"
              opacity={dimmed(role) ? 0.15 : 0.35}
              className="transition-all duration-500"
            />
          )
        )}

        {/* Verification pulse wave */}
        <motion.circle
          key={pulseKey}
          cx={CENTER}
          cy={CENTER}
          r={40}
          fill="url(#pulseGrad)"
          stroke="hsl(var(--primary))"
          strokeWidth={0.5}
          initial={{ r: 40, opacity: 0.6 }}
          animate={{ r: 230, opacity: 0 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />

        {/* Constellation connections */}
        <AnimatePresence>
          {connections.map((conn) => (
            <motion.line
              key={conn.id}
              x1={conn.from.x}
              y1={conn.from.y}
              x2={conn.to.x}
              y2={conn.to.y}
              stroke="hsl(var(--primary))"
              strokeWidth={0.8}
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 0.4, pathLength: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          ))}
        </AnimatePresence>

        {/* Thin connecting lines from center to each node */}
        {nodes.map((node) => {
          const pos = nodePos(node.role, node.angle);
          return (
            <line
              key={`line-${node.id}`}
              x1={CENTER}
              y1={CENTER}
              x2={pos.x}
              y2={pos.y}
              stroke={ROLE_META[node.role].color}
              strokeWidth={0.3}
              opacity={dimmed(node.role) ? 0.05 : 0.12}
              className="transition-opacity duration-500"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = nodePos(node.role, node.angle);
          const isDimmed = dimmed(node.role);
          const nodeRadius = node.role === "investor" ? 5 : node.role === "intermediary" ? 5.5 : 6;

          return (
            <g key={node.id} className="transition-opacity duration-500" opacity={isDimmed ? 0.2 : 1}>
              {/* Glow halo */}
              {!isDimmed && (
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={nodeRadius + 6}
                  fill={ROLE_META[node.role].glow}
                  initial={false}
                  animate={{
                    r: [nodeRadius + 5, nodeRadius + 8, nodeRadius + 5],
                    opacity: [0.25, 0.4, 0.25],
                  }}
                  transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              {/* Node circle */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={nodeRadius}
                fill={ROLE_META[node.role].color}
                stroke={node.verified ? "hsl(var(--primary-foreground))" : "transparent"}
                strokeWidth={node.verified ? 1.2 : 0}
                className="cursor-pointer"
                whileHover={{ scale: 1.5 }}
                onMouseEnter={(e) => handleNodeHover(e as any, node)}
                onMouseLeave={() => setTooltip(null)}
                animate={{
                  y: [0, -2, 0, 2, 0],
                }}
                transition={{
                  y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
                }}
                style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
              />
            </g>
          );
        })}

        {/* Center Findoo node */}
        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={28}
          fill="hsl(var(--primary))"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
        />
        <motion.circle
          cx={CENTER}
          cy={CENTER}
          r={33}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1}
          opacity={0.3}
          animate={{ r: [33, 37, 33], opacity: [0.3, 0.15, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Findoo logo image */}
        <image
          href={findooLogoIcon}
          x={CENTER - 18}
          y={CENTER - 18}
          width={36}
          height={36}
          className="pointer-events-none"
          style={{ borderRadius: "50%" }}
        />

        {/* Orbit labels */}
        {(Object.entries(ORBITS) as [string, { radius: number; nodes: number }][]).map(
          ([role, { radius }]) => (
            <text
              key={`label-${role}`}
              x={CENTER}
              y={CENTER - radius - 8}
              textAnchor="middle"
              className={`text-[7px] font-medium uppercase tracking-[0.12em] transition-opacity duration-500 ${
                dimmed(role) ? "opacity-10" : "opacity-40"
              }`}
              fill={ROLE_META[role].color}
            >
              {ROLE_META[role].label}s
            </text>
          )
        )}
      </svg>

      {/* Tooltip portal */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            className="fixed z-50 px-2.5 py-1 rounded-md bg-popover border border-border text-popover-foreground text-xs font-medium shadow-lg pointer-events-none"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, -100%)",
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
          >
            {tooltip.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CosmicNetworkVisualization;
