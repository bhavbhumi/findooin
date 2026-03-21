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
  const particles = Array.from({ length: count }, (_, i) => {
    const seed = (i * 137.508) % 100;
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

/**
 * Asteroids — irregular rocky shapes that drift and tumble slowly.
 * Mix of sizes: mostly tiny background rocks + one slightly larger per section.
 */
export const Asteroids = ({
  count = 4,
  className = "",
}: {
  count?: number;
  className?: string;
}) => {
  // Irregular asteroid SVG shapes (different silhouettes)
  const shapes = [
    "M12 2 L18 6 L20 14 L16 20 L8 18 L4 12 L6 6 Z",        // chunky
    "M10 1 L16 4 L19 10 L17 17 L10 19 L4 15 L2 8 L5 3 Z",   // elongated
    "M8 2 L14 3 L18 8 L16 15 L12 18 L5 16 L2 10 L4 5 Z",    // irregular
    "M11 1 L17 5 L20 12 L15 19 L9 18 L3 13 L2 7 L7 3 Z",    // jagged
  ];

  const asteroids = Array.from({ length: count }, (_, i) => {
    const isLarge = i === 0; // first one is the "hero" asteroid
    return {
      x: ((i * 83.7) % 85) + 5,
      y: ((i * 59.3) % 80) + 10,
      size: isLarge ? 18 + (i % 3) * 4 : 8 + (i % 4) * 3,
      rotation: (i * 47) % 360,
      tumbleDuration: 20 + (i % 5) * 8,
      driftDuration: 30 + (i % 4) * 10,
      driftX: (i % 2 === 0 ? 1 : -1) * (15 + (i % 3) * 10),
      driftY: (i % 2 === 0 ? -1 : 1) * (8 + (i % 3) * 6),
      opacity: isLarge ? 0.12 : 0.08 + (i % 3) * 0.03,
      shape: shapes[i % shapes.length],
      delay: (i % 4) * 2,
    };
  });

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {asteroids.map((a, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${a.x}%`,
            top: `${a.y}%`,
          }}
          animate={{
            x: [0, a.driftX, 0],
            y: [0, a.driftY, 0],
          }}
          transition={{
            duration: a.driftDuration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: a.delay,
          }}
        >
          <motion.svg
            width={a.size}
            height={a.size}
            viewBox="0 0 22 22"
            className="text-foreground"
            style={{ opacity: a.opacity }}
            animate={{ rotate: [a.rotation, a.rotation + 360] }}
            transition={{
              duration: a.tumbleDuration,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <path
              d={a.shape}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity="0.6"
            />
          </motion.svg>
        </motion.div>
      ))}
    </div>
  );
};
