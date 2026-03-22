import { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  TrendingUp, Users, Heart, MessageSquare, Eye, Calendar, Award,
  Zap, Trophy, Star, Share2, Download, ChevronRight, ChevronLeft,
  Sparkles, Flame, Target, BadgeCheck, Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppLayout } from "@/components/AppLayout";
import { PageHero } from "@/components/PageHero";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import { getLevelConfig } from "@/lib/gamification";
import { ROLE_CONFIG } from "@/lib/role-config";

interface WrappedData {
  profile: { name: string; avatar_url: string | null; verified: boolean; joined: string };
  roles: string[];
  stats: {
    posts_count: number; connections_count: number; likes_received: number;
    comments_received: number; profile_views: number; events_attended: number;
    job_applications: number; listings_count: number; listing_views: number;
    listing_enquiries: number; endorsements_count: number;
  };
  gamification: {
    total_xp: number; level: number; current_streak: number;
    longest_streak: number; xp_percentile: number;
  };
  highlights: {
    top_hashtags: { tag: string; count: number }[];
    top_skill: string | null;
    post_types: Record<string, number>;
  };
  generated_at: string;
}

const SLIDES = [
  "intro",
  "network",
  "content",
  "engagement",
  "gamification",
  "highlights",
  "summary",
] as const;

type Slide = typeof SLIDES[number];

const slideVariants = {
  enter: { opacity: 0, scale: 0.95, y: 20 },
  center: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
};

function StatBlock({ icon: Icon, value, label, accent = false }: {
  icon: typeof TrendingUp; value: string | number; label: string; accent?: boolean;
}) {
  return (
    <motion.div
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border ${accent ? "border-primary/30 bg-primary/5" : "border-border bg-card/60"} backdrop-blur-sm`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <Icon className={`h-5 w-5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
      <span className={`text-xl font-bold font-heading ${accent ? "text-primary" : "text-card-foreground"}`}>{value}</span>
      <span className="text-[10px] text-muted-foreground text-center">{label}</span>
    </motion.div>
  );
}

