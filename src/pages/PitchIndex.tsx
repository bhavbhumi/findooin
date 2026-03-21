import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { pitchDecks } from "@/data/pitchDecks";
import { ArrowRight, Play, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.45, ease: "easeOut" as const },
  }),
};

const PitchIndex = () => {
  usePageMeta({
    title: "Pitch Decks — FindOO",
    description: "Explore FindOO pitch presentations tailored for regulators, issuers, intermediaries, and investors.",
  });

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Pitch Decks"
        title="Why"
        titleAccent="FindOO?"
        subtitle="Four perspectives. One platform. Explore how FindOO serves every participant in India's financial ecosystem."
        variant="hexagons"
        context="pitch"
      />

      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="grid sm:grid-cols-2 gap-6">
            {pitchDecks.map((deck, i) => (
              <motion.div
                key={deck.slug}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i}
              >
                <Link
                  to={`/pitch/${deck.slug}`}
                  className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Preview header */}
                  <div
                    className="relative h-48 flex items-end p-6"
                    style={{
                      background: `linear-gradient(135deg, hsl(230 25% 12%), hsl(${deck.colorHsl}))`,
                    }}
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                        {deck.slides.length} slides
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Play className="w-7 h-7 text-white ml-1" />
                      </div>
                    </div>
                    <div>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-2"
                        style={{
                          background: `hsla(${deck.colorHsl} / 0.3)`,
                          color: "white",
                        }}
                      >
                        <deck.icon className="w-3.5 h-3.5" />
                        {deck.persona}
                      </div>
                      <h3 className="text-xl font-bold text-white">{deck.tagline}</h3>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {deck.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                        View Presentation <ArrowRight className="w-4 h-4" />
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        {deck.slides.length} slides
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default PitchIndex;
