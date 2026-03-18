/**
 * DirectoryPublicSidebar — Right sidebar widgets for the public /professionals page.
 * Motivates visitors to sign up, claim profiles, and engage with the platform.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UserPlus, Shield, TrendingUp, Star, ArrowRight,
  CheckCircle2, Sparkles, Users, Award, Zap, BarChart3
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.15 + i * 0.1, duration: 0.4 },
  }),
};

interface DirectoryPublicSidebarProps {
  totalProfessionals: number;
  claimedCount: number;
}

export function DirectoryPublicSidebar({ totalProfessionals, claimedCount }: DirectoryPublicSidebarProps) {
  return (
    <aside className="space-y-5">
      {/* Claim Your Profile CTA */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Claim Your Profile</h3>
                <p className="text-[10px] text-muted-foreground">Are you listed here?</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              If you're an AMFI or SEBI registered professional, claim your directory listing to get a verified badge and unlock your full profile.
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/auth?mode=signup">
                <Button size="sm" className="w-full gap-1.5 text-xs">
                  <UserPlus className="h-3.5 w-3.5" />
                  Sign Up & Claim
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                  Already a member? Log in
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Platform Stats */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-primary" />
              Directory Stats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2.5 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{totalProfessionals.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Professionals</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-primary">{claimedCount}</p>
                <p className="text-[10px] text-muted-foreground">Verified</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">5+</p>
                <p className="text-[10px] text-muted-foreground">Regulators</p>
              </div>
              <div className="text-center p-2.5 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">Free</p>
                <p className="text-[10px] text-muted-foreground">To Join</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Why Join FindOO */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Why Join FindOO?
            </h3>
            <ul className="space-y-2.5">
              {[
                { icon: CheckCircle2, text: "Get a verified professional badge" },
                { icon: Users, text: "Connect with investors & issuers" },
                { icon: TrendingUp, text: "Grow your professional network" },
                { icon: Award, text: "Earn XP & showcase achievements" },
                { icon: Zap, text: "Access exclusive market opinions" },
              ].map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trending Opinions Teaser */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                Trending Opinions
              </h3>
              <Link to="/opinions" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
                View all <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {[
                "Should SEBI relax MF expense ratios?",
                "Are index funds making advisors obsolete?",
                "Is India ready for crypto regulation?",
              ].map((q, i) => (
                <Link
                  key={i}
                  to="/opinions"
                  className="block p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                >
                  <p className="text-[11px] text-foreground leading-snug">{q}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[8px] h-4 px-1">
                      {["Policy", "Industry", "Regulation"][i]}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground">
                      {[128, 94, 67][i]} votes
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              Sign up to vote & share your professional opinion
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Explore More */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <CardContent className="p-5">
            <h3 className="text-xs font-semibold text-foreground mb-3">Explore More</h3>
            <div className="space-y-1.5">
              {[
                { label: "Compare Platforms", to: "/compare", desc: "See how FindOO stacks up" },
                { label: "Upcoming Events", to: "/events", desc: "BFSI meetups & webinars" },
                { label: "Career Board", to: "/jobs", desc: "Finance jobs & opportunities" },
              ].map(({ label, to, desc }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div>
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{label}</p>
                    <p className="text-[10px] text-muted-foreground">{desc}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </aside>
  );
}
