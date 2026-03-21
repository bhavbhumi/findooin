import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Compass, Rss, ArrowRight } from "lucide-react";
import CosmicNetworkVisualization from "@/components/landing/CosmicNetworkVisualization";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const cosmicValueProps = [
  {
    icon: Shield,
    title: "A Universe of Verified Trust",
    subtitle: "Every profile is credential-checked against SEBI, AMFI, IRDAI & PFRDA registries — so you always know who you're dealing with.",
    orbit: "issuer",
  },
  {
    icon: Compass,
    title: "Constellations of Opportunity",
    subtitle: "Smart matching surfaces the right issuers, intermediaries, and investors for your goals — no cold outreach, just warm introductions.",
    orbit: "intermediary",
  },
  {
    icon: Rss,
    title: "Intelligence that Illuminates",
    subtitle: "Market commentary, research notes, and regulatory updates from verified professionals — curated signal, zero noise.",
    orbit: "investor",
  },
];

const CosmicValueSection: React.FC = () => {
  const [hoveredOrbit, setHoveredOrbit] = useState<string | null>(null);

  return (
    <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
      {/* Left — Cosmic Network Visualization */}
      <motion.div
        className="mb-6 lg:mb-0"
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <CosmicNetworkVisualization highlightedOrbit={hoveredOrbit} />
      </motion.div>

      {/* Right — Value prop cards */}
      <div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-1">
            Your Financial Cosmos
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base mb-4">
            A living universe of trust, opportunity, and insight.
          </p>
        </motion.div>

        <div className="space-y-3">
          {cosmicValueProps.map((prop, i) => (
            <motion.div
              key={prop.title}
              className="group flex gap-3 p-3 rounded-lg border border-transparent hover:border-border/60 hover:bg-card/50 transition-all duration-300 cursor-default"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
              onMouseEnter={() => setHoveredOrbit(prop.orbit)}
              onMouseLeave={() => setHoveredOrbit(null)}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-lg bg-primary/[0.08] flex items-center justify-center group-hover:bg-primary/[0.14] transition-colors duration-300">
                  <prop.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-foreground mb-1 group-hover:text-primary transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_hsl(var(--primary)/0.3)]">
                  {prop.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {prop.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explore link */}
        <motion.div
          className="mt-4 pl-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            Explore our Platform <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default CosmicValueSection;
