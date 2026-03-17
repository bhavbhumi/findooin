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
  fire: "ring-2 ring-offset-2 ring-offset-background ring-[hsl(var(--gold))] animate-pulse",
  diamond: "ring-2 ring-offset-2 ring-offset-background ring-[hsl(var(--status-highlight))]",
  legendary: "ring-[3px] ring-offset-2 ring-offset-background ring-[hsl(var(--gold))]",
};

export function FlairAvatarWrapper({ avatarBorder, children, className }: FlairAvatarWrapperProps) {
  if (avatarBorder === "legendary") {
    return (
      <div className={cn("relative", className)}>
        <motion.div
          className="absolute -inset-1 rounded-full opacity-60"
          style={{
            background: "conic-gradient(from 0deg, hsl(var(--gold)), hsl(var(--status-highlight)), hsl(var(--gold)), hsl(var(--investor)), hsl(var(--gold)))",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        <div className="relative rounded-full bg-background p-[2px]">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(borderStyles[avatarBorder] || "", "rounded-full", className)}>
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
          backgroundImage: "linear-gradient(90deg, hsl(var(--gold)), hsl(46, 80%, 65%), hsl(var(--gold)))",
          backgroundSize: "200% auto",
          animation: "shimmer 2.5s linear infinite",
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
