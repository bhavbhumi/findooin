import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import findooLogoIcon from "@/assets/findoo-logo-icon.png";

/* ── Types ── */
interface Node {
  id: string;
  role: "issuer" | "intermediary" | "investor";
  angle: number;
  baseAngle: number;
  verified: boolean;
}

interface Spark {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

/* ── Config ── */
const ROLE_META: Record<string, { color: string; glow: string }> = {
  issuer:       { color: "hsl(var(--issuer))",       glow: "hsl(var(--issuer) / 0.4)" },
  intermediary: { color: "hsl(var(--intermediary))",  glow: "hsl(var(--intermediary) / 0.35)" },
  investor:     { color: "hsl(var(--investor))",      glow: "hsl(var(--investor) / 0.3)" },
};

const ORBITS: Record<string, { radius: number; count: number; speed: number }> = {
  issuer:       { radius: 72,  count: 5,  speed: 0.08 },
  intermediary: { radius: 120, count: 8,  speed: -0.05 },
  investor:     { radius: 168, count: 11, speed: 0.03 },
};

const CX = 220;
const CY = 220;
const VB = 440;

function buildNodes(): Node[] {
  const nodes: Node[] = [];
  Object.entries(ORBITS).forEach(([role, { count }]) => {
    const offset = role === "intermediary" ? 12 : role === "investor" ? 6 : 0;
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i + offset;
      nodes.push({ id: `${role}-${i}`, role: role as Node["role"], angle, baseAngle: angle, verified: Math.random() > 0.25 });
    }
  });
  return nodes;
}

function pos(role: string, angle: number) {
  const r = ORBITS[role].radius;
  const rad = (angle * Math.PI) / 180;
  return { x: CX + Math.cos(rad) * r, y: CY + Math.sin(rad) * r };
}

