import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface PageHeroProps {
  breadcrumb: string;
  title: string;
  titleAccent?: string;
  subtitle: string;
  decoration?: React.ReactNode;
}

export const PageHero = ({ breadcrumb, title, titleAccent, subtitle }: PageHeroProps) => (
  <section className="relative pt-8 pb-12 overflow-hidden bg-gradient-to-b from-primary/[0.04] to-transparent">
    {/* ── Geometric decorations ── */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Large circle — top right */}
      <motion.div
        className="absolute -top-10 -right-10 w-[220px] h-[220px] rounded-full border border-primary/[0.08]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      {/* Medium circle — nested */}
      <motion.div
        className="absolute top-6 right-6 w-[140px] h-[140px] rounded-full border border-primary/[0.06]"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
      />
      {/* Small filled dot */}
      <motion.div
        className="absolute top-[60px] right-[60px] w-3 h-3 rounded-full bg-primary/[0.08]"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
      />

      {/* Diagonal line — top left area */}
      <motion.div
        className="absolute -top-4 left-[10%] w-px h-20 bg-gradient-to-b from-transparent via-primary/[0.08] to-transparent origin-top"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      />
      {/* Short horizontal bar */}
      <motion.div
        className="absolute top-16 left-[8%] w-8 h-px bg-primary/[0.1]"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      />

      {/* Diamond — bottom right */}
      <motion.div
        className="absolute bottom-4 right-[20%] w-5 h-5 border border-primary/[0.07] rotate-45"
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 1, rotate: 45 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      />

      {/* Square outline — mid-left */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 left-[3%] w-6 h-6 border border-primary/[0.06] rounded-sm"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
      />

      {/* Floating dots — scattered */}
      <motion.div
        className="absolute top-[30%] right-[35%] w-1.5 h-1.5 rounded-full bg-primary/[0.06]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.6, 1] }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 0.8 }}
      />
      <motion.div
        className="absolute bottom-6 left-[25%] w-2 h-2 rounded-full bg-primary/[0.05]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.4, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1.2 }}
      />
    </div>

    <div className="container relative">
      {/* Breadcrumb */}
      <motion.div
        className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{breadcrumb}</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        className="text-3xl sm:text-4xl lg:text-[42px] font-bold font-heading text-foreground tracking-tight leading-tight mb-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
      >
        {title}{" "}
        {titleAccent && <span className="text-primary">{titleAccent}</span>}
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
      >
        {subtitle}
      </motion.p>
    </div>
  </section>
);
