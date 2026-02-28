import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import findooLogoIcon from "@/assets/findoo-logo-icon.png";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const PARTICLE_COUNT = 12;

function GoldParticle({ index, total }: { index: number; total: number }) {
  const angle = (360 / total) * index;
  const radius = 120 + Math.random() * 40;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  const size = 2 + Math.random() * 3;
  const delay = 0.6 + index * 0.08;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `hsl(46, 65%, ${50 + Math.random() * 20}%)`,
        boxShadow: `0 0 ${size * 2}px hsl(46, 65%, 55%)`,
      }}
      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
      animate={{
        x,
        y,
        opacity: [0, 0.9, 0.6, 0],
        scale: [0, 1.2, 0.8, 0],
      }}
      transition={{
        duration: 2,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

function ConcentricRing({ radius, delay, color }: { radius: number; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{
        width: radius * 2,
        height: radius * 2,
        borderColor: color,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [0, 1, 1.3],
        opacity: [0, 0.5, 0],
      }}
      transition={{ duration: 2.2, delay, ease: "easeOut" }}
    />
  );
}

export function SplashScreen({ onComplete, duration = 3200 }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 800);
    const exitTimer = setTimeout(() => setPhase("exit"), duration - 600);
    const doneTimer = setTimeout(onComplete, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete, duration]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
        style={{ background: "hsl(228, 60%, 10%)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Ambient glow — top-left warm */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: "60vmax",
            height: "60vmax",
            top: "-15vmax",
            left: "-15vmax",
            borderRadius: "50%",
            background: "radial-gradient(circle, hsl(46, 65%, 52%, 0.08) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />

        {/* Ambient glow — bottom-right cool */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            width: "50vmax",
            height: "50vmax",
            bottom: "-10vmax",
            right: "-10vmax",
            borderRadius: "50%",
            background: "radial-gradient(circle, hsl(240, 100%, 27%, 0.12) 0%, transparent 70%)",
          }}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: "easeOut" }}
        />

        {/* Grid pattern overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(hsl(220, 40%, 20%, 0.15) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(220, 40%, 20%, 0.15) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2 }}
        />

        {/* Concentric rings */}
        <div className="absolute flex items-center justify-center">
          <ConcentricRing radius={60} delay={0.3} color="hsl(46, 65%, 52%, 0.25)" />
          <ConcentricRing radius={90} delay={0.5} color="hsl(46, 65%, 52%, 0.15)" />
          <ConcentricRing radius={130} delay={0.7} color="hsl(240, 100%, 40%, 0.12)" />
          <ConcentricRing radius={170} delay={0.9} color="hsl(240, 100%, 40%, 0.08)" />
        </div>

        {/* Gold particles burst */}
        <div className="absolute flex items-center justify-center">
          {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
            <GoldParticle key={i} index={i} total={PARTICLE_COUNT} />
          ))}
        </div>

        {/* Rotating accent arc */}
        <motion.div
          className="absolute"
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "hsl(46, 65%, 52%, 0.5)",
            borderRightColor: "hsl(46, 65%, 52%, 0.2)",
          }}
          initial={{ rotate: 0, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 360, opacity: [0, 0.8, 0.6], scale: 1 }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            opacity: { duration: 1, delay: 0.4 },
            scale: { duration: 0.8, delay: 0.3, ease: "easeOut" },
          }}
        />

        {/* Second rotating arc — opposite direction */}
        <motion.div
          className="absolute"
          style={{
            width: 160,
            height: 160,
            borderRadius: "50%",
            border: "1.5px solid transparent",
            borderBottomColor: "hsl(240, 100%, 50%, 0.3)",
            borderLeftColor: "hsl(240, 100%, 50%, 0.1)",
          }}
          initial={{ rotate: 0, opacity: 0, scale: 0.5 }}
          animate={{ rotate: -360, opacity: [0, 0.6, 0.4], scale: 1 }}
          transition={{
            rotate: { duration: 4, repeat: Infinity, ease: "linear" },
            opacity: { duration: 1, delay: 0.6 },
            scale: { duration: 0.8, delay: 0.5, ease: "easeOut" },
          }}
        />

        {/* Logo container with glow */}
        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo glow backdrop */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 100,
              height: 100,
              top: -10,
              background: "radial-gradient(circle, hsl(46, 65%, 52%, 0.2) 0%, transparent 70%)",
              filter: "blur(20px)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0.7], scale: [0.5, 1.2, 1] }}
            transition={{ duration: 1.2, delay: 0.2 }}
          />

          {/* Logo icon — spring entrance */}
          <motion.img
            src={findooLogoIcon}
            alt="FindOO"
            className="w-20 h-20 sm:w-24 sm:h-24 relative z-10 drop-shadow-[0_0_30px_hsl(46,65%,52%,0.3)]"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 14,
              delay: 0.15,
            }}
          />

          {/* Brand name with letter stagger */}
          <motion.div
            className="mt-5 flex items-baseline gap-0.5 relative z-10"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.05, delayChildren: 0.6 } },
            }}
          >
            {"FindOO".split("").map((letter, i) => (
              <motion.span
                key={i}
                className="text-3xl sm:text-4xl font-bold font-heading tracking-tight"
                style={{ color: "hsl(0, 0%, 97%)" }}
                variants={{
                  hidden: { opacity: 0, y: 20, rotateX: -90 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    rotateX: 0,
                    transition: { type: "spring", stiffness: 200, damping: 12 },
                  },
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.div>

          {/* Tagline with gold accent */}
          <motion.div
            className="mt-3 flex items-center gap-3 relative z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <motion.div
              className="h-px w-8 sm:w-12"
              style={{ background: "linear-gradient(90deg, transparent, hsl(46, 65%, 52%))" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            />
            <p
              className="text-xs sm:text-sm font-medium tracking-[0.3em] uppercase"
              style={{ color: "hsl(46, 65%, 55%)" }}
            >
              Financially Social
            </p>
            <motion.div
              className="h-px w-8 sm:w-12"
              style={{ background: "linear-gradient(90deg, hsl(46, 65%, 52%), transparent)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            />
          </motion.div>
        </motion.div>

        {/* Loading bar */}
        <motion.div
          className="mt-12 sm:mt-14 w-36 sm:w-44 h-[3px] rounded-full overflow-hidden relative z-10"
          style={{ background: "hsl(228, 40%, 18%)" }}
          initial={{ opacity: 0, scaleX: 0.5 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.5, duration: 0.4 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, hsl(46, 65%, 52%), hsl(46, 65%, 68%), hsl(46, 65%, 52%))",
              backgroundSize: "200% 100%",
            }}
            initial={{ width: "0%" }}
            animate={{
              width: "100%",
              backgroundPosition: ["0% 0%", "100% 0%"],
            }}
            transition={{
              width: {
                duration: (duration / 1000) - 1.6,
                delay: 1.6,
                ease: "easeInOut",
              },
              backgroundPosition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          />
        </motion.div>

        {/* Bottom subtle text */}
        <motion.p
          className="absolute bottom-6 sm:bottom-8 text-[10px] sm:text-xs tracking-widest uppercase z-10"
          style={{ color: "hsl(220, 20%, 45%)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
        >
          India's First Financial Network
        </motion.p>

        {/* Corner accent — top-left */}
        <motion.div
          className="absolute top-6 left-6 sm:top-10 sm:left-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="w-8 h-px" style={{ background: "hsl(46, 65%, 52%)" }} />
          <div className="w-px h-8 mt-[-1px]" style={{ background: "hsl(46, 65%, 52%)" }} />
        </motion.div>

        {/* Corner accent — bottom-right */}
        <motion.div
          className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 flex flex-col items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="w-8 h-px" style={{ background: "hsl(46, 65%, 52%)" }} />
          <div className="w-px h-8 self-end" style={{ background: "hsl(46, 65%, 52%)" }} />
        </motion.div>

        {/* Fade-out overlay — matches target theme */}
        <motion.div
          className="absolute inset-0 bg-background z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "exit" ? 1 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