function SlideContent({ slide, data }: { slide: Slide; data: WrappedData }) {
  const levelConf = getLevelConfig(data.gamification.level);
  const primaryRole = data.roles[0];
  const roleConf = primaryRole ? ROLE_CONFIG[primaryRole] : null;

  switch (slide) {
    case "intro":
      return (
        <div className="flex flex-col items-center text-center gap-6 py-8">
          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <div className="h-24 w-24 rounded-full border-4 border-primary/30 overflow-hidden bg-muted flex items-center justify-center">
              {data.profile.avatar_url ? (
                <img src={data.profile.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-muted-foreground">
                  {data.profile.name[0]?.toUpperCase()}
                </span>
              )}
            </div>
            {data.profile.verified && (
              <BadgeCheck className="absolute -bottom-1 -right-1 h-7 w-7 text-accent bg-card rounded-full p-0.5" />
            )}
          </motion.div>
          <div>
            <motion.h2
              className="text-2xl font-bold font-heading text-card-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {data.profile.name}'s
            </motion.h2>
            <motion.p
              className="text-4xl font-black font-heading bg-gradient-to-r from-primary via-accent to-gold bg-clip-text text-transparent mt-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Financial Wrapped
            </motion.p>
          </div>
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {data.roles.map((role) => {
              const rc = ROLE_CONFIG[role];
              if (!rc) return null;
              const RIcon = rc.icon;
              return (
                <Badge key={role} variant="outline" className={`gap-1 ${rc.bgColor}`}>
                  <RIcon className="h-3 w-3" />
                  <span className="capitalize">{role}</span>
                </Badge>
              );
            })}
          </motion.div>
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Here's your journey on findoo ✨
          </motion.p>
        </div>
      );

    case "network":
      return (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-bold font-heading text-card-foreground">Your Network</h3>
            <p className="text-sm text-muted-foreground mt-1">Building trust, one connection at a time</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBlock icon={Users} value={data.stats.connections_count} label="Connections" accent />
            <StatBlock icon={Eye} value={data.stats.profile_views} label="Profile Views" />
            <StatBlock icon={Award} value={data.stats.endorsements_count} label="Endorsements" />
            <StatBlock icon={Calendar} value={data.stats.events_attended} label="Events Attended" />
          </div>
          {data.stats.connections_count > 10 && (
            <motion.p
              className="text-center text-sm font-medium text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              🤝 You're a super-connector!
            </motion.p>
          )}
        </div>
      );

    case "content":
      return (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
            <h3 className="text-xl font-bold font-heading text-card-foreground">Your Content</h3>
            <p className="text-sm text-muted-foreground mt-1">Sharing knowledge with the community</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBlock icon={TrendingUp} value={data.stats.posts_count} label="Posts Created" accent />
            <StatBlock icon={Target} value={data.stats.listings_count} label="Listings" />
            <StatBlock icon={Eye} value={data.stats.listing_views} label="Listing Views" />
            <StatBlock icon={MessageSquare} value={data.stats.listing_enquiries} label="Enquiries" />
          </div>
          {Object.keys(data.highlights.post_types).length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(data.highlights.post_types).map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-[10px]">
                  {type.replace("_", " ")}: {count}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );

    case "engagement":
      return (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <Heart className="h-8 w-8 text-destructive mx-auto mb-2" />
            <h3 className="text-xl font-bold font-heading text-card-foreground">Engagement</h3>
            <p className="text-sm text-muted-foreground mt-1">How the community responded to you</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatBlock icon={Heart} value={data.stats.likes_received} label="Likes Received" accent />
            <StatBlock icon={MessageSquare} value={data.stats.comments_received} label="Comments" />
            <StatBlock icon={Eye} value={data.stats.profile_views} label="Profile Views" />
            <StatBlock icon={Star} value={data.stats.job_applications} label="Job Applications" />
          </div>
        </div>
      );

    case "gamification":
      return (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <Trophy className="h-8 w-8 text-gold mx-auto mb-2" />
            <h3 className="text-xl font-bold font-heading text-card-foreground">Your Rank</h3>
          </div>
          <motion.div
            className="text-center rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            <span className="text-4xl">{levelConf.icon}</span>
            <p className="text-2xl font-bold font-heading text-card-foreground mt-2">{levelConf.name}</p>
            <p className="text-sm text-muted-foreground">Level {data.gamification.level}</p>
            <p className="text-3xl font-black text-primary mt-3">{data.gamification.total_xp.toLocaleString()} XP</p>
            <p className="text-sm font-medium text-accent mt-1">
              Top {data.gamification.xp_percentile}% on findoo
            </p>
          </motion.div>
          <div className="grid grid-cols-2 gap-3">
            <StatBlock icon={Flame} value={`${data.gamification.current_streak}d`} label="Current Streak" accent={data.gamification.current_streak >= 7} />
            <StatBlock icon={Zap} value={`${data.gamification.longest_streak}d`} label="Longest Streak" />
          </div>
        </div>
      );

    case "highlights":
      return (
        <div className="space-y-6 py-4">
          <div className="text-center">
            <Hash className="h-8 w-8 text-status-highlight mx-auto mb-2" />
            <h3 className="text-xl font-bold font-heading text-card-foreground">Highlights</h3>
          </div>
          {data.highlights.top_skill && (
            <motion.div
              className="text-center rounded-xl border border-accent/20 bg-accent/5 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xs text-muted-foreground">Top Endorsed Skill</p>
              <p className="text-lg font-bold text-accent mt-1">{data.highlights.top_skill}</p>
            </motion.div>
          )}
          {data.highlights.top_hashtags.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Your Top Hashtags</p>
              <div className="flex flex-wrap justify-center gap-2">
                {data.highlights.top_hashtags.map(({ tag, count }, i) => (
                  <motion.div
                    key={tag}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <Badge variant="outline" className="gap-1 text-sm">
                      {tag} <span className="text-muted-foreground">×{count}</span>
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      );

    case "summary":
      return (
        <div className="flex flex-col items-center text-center gap-6 py-8">
          <motion.div
            className="text-5xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            🏆
          </motion.div>
          <div>
            <h3 className="text-2xl font-bold font-heading text-card-foreground">
              That's a wrap, {data.profile.name.split(" ")[0]}!
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              You've been an active part of India's financial network. Keep building trust, sharing insights, and growing your circle.
            </p>
          </div>
          <motion.div
            className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm p-5 max-w-xs w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-card-foreground">{data.stats.posts_count}</p>
                <p className="text-[10px] text-muted-foreground">Posts</p>
              </div>
              <div>
                <p className="text-lg font-bold text-card-foreground">{data.stats.connections_count}</p>
                <p className="text-[10px] text-muted-foreground">Connections</p>
              </div>
              <div>
                <p className="text-lg font-bold text-primary">{data.gamification.total_xp.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </div>
            </div>
          </motion.div>
          <p className="text-xs text-muted-foreground italic">
            findoo — Financially Social
          </p>
        </div>
      );
  }
}

export default function FinancialWrapped() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery<WrappedData>({
    queryKey: ["financial-wrapped"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const res = await supabase.functions.invoke("financial-wrapped", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.error) throw res.error;
      return res.data as WrappedData;
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  const next = useCallback(() => setCurrentSlide((s) => Math.min(s + 1, SLIDES.length - 1)), []);
  const prev = useCallback(() => setCurrentSlide((s) => Math.max(s - 1, 0)), []);

  const handleShare = async () => {
    const url = `${window.location.origin}/wrapped`;
    const text = data
      ? `I've earned ${data.gamification.total_xp.toLocaleString()} XP and made ${data.stats.connections_count} connections on findoo! Check out your Financial Wrapped 🏆`
      : "Check out your Financial Wrapped on findoo!";
    try {
      if (navigator.share) {
        await navigator.share({ title: "My Financial Wrapped — findoo", text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast.success("Wrapped link copied to clipboard!");
      }
    } catch {
      toast.info("Could not share");
    }
  };

  return (
    <AppLayout>
      <PageHero
        title="Financial Wrapped"
        subtitle="Your personalized journey on findoo"
        icon={Sparkles}
      />

      <div className="max-w-md mx-auto px-4 pb-12">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <FindooLoader text="Generating your Wrapped..." />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive text-sm">Failed to generate your Wrapped. Please try again.</p>
          </div>
        )}

        {data && (
          <>
            {/* Card */}
            <div
              ref={cardRef}
              className="relative rounded-2xl border border-border bg-card overflow-hidden shadow-xl min-h-[420px] flex flex-col"
            >
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-gold" />

              {/* Slide content */}
              <div className="flex-1 px-6 relative z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={SLIDES[currentSlide]}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <SlideContent slide={SLIDES[currentSlide]} data={data} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress dots + nav */}
              <div className="px-6 py-4 flex items-center justify-between relative z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={prev}
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1.5">
                  {SLIDES.map((_, i) => (
                    <button
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentSlide
                          ? "w-6 bg-primary"
                          : i < currentSlide
                            ? "w-1.5 bg-primary/40"
                            : "w-1.5 bg-border"
                      }`}
                      onClick={() => setCurrentSlide(i)}
                    />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={next}
                  disabled={currentSlide === SLIDES.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Share button */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <Button className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" /> Share Your Wrapped
              </Button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
