/**
 * Contextual Space Elements — page-specific animated decorations
 * that reinforce the networking metaphor of each section.
 *
 * Feed      → SignalStreams     — horizontal data pulses (information flow)
 * Network   → ConstellationWeb — interconnected twinkling nodes (relationships)
 * Jobs      → LaunchStreaks     — upward trajectory lines (career growth)
 * Events    → SupernovaBurst   — radial particle emissions (gatherings)
 * Directory → NebulaClusters   — grouped glowing clouds (product ecosystem)
 * Messages  → QuantumLinks     — paired particles with connecting lines
 * Discover  → PulsarBeacon     — rotating sweep beam (search / radar)
 * Opinions  → PulseWaves       — radiating concentric rings (voice / signal)
 */
import { motion } from "framer-motion";

/* ───────────────────── Feed: Signal Streams ───────────────────── */
export const SignalStreams = ({ className = "" }: { className?: string }) => {
  const streams = Array.from({ length: 5 }, (_, i) => ({
    top: 12 + i * 18,
    width: 40 + (i % 3) * 20,
    duration: 3 + (i % 3) * 1.5,
    delay: i * 2.5,
    opacity: 0.15 + (i % 3) * 0.08,
    dotSize: 3 + (i % 2) * 2,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {streams.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${s.top}%`,
            left: 0,
            right: 0,
            height: "1px",
          }}
        >
          {/* Travelling data pulse */}
          <motion.div
            className="absolute h-px"
            style={{
              width: `${s.width}px`,
              background: `linear-gradient(90deg, transparent, hsl(var(--primary) / ${s.opacity}), hsl(var(--accent) / ${s.opacity * 0.7}), transparent)`,
            }}
            animate={{ x: ["-10%", "110%"] }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              ease: "linear",
              delay: s.delay,
              repeatDelay: 4 + i * 2,
            }}
          >
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: s.dotSize,
                height: s.dotSize,
                background: `radial-gradient(circle, hsl(var(--primary) / 0.6), transparent)`,
                boxShadow: `0 0 4px hsl(var(--primary) / 0.3)`,
              }}
            />
          </motion.div>
          {/* Faint static line */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.04] to-transparent" />
        </motion.div>
      ))}
    </div>
  );
};

/* ───────────────── Network: Constellation Web ─────────────────── */
export const ConstellationWeb = ({ className = "" }: { className?: string }) => {
  const nodes = Array.from({ length: 8 }, (_, i) => ({
    x: 10 + ((i * 67.3) % 80),
    y: 15 + ((i * 43.7) % 70),
    size: 2 + (i % 3),
    pulse: 2.5 + (i % 4) * 1.2,
    delay: (i % 5) * 0.6,
  }));

  // Connections between nearby nodes
  const connections = [
    [0, 1], [1, 2], [2, 4], [3, 5], [4, 6], [5, 7], [0, 3], [6, 7],
  ];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {connections.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="hsl(var(--primary))"
            strokeWidth="0.15"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0.1, 0.2] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </svg>
      {nodes.map((n, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: n.size,
            height: n.size,
            background: `radial-gradient(circle, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.15))`,
            boxShadow: `0 0 ${n.size * 2}px hsl(var(--primary) / 0.2)`,
          }}
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: n.pulse,
            repeat: Infinity,
            ease: "easeInOut",
            delay: n.delay,
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────── Jobs: Launch Streaks ──────────────────────── */
export const LaunchStreaks = ({ className = "" }: { className?: string }) => {
  const streaks = Array.from({ length: 4 }, (_, i) => ({
    left: 15 + i * 22,
    height: 30 + (i % 3) * 15,
    duration: 2.5 + (i % 2) * 1.5,
    delay: i * 3,
    angle: -8 + (i % 3) * 4,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {streaks.map((s, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${s.left}%`,
            bottom: 0,
            width: "1px",
            height: `${s.height}%`,
            transformOrigin: "bottom center",
            transform: `rotate(${s.angle}deg)`,
          }}
        >
          <motion.div
            className="absolute bottom-0 left-0 w-full"
            style={{
              height: "40px",
              background: `linear-gradient(to top, transparent, hsl(var(--primary) / 0.25), hsl(var(--primary) / 0.08), transparent)`,
            }}
            animate={{ y: ["100%", "-200%"] }}
            transition={{
              duration: s.duration,
              repeat: Infinity,
              ease: "easeOut",
              delay: s.delay,
              repeatDelay: 6 + i * 2,
            }}
          >
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
              style={{
                background: `radial-gradient(circle, hsl(var(--primary) / 0.7), transparent)`,
                boxShadow: `0 0 6px hsl(var(--primary) / 0.4)`,
              }}
            />
          </motion.div>
          {/* Faint trail line */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-foreground/[0.03] to-transparent" />
        </motion.div>
      ))}
    </div>
  );
};

/* ──────────────── Events: Supernova Burst ──────────────────────── */
export const SupernovaBurst = ({ className = "" }: { className?: string }) => {
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * 30) * (Math.PI / 180);
    const distance = 25 + (i % 3) * 15;
    return {
      endX: Math.cos(angle) * distance,
      endY: Math.sin(angle) * distance,
      size: 1.5 + (i % 3),
      duration: 3 + (i % 4) * 1,
      delay: (i % 6) * 0.3,
    };
  });

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {/* Central glow */}
      <motion.div
        className="absolute"
        style={{
          left: "75%",
          top: "40%",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: `radial-gradient(circle, hsl(var(--primary) / 0.4), transparent)`,
          boxShadow: `0 0 20px 5px hsl(var(--primary) / 0.15)`,
        }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Radial particles */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: "75%",
            top: "40%",
            width: p.size,
            height: p.size,
            background: `hsl(var(--primary) / 0.4)`,
          }}
          animate={{
            x: [0, p.endX, 0],
            y: [0, p.endY, 0],
            opacity: [0, 0.5, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
            repeatDelay: 2,
          }}
        />
      ))}
    </div>
  );
};

