import { type PitchSlide, type PitchDeckData } from "@/data/pitchDecks";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import findooLogoWhite from "@/assets/findoo-logo-white.png";

interface SlideRendererProps {
  slide: PitchSlide;
  deck: PitchDeckData;
  slideIndex: number;
  totalSlides: number;
}

const SlideRenderer = ({ slide, deck, slideIndex, totalSlides }: SlideRendererProps) => {
  const accentColor = `hsl(${deck.colorHsl})`;
  const accentBg = `hsla(${deck.colorHsl} / 0.15)`;
  const accentBorder = `hsla(${deck.colorHsl} / 0.3)`;

  const Footer = () => (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-16 py-6">
      <img src={findooLogoWhite} alt="FindOO" className="h-7 opacity-50" />
      <span className="text-white/30 text-sm font-medium tracking-wide">
        {slideIndex + 1} / {totalSlides}
      </span>
    </div>
  );

  /* ── COVER ── */
  if (slide.template === "cover") {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(230 25% 12%), hsl(230 30% 18%), ${accentColor})` }}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)` }} />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-5" style={{ background: `radial-gradient(circle, white, transparent 70%)` }} />
        <div className="absolute top-20 left-20">
          <img src={findooLogoWhite} alt="FindOO" className="h-12 opacity-80" />
        </div>
        <div className="flex flex-col justify-center h-full px-24 max-w-[1400px]">
          {slide.badge && (
            <div className="inline-flex self-start items-center gap-2 px-5 py-2 rounded-full mb-8 text-base font-medium" style={{ background: accentBg, color: accentColor, border: `1px solid ${accentBorder}` }}>
              <deck.icon className="w-5 h-5" />
              {slide.badge}
            </div>
          )}
          <h1 className="text-7xl font-bold text-white leading-tight mb-8 tracking-tight" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-2xl text-white/60 leading-relaxed max-w-[900px]">{slide.subtitle}</p>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  /* ── PROBLEM ── */
  if (slide.template === "problem") {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(230 25% 10%), hsl(230 25% 14%))" }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-5" style={{ background: `radial-gradient(circle, hsl(0 70% 50%), transparent 70%)` }} />
        <div className="flex flex-col h-full px-24 pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: "hsl(0 70% 60%)" }}>The Challenge</p>
          <h2 className="text-5xl font-bold text-white mb-3 tracking-tight">{slide.title}</h2>
          {slide.subtitle && <p className="text-xl text-white/50 mb-16 max-w-[800px]">{slide.subtitle}</p>}
          <div className="grid grid-cols-3 gap-8 flex-1 items-start">
            {slide.points?.map((point, i) => (
              <div key={i} className="rounded-2xl p-8 border border-white/5" style={{ background: "hsla(0, 0%, 100%, 0.03)" }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6" style={{ background: "hsla(0, 70%, 50%, 0.15)" }}>
                  <point.icon className="w-7 h-7" style={{ color: "hsl(0 70% 60%)" }} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{point.title}</h3>
                <p className="text-base text-white/50 leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── SOLUTION ── */
  if (slide.template === "solution") {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(230 25% 12%), hsl(230 30% 16%))` }}>
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full opacity-8" style={{ background: `radial-gradient(circle, ${accentColor}, transparent 70%)`, opacity: 0.08 }} />
        <div className="flex flex-col h-full px-24 pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: accentColor }}>The Solution</p>
          <h2 className="text-5xl font-bold text-white mb-3 tracking-tight">{slide.title}</h2>
          {slide.subtitle && <p className="text-xl text-white/50 mb-16 max-w-[800px]">{slide.subtitle}</p>}
          <div className="grid grid-cols-2 gap-6 flex-1 items-start">
            {slide.points?.map((point, i) => (
              <div key={i} className="rounded-2xl p-7 border flex gap-6 items-start" style={{ background: "hsla(0, 0%, 100%, 0.03)", borderColor: "hsla(0, 0%, 100%, 0.06)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: accentBg }}>
                  <point.icon className="w-6 h-6" style={{ color: accentColor }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{point.title}</h3>
                  <p className="text-base text-white/50 leading-relaxed">{point.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── FEATURES ── */
  if (slide.template === "features") {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(230 25% 11%), hsl(230 25% 15%))" }}>
        <div className="flex flex-col h-full px-24 pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: accentColor }}>Features</p>
          <h2 className="text-5xl font-bold text-white mb-3 tracking-tight">{slide.title}</h2>
          {slide.subtitle && <p className="text-xl text-white/50 mb-14 max-w-[800px]">{slide.subtitle}</p>}
          <div className="grid grid-cols-3 gap-5 flex-1 items-start">
            {slide.points?.map((point, i) => (
              <div key={i} className="rounded-xl p-6 border" style={{ background: "hsla(0, 0%, 100%, 0.03)", borderColor: "hsla(0, 0%, 100%, 0.06)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: accentBg }}>
                  <point.icon className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{point.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{point.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── STATS ── */
  if (slide.template === "stats") {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(230 25% 12%), ${accentColor})` }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="flex flex-col justify-center h-full px-24">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4 text-white/60">By The Numbers</p>
          <h2 className="text-5xl font-bold text-white mb-3 tracking-tight">{slide.title}</h2>
          {slide.subtitle && <p className="text-xl text-white/50 mb-16 max-w-[800px]">{slide.subtitle}</p>}
          <div className="grid grid-cols-4 gap-8">
            {slide.stats?.map((stat, i) => (
              <div key={i} className="text-center rounded-2xl p-8 border border-white/10" style={{ background: "hsla(0, 0%, 100%, 0.05)" }}>
                <p className="text-5xl font-bold text-white mb-3">{stat.value}</p>
                <p className="text-lg font-semibold text-white/80 mb-1">{stat.label}</p>
                {stat.sub && <p className="text-sm text-white/40">{stat.sub}</p>}
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── STEPS ── */
  if (slide.template === "steps") {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(230 25% 11%), hsl(230 25% 15%))" }}>
        <div className="flex flex-col h-full px-24 pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: accentColor }}>How It Works</p>
          <h2 className="text-5xl font-bold text-white mb-3 tracking-tight">{slide.title}</h2>
          {slide.subtitle && <p className="text-xl text-white/50 mb-16 max-w-[800px]">{slide.subtitle}</p>}
          <div className="grid grid-cols-4 gap-6 flex-1 items-start">
            {slide.steps?.map((step, i) => (
              <div key={i} className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-2xl font-bold text-white" style={{ background: `linear-gradient(135deg, ${accentColor}, hsla(${deck.colorHsl} / 0.6))` }}>
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-base text-white/45 leading-relaxed">{step.desc}</p>
                {i < (slide.steps?.length || 0) - 1 && (
                  <ArrowRight className="absolute top-5 -right-3 w-6 h-6 text-white/20" />
                )}
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── HIGHLIGHT ── */
  if (slide.template === "highlight") {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(230 25% 11%), hsl(230 25% 15%))" }}>
        <div className="flex flex-col h-full px-24 pt-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: accentColor }}>Deep Dive</p>
          <h2 className="text-5xl font-bold text-white mb-3 tracking-tight">{slide.title}</h2>
          {slide.subtitle && <p className="text-xl text-white/50 mb-14 max-w-[800px]">{slide.subtitle}</p>}

          {/* Comparison table */}
          {slide.comparison && (
            <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "hsla(0, 0%, 100%, 0.03)" }}>
              <div className="grid grid-cols-[1fr_200px_200px] text-center border-b border-white/10">
                <div className="p-5 text-left text-lg font-semibold text-white/60">Feature</div>
                <div className="p-5 text-lg font-semibold text-white/40">{slide.comparisonLabel || "Others"}</div>
                <div className="p-5 text-lg font-bold" style={{ color: accentColor, background: accentBg }}>FindOO</div>
              </div>
              {slide.comparison.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_200px_200px] text-center border-b border-white/5 last:border-0">
                  <div className="p-4 text-left text-base text-white/70">{row.feature}</div>
                  <div className="p-4 flex items-center justify-center">
                    {row.others ? <CheckCircle className="w-5 h-5 text-white/30" /> : <XCircle className="w-5 h-5 text-white/15" />}
                  </div>
                  <div className="p-4 flex items-center justify-center" style={{ background: accentBg }}>
                    {row.findoo ? <CheckCircle className="w-5 h-5" style={{ color: accentColor }} /> : <XCircle className="w-5 h-5 text-white/15" />}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Highlight points */}
          {slide.highlightPoints && (
            <div className="rounded-2xl border border-white/10 p-10" style={{ background: "hsla(0, 0%, 100%, 0.03)" }}>
              {slide.highlightTitle && <h3 className="text-2xl font-bold text-white mb-8">{slide.highlightTitle}</h3>}
              <div className="space-y-5">
                {slide.highlightPoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 shrink-0 mt-0.5" style={{ color: accentColor }} />
                    <p className="text-lg text-white/60 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  /* ── CTA ── */
  if (slide.template === "cta") {
    return (
      <div className="w-full h-full relative overflow-hidden" style={{ background: `linear-gradient(135deg, hsl(230 25% 12%), hsl(230 30% 18%), ${accentColor})` }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="flex flex-col items-center justify-center h-full px-24 text-center">
          <img src={findooLogoWhite} alt="FindOO" className="h-14 mb-10 opacity-80" />
          <h2 className="text-6xl font-bold text-white mb-6 tracking-tight max-w-[1200px]">{slide.title}</h2>
          {slide.subtitle && <p className="text-2xl text-white/50 mb-12 max-w-[800px] leading-relaxed">{slide.subtitle}</p>}
          {slide.ctaText && (
            <div className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-xl font-bold text-white" style={{ background: accentColor }}>
              {slide.ctaText}
              <ArrowRight className="w-6 h-6" />
            </div>
          )}
          {slide.ctaSub && <p className="text-base text-white/35 mt-6">{slide.ctaSub}</p>}
        </div>
        <Footer />
      </div>
    );
  }

  return null;
};

export default SlideRenderer;
