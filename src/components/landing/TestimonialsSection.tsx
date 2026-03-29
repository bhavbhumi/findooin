import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquarePlus,
  Quote,
  Rocket,
  Shield,
  Users,
  Star,
  Send,
  Award,
  Zap,
  Target,
  LogIn,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_OPTIONS = [
  {
    group: "Investor",
    items: [
      { value: "Retail Individual", label: "Retail Individual" },
      { value: "HNI / Ultra HNI", label: "HNI / Ultra HNI" },
      { value: "NRI Investor", label: "NRI Investor" },
      { value: "Institutional Investor", label: "Institutional Investor" },
    ],
  },
  {
    group: "Intermediary",
    items: [
      { value: "Broker", label: "Broker" },
      { value: "Registered Investment Adviser (RIA)", label: "RIA" },
      { value: "Mutual Fund Distributor (MFD)", label: "MFD" },
      { value: "Insurance Agent / Broker", label: "Insurance Agent / Broker" },
      { value: "Portfolio Manager (PMS)", label: "PMS" },
      { value: "Wealth Manager", label: "Wealth Manager" },
    ],
  },
  {
    group: "Issuer",
    items: [
      { value: "Listed Company", label: "Listed Company" },
      { value: "Asset Management Company (AMC)", label: "AMC" },
      { value: "Insurance Company", label: "Insurance Company" },
      { value: "NBFC", label: "NBFC" },
      { value: "Bank", label: "Bank" },
    ],
  },
  {
    group: "Enabler",
    items: [
      { value: "KYC Registration Agency (KRA)", label: "KRA" },
      { value: "Depository (CDSL/NSDL)", label: "Depository" },
      { value: "Credit Rating Agency", label: "Credit Rating Agency" },
      { value: "Registrar & Transfer Agent (RTA)", label: "RTA" },
      { value: "RegTech / FinTech", label: "RegTech / FinTech" },
      { value: "Compliance / Legal", label: "Compliance / Legal" },
    ],
  },
];
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sanitizeText } from "@/lib/sanitize";

