/**
 * ProfileFlair — Animated avatar borders and name effects based on level.
 * Levels 3+: fire border | Levels 4+: diamond border + glow name | Level 5: legendary + golden shimmer
 */
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface FlairAvatarWrapperProps {
  avatarBorder: string;
  children: React.ReactNode;
  className?: string;
}

const borderStyles: Record<string, string> = {
  none: "",
  fire: "ring-[3px] ring-offset-2 ring-offset-background ring-[hsl(var(--gold))] animate-pulse",
  diamond: "ring-[3px] ring-offset-2 ring-offset-background ring-[hsl(var(--status-highlight))]",
  legendary: "ring-[3px] ring-offset-2 ring-offset-background ring-[hsl(var(--gold))]",
};

export function FlairAvatarWrapper({ avatarBorder, children, className }: FlairAvatarWrapperProps) {
  if (avatarBorder === "legendary") {
    return (
      <div className={cn("relative", className)}>
        <motion.div
          className="absolute -inset-1.5 rounded-full opacity-95"
          style={{
            background: "conic-gradient(from 0deg, hsl(var(--gold)), hsl(var(--status-highlight)), hsl(var(--investor)), hsl(var(--primary)), hsl(var(--gold)))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        />
        <div
          className="relative rounded-full bg-background p-[3px]"
          style={{ boxShadow: "0 0 0 2px hsl(var(--background)), 0 0 18px hsl(var(--gold) / 0.55)" }}
        >
          {children}
        </div>
      </div>
    );
  }

  const borderGlow = avatarBorder === "fire"
    ? "0 0 0 2px hsl(var(--background)), 0 0 16px hsl(var(--gold) / 0.5)"
    : avatarBorder === "diamond"
      ? "0 0 0 2px hsl(var(--background)), 0 0 16px hsl(var(--status-highlight) / 0.55)"
      : undefined;

  return (
    <div className={cn(borderStyles[avatarBorder] || "", "rounded-full", className)} style={borderGlow ? { boxShadow: borderGlow } : undefined}>
      {children}
    </div>
  );
}

interface FlairNameProps {
  nameEffect: string;
  children: React.ReactNode;
  className?: string;
}

export function FlairName({ nameEffect, children, className }: FlairNameProps) {
  if (nameEffect === "golden_shimmer") {
    return (
      <span
        className={cn("relative inline-block bg-clip-text text-transparent font-semibold", className)}
        style={{
          backgroundImage: "linear-gradient(90deg, hsl(var(--gold)), hsl(46 94% 58%), hsl(var(--gold)))",
          backgroundSize: "220% auto",
          animation: "shimmer 1.8s linear infinite",
          textShadow: "0 0 12px hsl(var(--gold) / 0.35)",
        }}
      >
        {children}
      </span>
    );
  }

  if (nameEffect === "glow") {
    return (
      <span
        className={cn("relative", className)}
        style={{
          textShadow: "0 0 8px hsl(var(--status-highlight) / 0.4)",
        }}
      >
        {children}
      </span>
    );
  }

  return <span className={className}>{children}</span>;
}
