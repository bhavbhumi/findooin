import { ComparisonData } from "@/components/compare/ComparisonPage";
import { DollarSign, Users, Layers, Shield, MessageCircle, Award, Globe, Smartphone } from "lucide-react";

export const newsTerminalsData: ComparisonData = {
  heroTitle: "findoo vs News & Data Terminals",
  heroSubtitle: "₹15 Lakh/year terminals vs a free financial network",
  heroDescription: "Premium data terminals are the gold standard for institutional traders and fund managers. But at ₹15-20 Lakh per year per seat, they're inaccessible to 99% of India's financial professionals. findoo democratizes professional networking for the entire ecosystem — free forever.",
  competitor: "News & Data Terminals",
  competitorExamples: "Premium institutional market data terminals",
  stats: [
    { label: "Typical terminal cost", value: "₹15L+/yr", description: "Per seat, per year — affordable only for large institutions" },
    { label: "Terminal seats in India", value: "~5,000", description: "In a market of 6 lakh+ financial professionals" },
    { label: "findoo cost", value: "₹0", description: "Free forever — networking, content, events, and more" },
    { label: "Professionals excluded by terminal pricing", value: "99%+", description: "MFDs, IFAs, small RIAs — the backbone of distribution" },
  ],
  features: [
    { icon: DollarSign, feature: "Cost", findoo: "Free forever — no subscription, no per-seat licensing", competitor: "₹15-20 Lakh per year per terminal seat", findooHas: true, competitorHas: false },
    { icon: Users, feature: "Professional Networking", findoo: "Connect, message, and collaborate with verified professionals", competitor: "Limited chat features restricted to terminal subscribers", findooHas: true, competitorHas: true },
    { icon: Shield, feature: "Identity & Verification", findoo: "Regulatory registry verification, trust badges, digital cards", competitor: "Employer-verified identity — limited to terminal users", findooHas: true, competitorHas: true },
    { icon: Layers, feature: "Product Showcase", findoo: "List and discover financial products, capture enquiries", competitor: "Data on listed securities — no product marketplace", findooHas: true, competitorHas: false },
    { icon: MessageCircle, feature: "Community Content", findoo: "Posts, polls, surveys, blogs — peer knowledge sharing", competitor: "News wire and research reports — editorial only", findooHas: true, competitorHas: false },
    { icon: Globe, feature: "Market Data & Analytics", findoo: "Community-driven insights and market discussions", competitor: "Real-time market data, analytics, and execution — institutional grade", findooHas: false, competitorHas: true },
    { icon: Smartphone, feature: "Accessibility", findoo: "Web + mobile, works on any device, PWA-ready", competitor: "Dedicated hardware terminal or expensive desktop software", findooHas: true, competitorHas: false },
    { icon: Award, feature: "Professional Development", findoo: "Gamification, badges, challenges, leaderboard — continuous growth", competitor: "Separate paid certification programs", findooHas: true, competitorHas: true },
  ],
  verdict: { title: "Terminals are for trading desks. findoo is for the ecosystem.", description: "Premium terminals serve the 1% of India's financial world — the large institutions with deep pockets. findoo serves the other 99% — the MFDs, IFAs, RIAs, insurance advisors, and financial planners who form the backbone of India's financial distribution. Different missions, complementary roles." },
  cta: { title: "Professional networking shouldn't cost ₹15 Lakh a year.", subtitle: "Join the free financial network built for every professional in India's ecosystem." },
};