/* ── Submit Review Card ── */
function SubmitReviewCard() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check auth
  const { data: session } = useQuery({
    queryKey: ["session-for-review"],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 60_000,
  });

  // Check if user already submitted
  const { data: existingReview } = useQuery({
    queryKey: ["my-platform-review", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      const { data } = await supabase
        .from("platform_reviews")
        .select("id, status, rating, review_text")
        .eq("user_id", session.user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("Not authenticated");
      const sanitizedName = sanitizeText(name).slice(0, 100);
      const sanitizedRole = sanitizeText(role).slice(0, 100);
      const sanitizedReview = sanitizeText(review).slice(0, 500);

      const { error } = await supabase.from("platform_reviews").insert({
        user_id: session.user.id,
        reviewer_name: sanitizedName,
        reviewer_role: sanitizedRole,
        rating,
        review_text: sanitizedReview,
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thank you! Your review has been submitted for moderation.");
      setName("");
      setRole("");
      setReview("");
      setRating(0);
      queryClient.invalidateQueries({ queryKey: ["my-platform-review"] });
    },
    onError: (err: any) => {
      if (err?.code === "23505") {
        toast.error("You have already submitted a review.");
      } else {
        toast.error("Failed to submit review. Please try again.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      navigate("/auth");
      return;
    }
    if (rating === 0 || !review.trim()) {
      toast.error("Please add a rating and your review.");
      return;
    }
    submitMutation.mutate();
  };

  // Already submitted state
  if (existingReview) {
    return (
      <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/[0.03] to-accent/[0.02]">
        <CardContent className="p-6 flex flex-col h-full items-center justify-center text-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Star className="h-5 w-5 fill-gold text-gold" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Review Submitted!</h3>
          <p className="text-xs text-muted-foreground">
            {existingReview.status === "approved"
              ? "Your review is live. Thank you for sharing!"
              : "Your review is under moderation. We'll notify you once it's published."}
          </p>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-3.5 w-3.5 ${s <= existingReview.rating ? "fill-gold text-gold" : "text-muted-foreground/30"}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/[0.03] to-accent/[0.02] hover:border-primary/30 transition-all duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquarePlus className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Submit Your Review</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Be among the first to share your experience on findoo.
        </p>

        {!session && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
            <LogIn className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Sign in to submit your review</p>
            <Link to="/auth">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <LogIn className="h-3 w-3" />
                Sign In
              </Button>
            </Link>
          </div>
        )}

        {session && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 flex-1">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-8 text-xs"
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. MFD, RIA"
                  className="h-8 text-xs"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Star rating */}
            <div>
              <Label className="text-xs text-muted-foreground">Rating</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onMouseEnter={() => setHoveredStar(s)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(s)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-4 w-4 transition-colors ${
                        s <= (hoveredStar || rating)
                          ? "fill-gold text-gold"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Your Review</Label>
              <Textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share how findoo is helping your professional journey..."
                className="text-xs min-h-[60px] resize-none"
                maxLength={500}
                required
              />
            </div>

            <Button
              type="submit"
              size="sm"
              className="w-full gap-1.5 text-xs"
              disabled={submitMutation.isPending}
            >
              <Send className="h-3 w-3" />
              {submitMutation.isPending ? "Submitting…" : "Submit Review"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

/* ── Founder Quote Card ── */
function FounderQuoteCard() {
  return (
    <Card className="h-full border-border bg-card hover:shadow-lg transition-all duration-300 overflow-hidden relative group">
      {/* Decorative gradient header */}
      <div className="h-20 relative overflow-hidden bg-gradient-to-br from-primary/80 via-primary/60 to-accent/40">
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 300 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            {Array.from({ length: 15 }).map((_, i) => (
              <circle
                key={i}
                cx={20 + i * 20}
                cy={40 + Math.sin(i) * 20}
                r={2 + (i % 3)}
                fill="white"
                opacity={0.3 + (i % 5) * 0.1}
              />
            ))}
          </svg>
        </div>
        <div className="absolute bottom-2 left-4">
          <Quote className="h-8 w-8 text-white/30" />
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        <blockquote className="text-sm text-muted-foreground leading-relaxed italic flex-1 mb-4">
          "We built findoo because India's financial ecosystem deserved a network where trust isn't
          assumed — it's verified. Every connection, every credential, every conversation is
          anchored in accountability. This is just the beginning."
        </blockquote>

        <div className="flex items-center gap-3 pt-3 border-t border-border/60">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            F
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Founding Team</p>
            <p className="text-xs text-muted-foreground">findoo · Building Trust Infrastructure</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Early Adopter Badges Card ── */
function EarlyAdopterCard() {
  const milestones = [
    {
      icon: Rocket,
      label: "Beta Pioneer",
      description: "Join before public launch",
      color: "text-primary bg-primary/10",
    },
    {
      icon: Shield,
      label: "Verified Early",
      description: "Get verified as a founding member",
      color: "text-intermediary bg-intermediary/10",
    },
    {
      icon: Award,
      label: "Founding Reviewer",
      description: "First 100 reviews get a badge",
      color: "text-gold bg-gold/10",
    },
    {
      icon: Zap,
      label: "Trust Builder",
      description: "Shape the trust ecosystem",
      color: "text-issuer bg-issuer/10",
    },
  ];

  return (
    <Card className="h-full border-border bg-card hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Target className="h-4 w-4 text-accent-foreground" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Early Adopter Badges</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Exclusive recognition for founding members of the network.
        </p>

        <div className="grid grid-cols-1 gap-2.5 flex-1">
          {milestones.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40 hover:border-border/60 transition-colors"
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground">{m.label}</p>
                <p className="text-[10px] text-muted-foreground">{m.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Link to="/auth">
          <Button variant="outline" size="sm" className="w-full mt-4 gap-1.5 text-xs">
            <Users className="h-3 w-3" />
            Claim Your Badge
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

/* ── Main Section ── */
export default function TestimonialsSection() {
  return (
    <>
      {/* Section header */}
      <motion.div
        className="text-center mb-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: { opacity: 0, y: 24 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-1">
          Gaining Trust
        </h2>
        <p className="text-muted-foreground text-base">
          Be a founding voice in India's trust-verified financial network
        </p>
      </motion.div>

      {/* 3-column grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <SubmitReviewCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <FounderQuoteCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <EarlyAdopterCard />
        </motion.div>
      </div>
    </>
  );
}
