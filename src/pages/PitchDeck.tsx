import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, Link, Navigate } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { getDeckBySlug } from "@/data/pitchDecks";
import SlideRenderer from "@/components/pitch/SlideRenderer";
import PresentationMode from "@/components/pitch/PresentationMode";
import { Play, ArrowLeft, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const PitchDeck = () => {
  const { persona } = useParams<{ persona: string }>();
  const deck = getDeckBySlug(persona || "");
  const [presenting, setPresenting] = useState(false);
  const [startSlide, setStartSlide] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  usePageMeta({
    title: deck ? `${deck.persona} Pitch — findoo` : "Pitch Deck",
    description: deck?.description || "",
  });

  if (!deck) return <Navigate to="/pitch" replace />;

  const openPresentation = (slideIndex: number = 0) => {
    setStartSlide(slideIndex);
    setPresenting(true);
  };

  return (
    <>
      <PublicPageLayout>
        <PageHero
          breadcrumb={`Pitch Decks / ${deck.persona}`}
          title={deck.tagline}
          titleAccent={`for ${deck.persona}s`}
          subtitle={deck.description}
          variant="hexagons"
        />

        {/* Sticky action bar */}
        <div className="border-b border-border bg-background sticky top-16 z-30">
          <div className="container flex items-center justify-between py-3">
            <Link to="/pitch" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              All Decks
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{deck.slides.length} slides</span>
              <Button onClick={() => openPresentation(0)} size="sm" className="gap-2">
                <Monitor className="w-4 h-4" />
                Present Fullscreen
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll-through slides */}
        <section className="py-10" ref={scrollRef}>
          <div className="container max-w-5xl space-y-8">
            {deck.slides.map((slide, i) => (
              <motion.div
                key={slide.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
              >
                <div className="group relative">
                  {/* Slide number */}
                  <div className="absolute -left-12 top-4 hidden lg:flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                    {i + 1}
                  </div>

                  {/* Slide container - use iframe-like scaling */}
                  <div
                    className="relative rounded-xl overflow-hidden border border-border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openPresentation(i)}
                  >
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      <div
                        className="absolute top-0 left-0"
                        style={{
                          width: 1920,
                          height: 1080,
                          transform: "scale(var(--slide-scale))",
                          transformOrigin: "top left",
                        }}
                        ref={(el) => {
                          if (el) {
                            const parent = el.parentElement;
                            if (parent) {
                              const s = parent.clientWidth / 1920;
                              el.style.setProperty("--slide-scale", String(s));
                            }
                          }
                        }}
                      >
                        <SlideRenderer slide={slide} deck={deck} slideIndex={i} totalSlides={deck.slides.length} />
                      </div>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Slide caption */}
                  <div className="mt-3 flex items-center justify-between px-1">
                    <p className="text-sm font-medium text-foreground">{slide.title}</p>
                    <span className="text-xs text-muted-foreground capitalize">{slide.template}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </PublicPageLayout>

      {/* Fullscreen presentation */}
      {presenting && (
        <PresentationMode
          deck={deck}
          startSlide={startSlide}
          onClose={() => setPresenting(false)}
        />
      )}
    </>
  );
};

export default PitchDeck;