/* ── Component ── */
const HeroCosmicNetwork: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(() => buildNodes());
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [pulseKey, setPulseKey] = useState(0);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  // Slow orbital rotation via rAF
  useEffect(() => {
    let prev = performance.now();
    const tick = (now: number) => {
      const dt = (now - prev) / 1000;
      prev = now;
      timeRef.current += dt;
      setNodes(ns =>
        ns.map(n => ({
          ...n,
          angle: n.baseAngle + timeRef.current * ORBITS[n.role].speed * 60,
        }))
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Pulse wave
  useEffect(() => {
    const iv = setInterval(() => setPulseKey(k => k + 1), 3500);
    return () => clearInterval(iv);
  }, []);

  // Random sparks (cross-role connections)
  useEffect(() => {
    const iv = setInterval(() => {
      const pool = nodes;
      const a = pool[Math.floor(Math.random() * pool.length)];
      let b = pool[Math.floor(Math.random() * pool.length)];
      let attempts = 0;
      while ((b.id === a.id || b.role === a.role) && attempts < 10) {
        b = pool[Math.floor(Math.random() * pool.length)];
        attempts++;
      }
      if (b.id === a.id) return;
      const pA = pos(a.role, a.angle);
      const pB = pos(b.role, b.angle);
      setSparks(prev => [...prev.slice(-5), { id: `${a.id}-${b.id}-${Date.now()}`, from: pA, to: pB }]);
    }, 1800);
    return () => clearInterval(iv);
  }, [nodes]);

  // Expire sparks
  useEffect(() => {
    if (!sparks.length) return;
    const t = setTimeout(() => setSparks(p => p.slice(1)), 1400);
    return () => clearTimeout(t);
  }, [sparks]);

  return (
    <div
      className="relative w-full aspect-square max-w-[440px] mx-auto select-none"
      role="img"
      aria-label="India's First Financial Network — verified Issuers, Intermediaries and Investors connected in a compliance-governed ecosystem"
    >
      {/* Ambient glow behind SVG */}
      <div className="absolute inset-[10%] rounded-full bg-primary/[0.06] dark:bg-primary/[0.10] blur-3xl" />

      <svg viewBox={`0 0 ${VB} ${VB}`} className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="hero-center-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
            <stop offset="70%" stopColor="hsl(var(--primary))" stopOpacity="0.04" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="hero-pulse-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.12" />
            <stop offset="80%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </radialGradient>
          {/* Glow filter */}
          <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background radial */}
        <circle cx={CX} cy={CY} r="200" fill="url(#hero-center-glow)" />

        {/* Orbit rings — dashed, subtle */}
        {Object.entries(ORBITS).map(([role, { radius }]) => (
          <circle
            key={role}
            cx={CX} cy={CY} r={radius}
            fill="none"
            stroke={ROLE_META[role].color}
            strokeWidth={0.6}
            strokeDasharray="3 8"
            opacity={0.25}
          />
        ))}

        {/* Pulse wave */}
        <motion.circle
          key={pulseKey}
          cx={CX} cy={CY} r={30}
          fill="url(#hero-pulse-grad)"
          stroke="hsl(var(--primary))"
          strokeWidth={0.4}
          initial={{ r: 30, opacity: 0.5 }}
          animate={{ r: 200, opacity: 0 }}
          transition={{ duration: 2.8, ease: "easeOut" }}
        />

        {/* Sparks — cross-orbit connection lines */}
        <AnimatePresence>
          {sparks.map(s => (
            <motion.line
              key={s.id}
              x1={s.from.x} y1={s.from.y}
              x2={s.to.x} y2={s.to.y}
              stroke="hsl(var(--primary))"
              strokeWidth={0.7}
              strokeLinecap="round"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 0.35, pathLength: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          ))}
        </AnimatePresence>

        {/* Radial spokes — center to each node */}
        {nodes.map(n => {
          const p = pos(n.role, n.angle);
          return (
            <line
              key={`spoke-${n.id}`}
              x1={CX} y1={CY} x2={p.x} y2={p.y}
              stroke={ROLE_META[n.role].color}
              strokeWidth={0.25}
              opacity={0.1}
            />
          );
        })}

        {/* Nodes */}
        {nodes.map(n => {
          const p = pos(n.role, n.angle);
          const r = n.role === "issuer" ? 5.5 : n.role === "intermediary" ? 5 : 4.5;
          return (
            <g key={n.id}>
              {/* Breathing glow halo */}
              <motion.circle
                cx={p.x} cy={p.y} r={r + 6}
                fill={ROLE_META[n.role].glow}
                animate={{ r: [r + 5, r + 9, r + 5], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }}
              />
              {/* Solid node */}
              <circle
                cx={p.x} cy={p.y} r={r}
                fill={ROLE_META[n.role].color}
                stroke={n.verified ? "hsl(var(--primary-foreground))" : "transparent"}
                strokeWidth={n.verified ? 1 : 0}
              />
              {/* Tiny verified tick — small white check */}
              {n.verified && (
                <text x={p.x} y={p.y + 1.2} textAnchor="middle" fill="hsl(var(--primary-foreground))" fontSize="5" fontWeight="bold" className="pointer-events-none select-none">✓</text>
              )}
            </g>
          );
        })}

        {/* Center — FindOO core */}
        <motion.circle
          cx={CX} cy={CY} r={24}
          fill="hsl(var(--primary))"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
        <motion.circle
          cx={CX} cy={CY} r={30}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={0.8}
          opacity={0.25}
          animate={{ r: [30, 35, 30], opacity: [0.25, 0.1, 0.25] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Logo */}
        <image
          href={findooLogoIcon}
          x={CX - 15} y={CY - 15}
          width={30} height={30}
          className="pointer-events-none"
        />

        {/* Orbit role labels */}
        {Object.entries(ORBITS).map(([role, { radius }]) => (
          <text
            key={`lbl-${role}`}
            x={CX}
            y={CY - radius - 6}
            textAnchor="middle"
            fill={ROLE_META[role].color}
            className="text-[6px] font-medium uppercase tracking-[0.15em] opacity-35 select-none"
          >
            {role === "issuer" ? "Issuers" : role === "intermediary" ? "Intermediaries" : "Investors"}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default HeroCosmicNetwork;
