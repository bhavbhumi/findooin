import { ComparisonData } from "@/components/compare/ComparisonPage";
import { Newspaper, Users, MessageCircle, Shield, Layers, Award, TrendingUp, Eye } from "lucide-react";

export const financialMediaData: ComparisonData = {
  heroTitle: "FindOO vs Financial Media Portals",
  heroSubtitle: "Media portals inform. FindOO connects and empowers.",
  heroDescription: "Financial media portals deliver news and data to millions. But they're built for passive consumption — you read, you leave. FindOO transforms financial professionals from content consumers into active participants in India's financial ecosystem.",
  competitor: "Financial Media Portals",
  competitorExamples: "Online financial news and market data portals",
  stats: [
    { label: "Monthly visitors on top portals", value: "15Cr+", description: "Combined monthly traffic across leading financial media sites" },
    { label: "Professionals who can create content", value: "0%", description: "Media portals are one-way — editorial teams publish, you consume" },
    { label: "Average session duration", value: "3 min", description: "Quick scan of headlines, then exit — no community engagement" },
    { label: "Networking opportunities", value: "Zero", description: "No profiles, connections, or professional identity" },
  ],
  features: [
    { icon: Users, feature: "Professional Identity", findoo: "Verified profiles with credentials, endorsements, and trust scores", competitor: "Anonymous commenting — no professional identity layer", findooHas: true, competitorHas: false },
    { icon: MessageCircle, feature: "Two-Way Content", findoo: "Anyone can post insights, polls, surveys — peer-to-peer knowledge sharing", competitor: "Editorial-only content — readers can only comment", findooHas: true, competitorHas: false },
    { icon: Shield, feature: "Trust & Verification", findoo: "Registry-verified professionals — you know who's giving advice", competitor: "Anonymous commenters and paid promotional content", findooHas: true, competitorHas: false },
    { icon: Layers, feature: "Business Listings", findoo: "Showcase financial products, services — capture enquiries directly", competitor: "Banner ads and sponsored content — no marketplace", findooHas: true, competitorHas: false },
    { icon: Newspaper, feature: "Market News & Analysis", findoo: "Community-driven insights + curated blog with polls and surveys", competitor: "Professional editorial content with market data and research", findooHas: true, competitorHas: true },
    { icon: TrendingUp, feature: "Career & Job Board", findoo: "Financial sector jobs with skill matching and application tracking", competitor: "Job listings in a sidebar — not integrated into experience", findooHas: true, competitorHas: false },
    { icon: Award, feature: "Professional Growth", findoo: "XP, badges, weekly challenges — gamified learning and engagement", competitor: "No growth tracking or professional development features", findooHas: true, competitorHas: false },
    { icon: Eye, feature: "Privacy Controls", findoo: "Choose who sees your activity, network, and documents", competitor: "Tracking cookies, data harvesting for ad targeting", findooHas: true, competitorHas: false },
  ],
  verdict: { title: "Media portals give you headlines. FindOO gives you a professional platform.", description: "On media portals, you're a pageview. On FindOO, you're a verified professional with a reputation, connections, and business opportunities. The shift from passive consumption to active participation is what separates a media portal from a financial network." },
  cta: { title: "Stop being a pageview. Start being a professional.", subtitle: "Build your financial identity where your expertise gets recognized, not just your clicks." },
};