/* ───────────────── Directory: Nebula Clusters ─────────────────── */
export const NebulaClusters = ({ className = "" }: { className?: string }) => {
  const clusters = [
    { x: 20, y: 30, size: 80, color: "--primary", opacity: 0.06 },
    { x: 70, y: 50, size: 100, color: "--accent", opacity: 0.05 },
    { x: 45, y: 70, size: 60, color: "--primary", opacity: 0.07 },
    { x: 85, y: 25, size: 50, color: "--primary", opacity: 0.04 },
  ];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {clusters.map((c, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-2xl"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size,
            background: `radial-gradient(circle, hsl(var(${c.color}) / ${c.opacity}), transparent)`,
            transform: "translate(-50%, -50%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}
      {/* Tiny cluster stars */}
      {Array.from({ length: 6 }, (_, i) => (
        <motion.div
          key={`s-${i}`}
          className="absolute rounded-full bg-primary/30"
          style={{
            left: `${15 + ((i * 53) % 70)}%`,
            top: `${20 + ((i * 37) % 60)}%`,
            width: 2,
            height: 2,
          }}
          animate={{ opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.8 }}
        />
      ))}
    </div>
  );
};

/* ───────────────── Messages: Quantum Links ────────────────────── */
export const QuantumLinks = ({ className = "" }: { className?: string }) => {
  const pairs = [
    { x1: 15, y1: 30, x2: 40, y2: 45 },
    { x1: 55, y1: 20, x2: 80, y2: 35 },
    { x1: 30, y1: 65, x2: 65, y2: 75 },
  ];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {pairs.map((p, i) => (
          <motion.line
            key={i}
            x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2}
            stroke="hsl(var(--primary))"
            strokeWidth="0.12"
            strokeDasharray="1 2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.25, 0.1, 0.25, 0] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.5 }}
          />
        ))}
      </svg>
      {pairs.flatMap((p, i) => [
        <motion.div
          key={`a-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x1}%`, top: `${p.y1}%`, width: 4, height: 4,
            background: `radial-gradient(circle, hsl(var(--primary) / 0.5), transparent)`,
            boxShadow: `0 0 6px hsl(var(--primary) / 0.25)`,
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 1.5 }}
        />,
        <motion.div
          key={`b-${i}`}
          className="absolute rounded-full"
          style={{
            left: `${p.x2}%`, top: `${p.y2}%`, width: 4, height: 4,
            background: `radial-gradient(circle, hsl(var(--accent) / 0.5), transparent)`,
            boxShadow: `0 0 6px hsl(var(--accent) / 0.25)`,
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 1.5 + 0.5 }}
        />,
      ])}
    </div>
  );
};

/* ────────────────── Discover: Pulsar Beacon ───────────────────── */
export const PulsarBeacon = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
    {/* Rotating sweep */}
    <motion.div
      className="absolute"
      style={{
        left: "80%",
        top: "50%",
        width: 120,
        height: 120,
        transform: "translate(-50%, -50%)",
        background: `conic-gradient(from 0deg, transparent 0deg, hsl(var(--primary) / 0.08) 30deg, transparent 60deg)`,
        borderRadius: "50%",
      }}
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
    {/* Center dot */}
    <motion.div
      className="absolute rounded-full"
      style={{
        left: "80%", top: "50%", width: 4, height: 4, transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, hsl(var(--primary) / 0.6), transparent)`,
        boxShadow: `0 0 8px hsl(var(--primary) / 0.3)`,
      }}
      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
    {/* Ping rings */}
    {[0, 1, 2].map(i => (
      <motion.div
        key={i}
        className="absolute rounded-full border border-primary/10"
        style={{
          left: "80%", top: "50%", width: 40 + i * 30, height: 40 + i * 30,
          transform: "translate(-50%, -50%)",
        }}
        animate={{ scale: [1, 1.5], opacity: [0.2, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
      />
    ))}
  </div>
);

/* ────────────────── Opinions: Pulse Waves ─────────────────────── */
export const PulseWaves = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
    {/* Radiating concentric rings from a focal point */}
    {[0, 1, 2, 3].map(i => (
      <motion.div
        key={i}
        className="absolute rounded-full border border-primary/15"
        style={{
          left: "20%",
          top: "55%",
          width: 30 + i * 25,
          height: 30 + i * 25,
          transform: "translate(-50%, -50%)",
        }}
        animate={{
          scale: [1, 2.5],
          opacity: [0.25, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: i * 1,
          ease: "easeOut",
        }}
      />
    ))}
    {/* Voice node */}
    <motion.div
      className="absolute rounded-full"
      style={{
        left: "20%", top: "55%", width: 5, height: 5, transform: "translate(-50%, -50%)",
        background: `radial-gradient(circle, hsl(var(--primary) / 0.5), transparent)`,
        boxShadow: `0 0 10px hsl(var(--primary) / 0.2)`,
      }}
      animate={{ scale: [1, 1.3, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
    />
  </div>
);
