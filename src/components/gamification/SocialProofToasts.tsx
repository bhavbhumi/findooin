/**
 * SocialProofToasts — Real-time toasts for level-ups, badge earns across the platform.
 * Subscribes to social_proof_events table via Supabase Realtime.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { getLevelConfig } from "@/lib/gamification";
import { Trophy, Star, Flame } from "lucide-react";

interface SocialProofEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  profile_name?: string;
}

export function SocialProofToasts() {
  const [events, setEvents] = useState<SocialProofEvent[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setCurrentUserId(session.user.id);
    });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("social-proof-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "social_proof_events" },
        async (payload) => {
          const event = payload.new as any;
          // Don't show own events as social proof
          if (event.user_id === currentUserId) return;

          // Fetch profile name
          const { data: profile } = await supabase
            .from("profiles")
            .select("display_name, full_name")
            .eq("id", event.user_id)
            .maybeSingle();

          const enriched: SocialProofEvent = {
            ...event,
            profile_name: profile?.display_name || profile?.full_name || "Someone",
          };

          setEvents((prev) => [...prev.slice(-4), enriched]);

          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setEvents((prev) => prev.filter((e) => e.id !== enriched.id));
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId]);

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-50 flex flex-col gap-2 max-w-xs">
      <AnimatePresence>
        {events.map((event) => (
          <SocialProofToast key={event.id} event={event} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function SocialProofToast({ event }: { event: SocialProofEvent }) {
  const { event_type, event_data, profile_name } = event;

  let icon = <Star className="h-4 w-4 text-[hsl(var(--gold))]" />;
  let message = "";

  if (event_type === "level_up") {
    const config = getLevelConfig(event_data.new_level);
    icon = <Trophy className="h-4 w-4" style={{ color: config.color }} />;
    message = `${profile_name} just reached ${config.icon} ${config.name}!`;
  } else if (event_type === "badge_earned") {
    icon = <Star className="h-4 w-4 text-[hsl(var(--gold))]" />;
    message = `${profile_name} earned the ${event_data.badge_name} badge!`;
  } else if (event_type === "streak_milestone") {
    icon = <Flame className="h-4 w-4 text-destructive" />;
    message = `${profile_name} is on a ${event_data.streak}-day streak! 🔥`;
  } else {
    message = `${profile_name} achieved a new milestone!`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -60, scale: 0.9 }}
      transition={{ type: "spring", damping: 20 }}
      className="flex items-center gap-2.5 rounded-xl border border-border bg-card/95 backdrop-blur-md px-3 py-2.5 shadow-lg"
    >
      <div className="shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center">
        {icon}
      </div>
      <p className="text-xs text-card-foreground leading-tight">{message}</p>
    </motion.div>
  );
}
