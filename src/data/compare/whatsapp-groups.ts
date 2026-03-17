import { ComparisonData } from "@/components/compare/ComparisonPage";
import { Shield, Search, FileText, Users, MessageCircle, Award, Eye, Layers } from "lucide-react";

export const whatsappGroupsData: ComparisonData = {
  heroTitle: "FindOO vs WhatsApp & Telegram Groups",
  heroSubtitle: "From unverified tips to verified professionals",
  heroDescription: "WhatsApp and Telegram groups have become the informal backbone of India's financial advisory world — MFD groups, insurance advisor circles, and stock tip channels. But they're unregulated, unverifiable, and unsearchable. FindOO brings structure, trust, and professionalism to the conversations that matter.",
  competitor: "WhatsApp & Telegram Groups",
  competitorExamples: "MFD WhatsApp groups, Stock tip channels, Insurance advisor circles",
  stats: [
    { label: "Financial WhatsApp groups in India", value: "50K+", description: "Estimated MFD, IFA, and advisor groups — untracked and unregulated" },
    { label: "Average messages per day in active groups", value: "200+", description: "Mostly forwards, good-morning images, and unverified tips" },
    { label: "Searchable knowledge retained", value: "0%", description: "Messages disappear in the scroll — no archive, no discovery" },
    { label: "Identity verification", value: "None", description: "Anyone can join, anyone can claim expertise" },
  ],
  features: [
    { icon: Shield, feature: "Identity Verification", findoo: "SEBI/AMFI/IRDAI registry-linked profiles with trust badges", competitor: "Phone number only — anyone can claim to be an expert", findooHas: true, competitorHas: false },
    { icon: Search, feature: "Content Discovery", findoo: "Searchable posts, hashtags, trending topics — knowledge is preserved", competitor: "Messages scroll away forever — no search, no archive", findooHas: true, competitorHas: false },
    { icon: FileText, feature: "Content Quality", findoo: "Structured posts, polls, surveys — moderated and reportable", competitor: "Forwards, PDFs, voice notes — mixed with spam and good-morning images", findooHas: true, competitorHas: false },
    { icon: Users, feature: "Professional Profiles", findoo: "Full professional identity — credentials, experience, endorsements", competitor: "Just a phone number and display name", findooHas: true, competitorHas: false },
    { icon: MessageCircle, feature: "Direct Messaging", findoo: "In-platform messaging with professional context", competitor: "Excellent messaging — but mixed with personal chats", findooHas: true, competitorHas: true },
    { icon: Layers, feature: "Business Features", findoo: "Showcase, events, jobs, vault, digital card — complete professional toolkit", competitor: "Share PDFs and links — no business infrastructure", findooHas: true, competitorHas: false },
    { icon: Eye, feature: "Privacy & Compliance", findoo: "Granular privacy controls, audit trails, content moderation", competitor: "Phone number exposed to all group members, no content moderation", findooHas: true, competitorHas: false },
    { icon: Award, feature: "Professional Recognition", findoo: "XP, badges, leaderboard — your contributions are tracked and rewarded", competitor: "No recognition system — top contributors are invisible", findooHas: true, competitorHas: false },
  ],
  verdict: { title: "WhatsApp groups are conversations. FindOO is a professional ecosystem.", description: "The knowledge shared in financial WhatsApp groups is valuable — but it's trapped in an ephemeral, unstructured, unverifiable format. FindOO preserves that knowledge, verifies the people sharing it, and adds the professional infrastructure that messaging apps were never designed to provide. Keep your WhatsApp groups — and elevate your professional presence on FindOO." },
  cta: { title: "Your expertise deserves more than a WhatsApp forward.", subtitle: "Build a verified professional identity where your knowledge is preserved, discovered, and rewarded." },
};
