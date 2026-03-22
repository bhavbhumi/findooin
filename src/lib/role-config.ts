import { BarChart3, UserCheck, Landmark, Shield, Settings2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface RoleConfig {
  label: string;
  plural: string;
  icon: LucideIcon;
  color: string;        // text color class
  bgColor: string;      // bg + text + border classes for badges
  bannerGradient: string;
  hslVar: string;       // CSS variable name for avatar ring etc.
}

export const ROLE_CONFIG: Record<string, RoleConfig> = {
  investor: {
    label: "Investor",
    plural: "Investors",
    icon: BarChart3,
    color: "text-investor",
    bgColor: "bg-investor/10 text-investor border-investor/20",
    bannerGradient: "from-investor/20 via-investor/10 to-transparent",
    hslVar: "hsl(var(--investor))",
  },
  intermediary: {
    label: "Intermediary",
    plural: "Intermediaries",
    icon: UserCheck,
    color: "text-intermediary",
    bgColor: "bg-intermediary/10 text-intermediary border-intermediary/20",
    bannerGradient: "from-intermediary/20 via-intermediary/10 to-transparent",
    hslVar: "hsl(var(--intermediary))",
  },
  issuer: {
    label: "Issuer",
    plural: "Issuers",
    icon: Landmark,
    color: "text-issuer",
    bgColor: "bg-issuer/10 text-issuer border-issuer/20",
    bannerGradient: "from-issuer/20 via-issuer/10 to-transparent",
    hslVar: "hsl(var(--issuer))",
  },
  enabler: {
    label: "Enabler",
    plural: "Enablers",
    icon: Settings2,
    color: "text-enabler",
    bgColor: "bg-enabler/10 text-enabler border-enabler/20",
    bannerGradient: "from-enabler/20 via-enabler/10 to-transparent",
    hslVar: "hsl(var(--enabler))",
  },
  admin: {
    label: "Admin",
    plural: "Admins",
    icon: Shield,
    color: "text-primary",
    bgColor: "bg-primary/10 text-primary border-primary/20",
    bannerGradient: "from-primary/20 via-primary/10 to-transparent",
    hslVar: "hsl(var(--primary))",
  },
};

/** Get icon component for a role */
export function getRoleIcon(role: string): LucideIcon | null {
  return ROLE_CONFIG[role]?.icon ?? null;
}

/** Get badge classes for a role */
export function getRoleBadgeClasses(role: string): string {
  return ROLE_CONFIG[role]?.bgColor ?? "";
}
