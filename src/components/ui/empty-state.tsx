/**
 * EmptyState — Personality-driven empty state with optional SVG illustration.
 */
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { type ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryLink?: string;
  /** Optional SVG illustration component to replace the icon */
  illustration?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  secondaryLabel,
  secondaryLink,
  illustration,
}: EmptyStateProps) {
  return (
    <motion.div
      className="rounded-xl border border-border bg-card p-12 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {illustration ? (
        <motion.div
          className="mx-auto mb-4 flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {illustration}
        </motion.div>
      ) : (
        <motion.div
          className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-gold/10 flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className="h-8 w-8 text-primary/60" />
        </motion.div>
      )}
      <h3 className="font-heading font-semibold text-foreground text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6 leading-relaxed">{description}</p>
      <div className="flex items-center justify-center gap-3">
        {actionLabel && (actionLink ? (
          <Button asChild size="sm">
            <Link to={actionLink}>{actionLabel}</Link>
          </Button>
        ) : onAction ? (
          <Button size="sm" onClick={onAction}>{actionLabel}</Button>
        ) : null)}
        {secondaryLabel && secondaryLink && (
          <Button variant="outline" size="sm" asChild>
            <Link to={secondaryLink}>{secondaryLabel}</Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
