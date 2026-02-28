import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type PitchDeckData } from "@/data/pitchDecks";
import SlideRenderer from "./SlideRenderer";
import { ChevronLeft, ChevronRight, X, Maximize, Minimize } from "lucide-react";

interface PresentationModeProps {
  deck: PitchDeckData;
  startSlide?: number;
  onClose: () => void;
}

const PresentationMode = ({ deck, startSlide = 0, onClose }: PresentationModeProps) => {
  const [current, setCurrent] = useState(startSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();
  const total = deck.slides.length;

  const calcScale = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    setScale(Math.min(clientWidth / 1920, clientHeight / 1080));
  }, []);

  useEffect(() => {
    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, [calcScale]);

  const next = useCallback(() => setCurrent((c) => Math.min(c + 1, total - 1)), [total]);
  const prev = useCallback(() => setCurrent((c) => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      if (e.key === "Escape") onClose();
      if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev, onClose]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-none"
      onMouseMove={handleMouseMove}
      style={{ cursor: showControls ? "default" : "none" }}
    >
      {/* Scaled slide */}
      <div
        className="absolute origin-center"
        style={{
          width: 1920,
          height: 1080,
          left: "50%",
          top: "50%",
          marginLeft: -960,
          marginTop: -540,
          transform: `scale(${scale})`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <SlideRenderer
              slide={deck.slides[current]}
              deck={deck}
              slideIndex={current}
              totalSlides={total}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none"
          >
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 pointer-events-auto">
              <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-sm font-medium">{deck.persona} Pitch</span>
              </div>
              <button onClick={toggleFullscreen} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>

            {/* Side navigation */}
            {current > 0 && (
              <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {current < total - 1 && (
              <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors pointer-events-auto">
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Bottom progress */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-auto">
              {deck.slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all ${i === current ? "w-8 bg-white" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click areas for navigation */}
      <div className="absolute inset-0 flex z-[5]">
        <div className="w-1/3 h-full cursor-pointer" onClick={prev} />
        <div className="w-1/3 h-full" />
        <div className="w-1/3 h-full cursor-pointer" onClick={next} />
      </div>
    </div>
  );
};

export default PresentationMode;
