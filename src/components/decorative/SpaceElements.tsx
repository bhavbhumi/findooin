import { motion } from "framer-motion";

/**
 * Floating dust particles — tiny specks drifting slowly
 */
export const SpaceDust = ({
  count = 20,
  className = "",
}: {
  count?: number;
  className?: string;
}) => {
  // Deterministic positions using simple math
  const particles = Array.from({ length: count }, (_, i) => {
    const seed = (i * 137.508) % 100; // golden angle distribution
    return {
      x: seed,
      y: ((i * 61.8) % 100),
      size: 1 + (i % 3) * 0.8,
      duration: 12 + (i % 7) * 4,
      delay: (i % 5) * 1.5,
      opacity: 0.15 + (i % 4) * 0.1,
      drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 5) * 4),
    };
  });

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-foreground/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, p.drift, 0],
            x: [0, p.drift * 0.5, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
};

/**
 * Comet streaks — thin bright lines that travel across the section
 */
export const CometStreaks = ({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) => {
  const comets = Array.from({ length: count }, (_, i) => ({
    top: 15 + (i * 30),
    delay: i * 5,
    duration: 4 + (i % 2) * 2,
    angle: -15 + (i % 3) * 8,
    length: 60 + (i % 3) * 30,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {comets.map((c, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: `${c.top}%`,
            left: "-10%",
            width: `${c.length}px`,
            height: "1px",
            background: `linear-gradient(90deg, transparent, hsl(var(--primary) / 0.4), hsl(var(--primary) / 0.15), transparent)`,
            transform: `rotate(${c.angle}deg)`,
            transformOrigin: "left center",
          }}
          animate={{
            x: ["-10vw", "120vw"],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: c.duration,
            repeat: Infinity,
            ease: "linear",
            delay: c.delay,
            repeatDelay: 8 + i * 3,
          }}
        >
          {/* Comet head — bright dot */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
            style={{
              background: `radial-gradient(circle, hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.2), transparent)`,
              boxShadow: `0 0 6px 1px hsl(var(--primary) / 0.3)`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Distant stars — static twinkling specks
 */
export const DistantStars = ({
  count = 12,
  className = "",
}: {
  count?: number;
  className?: string;
}) => {
  const stars = Array.from({ length: count }, (_, i) => ({
    x: ((i * 73.13) % 100),
    y: ((i * 47.91) % 100),
    size: 1 + (i % 2),
    twinkleDuration: 3 + (i % 4) * 1.5,
    delay: (i % 6) * 0.8,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-foreground"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{
            opacity: [0.08, 0.3, 0.08],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: s.twinkleDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
};
