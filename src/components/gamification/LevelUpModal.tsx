import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLevelConfig } from "@/lib/gamification";
import { useUserXP } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";

export function LevelUpModal() {
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [prevLevel, setPrevLevel] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  const { data: xp } = useUserXP(userId || undefined);

  useEffect(() => {
    if (!xp) return;
    if (prevLevel !== null && xp.level > prevLevel) {
      setLevelUp(xp.level);
    }
    setPrevLevel(xp.level);
  }, [xp?.level]);

  const dismiss = useCallback(() => setLevelUp(null), []);

  if (!levelUp) return null;

  const config = getLevelConfig(levelUp);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm"
        onClick={dismiss}
      >
        <motion.div
          initial={{ scale: 0.5, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative bg-card border border-border rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-6xl mb-3"
          >
            {config.icon}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold font-heading text-card-foreground"
          >
            Level Up!
          </motion.h2>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-muted-foreground mt-1">
              You've reached <span className="font-bold" style={{ color: config.color }}>Level {levelUp}</span>
            </p>
            <p className="text-2xl font-bold font-heading mt-2" style={{ color: config.color }}>
              {config.name}
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            onClick={dismiss}
            className="mt-6 px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Awesome! 🎉
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
