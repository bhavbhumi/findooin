import { PublicPageLayout } from "@/components/PublicPageLayout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ComparisonPage } from "@/components/compare/ComparisonPage";
import { Users, MessageCircle, Heart, TrendingUp, Shield, Award, Briefcase, Target } from "lucide-react";

const comparisonData = {
  heroTitle: "FindOO vs Social Networks",
  heroSubtitle: "Why India's financial professionals need more than likes and followers",
  heroDescription: "Social networks like Facebook, Instagram, and Twitter were built for entertainment and personal connections. FindOO is purpose-built for India's ₹400 Lakh Crore financial ecosystem — where trust, compliance, and professional credibility matter more than viral content.",
  competitor: "Social Networks",
  competitorExamples: "Facebook, Instagram, Twitter/X",
  stats: [
    { label: "Financial professionals in India", value: "6L+", description: "Advisors, distributors, analysts & planners" },
    { label: "AUM managed by intermediaries", value: "₹400L Cr", description: "Assets under management across MFs, insurance & securities" },
    { label: "SEBI registered intermediaries", value: "35,000+", description: "RIAs, stock brokers, portfolio managers & more" },
    { label: "Active mutual fund distributors", value: "1.2L+", description: "AMFI-registered MFDs across India" },
  ],
  features: [
    {
      icon: Shield,
      feature: "Identity Verification",
      findoo: "SEBI/AMFI/IRDAI registry-linked verification with trust badges",
      competitor: "Blue tick based on popularity or payment, no professional verification",
      findooHas: true,
      competitorHas: false,
    },
    {
      icon: Briefcase,
      feature: "Professional Profiles",
      findoo: "Regulatory IDs, certifications (CFP, CFA, NISM), AUM, specializations",
      competitor: "Generic bio, photos, and personal interests",
      findooHas: true,
      competitorHas: false,
    },
    {
      icon: Target,
      feature: "Audience Relevance",
      findoo: "100% financial ecosystem — every connection is professionally relevant",
      competitor: "Mixed audience of friends, family, brands, and bots",
      findooHas: true,
      competitorHas: false,
    },
    {
      icon: MessageCircle,
      feature: "Content Quality",
      findoo: "Market insights, regulatory updates, product analysis, client queries",
      competitor: "Memes, personal updates, ads, and clickbait",
      findooHas: true,
      competitorHas: false,
    },
    {
      icon: TrendingUp,
      feature: "Business Growth Tools",
      findoo: "Showcase listings, lead capture, digital business cards, event management",
      competitor: "Paid ads and marketplace listings (not finance-specific)",
      findooHas: true,
      competitorHas: false,
    },
    {
      icon: Award,
      feature: "Gamification & Recognition",
      findoo: "XP system, professional badges, weekly challenges, leaderboard",
      competitor: "Likes and followers count — vanity metrics",
      findooHas: true,
      competitorHas: false,
    },
    {
      icon: Users,
      feature: "Networking Intent",
      findoo: "Connect with verified professionals for referrals, partnerships & deals",
      competitor: "Follow celebrities, influencers, and brands",
      findooHas: true,
      competitorHas: false,
    },
    {
      icon: Heart,
      feature: "Privacy Controls",
      findoo: "Granular tab privacy — control who sees Activity, Network & Vault",
      competitor: "Basic public/private toggle, data harvested for ads",
      findooHas: true,
      competitorHas: false,
    },
  ],
  verdict: {
    title: "Social networks broadcast. FindOO builds professional credibility.",
    description: "On social media, a financial advisor competes with cat videos for attention. On FindOO, every interaction strengthens your professional standing in India's regulated financial ecosystem. Your content reaches people who actually need your expertise — not an algorithm optimizing for engagement.",
  },
  cta: {
    title: "Stop competing with cat videos.",
    subtitle: "Join the network where your SEBI registration matters more than your follower count.",
  },
};

export default function FindooVsSocialNetwork() {
  usePageMeta({
    title: "FindOO vs Social Networks — Why Financial Professionals Need a Dedicated Network",
    description: "Compare FindOO with Facebook, Instagram & Twitter. Discover why India's financial professionals choose a purpose-built network over generic social media.",
  });

  return (
    <PublicPageLayout>
      <ComparisonPage data={comparisonData} />
    </PublicPageLayout>
  );
}
