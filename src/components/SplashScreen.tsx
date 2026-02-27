import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import findooLogoFull from "@/assets/findoo-logo-full.png";
import findooLogoIcon from "@/assets/findoo-logo-icon.png";

interface SplashScreenProps {
  onComplete: () => void;
  /** Duration in ms before auto-dismiss (default 2800) */
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2800 }: SplashScreenProps) {
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("hold"), 600);
    const exitTimer = setTimeout(() => setPhase("exit"), duration - 500);
    const doneTimer = setTimeout(onComplete, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete, duration]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? null : null}
      <motion.div
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(228,60%,12%)] overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Background decorative elements */}
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.08 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[hsl(45,67%,53%)] blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[hsl(228,60%,40%)] blur-[100px]" />
        </motion.div>

        {/* Animated ring */}
        <motion.div
          className="absolute w-32 h-32 rounded-full border-2 border-[hsl(45,67%,53%,0.3)]"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: [0.5, 1.8, 2.5],
            opacity: [0, 0.4, 0],
          }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
        />

        {/* Logo icon */}
        <motion.img
          src={findooLogoIcon}
          alt="FindOO"
          className="w-20 h-20 mb-6 relative z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: 1,
            rotate: 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1,
          }}
        />

        {/* Full logo */}
        <motion.img
          src={findooLogoFull}
          alt="FindOO"
          className="h-10 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        />

        {/* Tagline */}
        <motion.p
          className="text-[hsl(45,67%,53%)] text-sm font-medium tracking-[0.25em] uppercase mt-3 relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          Financially Social
        </motion.p>

        {/* Loading bar */}
        <motion.div
          className="mt-10 w-40 h-0.5 bg-white/10 rounded-full overflow-hidden relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-[hsl(45,67%,53%)] to-[hsl(45,67%,70%)] rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: duration / 1000 - 1.2,
              delay: 1.2,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Fade-out overlay */}
        <motion.div
          className="absolute inset-0 bg-background z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "exit" ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
