import { ComparisonData } from "@/components/compare/ComparisonPage";
import { Shield, Globe, FileText, Calendar, Layers, Award, Users, Database } from "lucide-react";

export const professionalNetworkData: ComparisonData = {
  heroTitle: "FindOO vs Professional Networks",
  heroSubtitle: "Generic professional networks serve every industry. FindOO is built for India's financial ecosystem.",
  heroDescription: "Global professional networks serve over a billion users across every industry and geography. FindOO is laser-focused on India's ₹400 Lakh Crore financial services ecosystem — where SEBI registrations, AMFI codes, and IRDAI licenses define professional identity.",
  competitor: "Professional Networks",
  competitorExamples: "General-purpose professional networking platforms",
  stats: [
    { label: "India's financial regulatory bodies", value: "5+", description: "SEBI, AMFI, IRDAI, RBI, PFRDA and more" },
    { label: "Unique compliance requirements", value: "200+", description: "Certifications, registrations & disclosure norms" },
    { label: "Users on global professional networks", value: "100Cr+", description: "Across IT, marketing, HR, finance, and every other sector" },
    { label: "Financial professionals on those platforms", value: "<2%", description: "Drowned in a sea of irrelevant content and connections" },
  ],
  features: [
    { icon: Shield, feature: "Regulatory Verification", findoo: "Direct registry integration — SEBI ARN, RIA, IRDAI license auto-verified", competitor: "Self-declared credentials, no regulatory verification", findooHas: true, competitorHas: false },
    { icon: Globe, feature: "Market Focus", findoo: "India-first: INR pricing, Indian regulatory framework, local market data", competitor: "Global platform — Indian financial context is an afterthought", findooHas: true, competitorHas: false },
    { icon: FileText, feature: "Content Relevance", findoo: "Polls, surveys & posts tailored for market analysis, product comparison, client queries", competitor: "Generic articles, job-hunting tips, and engagement bait", findooHas: true, competitorHas: false },
    { icon: Layers, feature: "Showcase & Listings", findoo: "List financial products, services & investment opportunities with enquiry capture", competitor: "Company pages and job postings — no product marketplace", findooHas: true, competitorHas: false },
    { icon: Calendar, feature: "Financial Events", findoo: "Industry meetups, webinars with QR check-in and speaker profiles", competitor: "Generic events — no industry-specific features", findooHas: true, competitorHas: true },
    { icon: Database, feature: "Vault (Document Storage)", findoo: "Secure document vault with sharing controls — store licenses, brochures, presentations", competitor: "No document storage — use third-party tools", findooHas: true, competitorHas: false },
    { icon: Award, feature: "Professional Gamification", findoo: "Finance-specific badges (Market Maven, Compliance Champion), XP & leaderboard", competitor: "Skill assessments and endorsements — generic across industries", findooHas: true, competitorHas: true },
    { icon: Users, feature: "Digital Business Card", findoo: "NFC-ready digital card with QR code, vCard download, and lead capture", competitor: "Profile link sharing — no dedicated business card feature", findooHas: true, competitorHas: false },
  ],
  verdict: { title: "They know your job title. FindOO knows your ARN number.", description: "On generic professional networks, a mutual fund distributor looks the same as a marketing executive. On FindOO, your AMFI registration, certifications, AUM, and specializations define your professional identity. Every feature is designed for how India's financial ecosystem actually works — from compliance to client acquisition." },
  cta: { title: "Your ARN number deserves its own network.", subtitle: "Join 15,000+ financial professionals who chose depth over breadth." },
};
