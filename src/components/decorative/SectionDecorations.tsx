import { motion } from "framer-motion";

/**
 * Subtle dot grid pattern — greyscale, very low opacity
 */
export const DotGrid = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" className="text-foreground/[0.04]" />
    </svg>
  </div>
);

/**
 * Fine cross-hatch grid lines
 */
export const GridLines = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid-lines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <line x1="60" y1="0" x2="60" y2="60" stroke="currentColor" strokeWidth="0.5" />
          <line x1="0" y1="60" x2="60" y2="60" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-lines)" className="text-foreground/[0.03]" />
    </svg>
  </div>
);

/**
 * Abstract network mesh lines — connects random nodes
 */
export const NetworkMesh = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="none">
      {/* Nodes */}
      <circle cx="120" cy="80" r="2" fill="currentColor" className="text-primary" />
      <circle cx="300" cy="150" r="2.5" fill="currentColor" className="text-primary" />
      <circle cx="500" cy="60" r="2" fill="currentColor" className="text-primary" />
      <circle cx="700" cy="200" r="3" fill="currentColor" className="text-primary" />
      <circle cx="180" cy="350" r="2" fill="currentColor" className="text-primary" />
      <circle cx="400" cy="400" r="2.5" fill="currentColor" className="text-primary" />
      <circle cx="650" cy="450" r="2" fill="currentColor" className="text-primary" />
      <circle cx="80" cy="500" r="2.5" fill="currentColor" className="text-primary" />
      <circle cx="550" cy="280" r="2" fill="currentColor" className="text-primary" />
      {/* Connections */}
      <line x1="120" y1="80" x2="300" y2="150" stroke="currentColor" strokeWidth="0.6" className="text-primary" />
      <line x1="300" y1="150" x2="500" y2="60" stroke="currentColor" strokeWidth="0.6" className="text-primary" />
      <line x1="500" y1="60" x2="700" y2="200" stroke="currentColor" strokeWidth="0.6" className="text-primary" />
      <line x1="300" y1="150" x2="550" y2="280" stroke="currentColor" strokeWidth="0.4" className="text-primary" />
      <line x1="180" y1="350" x2="400" y2="400" stroke="currentColor" strokeWidth="0.6" className="text-primary" />
      <line x1="400" y1="400" x2="650" y2="450" stroke="currentColor" strokeWidth="0.6" className="text-primary" />
      <line x1="80" y1="500" x2="180" y2="350" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
      <line x1="550" y1="280" x2="700" y2="200" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
      <line x1="120" y1="80" x2="180" y2="350" stroke="currentColor" strokeWidth="0.3" className="text-primary" />
      <line x1="550" y1="280" x2="400" y2="400" stroke="currentColor" strokeWidth="0.4" className="text-primary" />
    </svg>
  </div>
);

/**
 * Gradient glow blob — positioned absolutely
 */
export const GlowBlob = ({
  position = "top-right",
  color = "primary",
  size = "lg",
  className = "",
}: {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "center";
  color?: "primary" | "accent" | "gold" | "issuer" | "intermediary" | "investor";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) => {
  const positionClasses = {
    "top-right": "-top-32 -right-32",
    "top-left": "-top-32 -left-32",
    "bottom-right": "-bottom-32 -right-32",
    "bottom-left": "-bottom-32 -left-32",
    center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  };
  const sizeClasses = {
    sm: "w-[200px] h-[200px]",
    md: "w-[300px] h-[300px]",
    lg: "w-[450px] h-[450px]",
    xl: "w-[600px] h-[600px]",
  };
  const colorClasses = {
    primary: "from-primary/[0.06] to-primary/[0.01]",
    accent: "from-accent/[0.06] to-accent/[0.01]",
    gold: "from-gold/[0.08] to-gold/[0.01]",
    issuer: "from-issuer/[0.06] to-issuer/[0.01]",
    intermediary: "from-intermediary/[0.06] to-intermediary/[0.01]",
    investor: "from-investor/[0.06] to-investor/[0.01]",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} ${sizeClasses[size]} rounded-full bg-gradient-radial ${colorClasses[color]} blur-3xl pointer-events-none ${className}`}
      style={{ background: `radial-gradient(circle, hsl(var(--${color}) / 0.07), transparent 70%)` }}
    />
  );
};

/**
 * Floating sparkle dots — animated
 */
export const Sparkles = ({ count = 5, className = "" }: { count?: number; className?: string }) => {
  const sparkleData = Array.from({ length: count }, (_, i) => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {sparkleData.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gold/30"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/**
 * Concentric ring decoration
 */
export const ConcentricRings = ({ className = "" }: { className?: string }) => (
  <div className={`absolute pointer-events-none ${className}`}>
    <div className="relative">
      <div className="w-[200px] h-[200px] rounded-full border border-primary/[0.06]" />
      <div className="absolute inset-4 rounded-full border border-primary/[0.04]" />
      <div className="absolute inset-8 rounded-full border border-primary/[0.03]" />
      <div className="absolute inset-12 rounded-full border border-primary/[0.02]" />
    </div>
  </div>
);

/**
 * Diamond grid decoration (rotating squares)
 */
export const DiamondGrid = ({ className = "" }: { className?: string }) => (
  <div className={`absolute pointer-events-none opacity-[0.05] ${className}`}>
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 border border-primary rotate-45"
          style={{ opacity: 0.3 + Math.random() * 0.7 }}
        />
      ))}
    </div>
  </div>
);
