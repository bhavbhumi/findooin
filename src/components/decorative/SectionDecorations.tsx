import { motion } from "framer-motion";

/**
 * Subtle dot grid pattern — greyscale, very low opacity
 */
export const DotGrid = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="fill-foreground/[0.06]" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
    </svg>
  </div>
);

/**
 * Animated SVG network mesh background
 */
export const NetworkMesh = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="network-mesh" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <circle cx="40" cy="40" r="1.5" className="fill-primary" />
          <line x1="0" y1="40" x2="80" y2="40" className="stroke-primary" strokeWidth="0.5" />
          <line x1="40" y1="0" x2="40" y2="80" className="stroke-primary" strokeWidth="0.5" />
          <line x1="0" y1="0" x2="80" y2="80" className="stroke-primary" strokeWidth="0.3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#network-mesh)" />
    </svg>
  </div>
);

type GlowPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
type GlowColor = "primary" | "accent" | "gold";
type GlowSize = "sm" | "md" | "lg" | "xl";

const positionMap: Record<GlowPosition, string> = {
  "top-left": "-top-32 -left-32",
  "top-right": "-top-32 -right-32",
  "bottom-left": "-bottom-32 -left-32",
  "bottom-right": "-bottom-32 -right-32",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

const colorMap: Record<GlowColor, string> = {
  primary: "bg-primary/10",
  accent: "bg-accent/10",
  gold: "bg-amber-400/10",
};

const sizeMap: Record<GlowSize, string> = {
  sm: "w-48 h-48",
  md: "w-72 h-72",
  lg: "w-96 h-96",
  xl: "w-[28rem] h-[28rem]",
};

export const GlowBlob = ({
  position = "top-left",
  color = "primary",
  size = "lg",
  className = "",
}: {
  position?: GlowPosition;
  color?: GlowColor;
  size?: GlowSize;
  className?: string;
}) => (
  <div
    className={`absolute rounded-full blur-3xl pointer-events-none ${positionMap[position]} ${colorMap[color]} ${sizeMap[size]} ${className}`}
    aria-hidden="true"
  />
);

/**
 * Sparkle-like floating dots
 */
export const Sparkles = ({ className = "" }: { className?: string }) => (
  <motion.div
    className={`absolute pointer-events-none ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    aria-hidden="true"
  >
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full bg-primary/30"
        style={{ left: `${20 + i * 15}%`, top: `${10 + i * 18}%` }}
        animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </motion.div>
);

/**
 * Concentric rings decoration
 */
export const ConcentricRings = ({ className = "" }: { className?: string }) => (
  <div className={`absolute pointer-events-none opacity-[0.04] ${className}`} aria-hidden="true">
    <svg width="200" height="200" viewBox="0 0 200 200">
      {[30, 50, 70, 90].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} fill="none" className="stroke-primary" strokeWidth="0.5" />
      ))}
    </svg>
  </div>
);

/**
 * Diamond grid pattern
 */
export const DiamondGrid = ({ className = "" }: { className?: string }) => (
  <div className={`absolute pointer-events-none opacity-[0.03] ${className}`} aria-hidden="true">
    <svg width="120" height="120" viewBox="0 0 120 120">
      {[0, 30, 60, 90].map((x) =>
        [0, 30, 60, 90].map((y) => (
          <rect
            key={`${x}-${y}`}
            x={x + 10}
            y={y + 10}
            width="10"
            height="10"
            transform={`rotate(45 ${x + 15} ${y + 15})`}
            fill="none"
            className="stroke-primary"
            strokeWidth="0.5"
          />
        ))
      )}
    </svg>
  </div>
);
