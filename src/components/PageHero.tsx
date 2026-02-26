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

export const PageHero = ({ breadcrumb, title, titleAccent, subtitle, decoration }: PageHeroProps) => (
  <section className="relative pt-8 pb-10 overflow-hidden bg-gradient-to-b from-primary/[0.04] to-transparent">
    {/* Decorative shape */}
    {decoration && (
      <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
        {decoration}
      </div>
    )}

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
