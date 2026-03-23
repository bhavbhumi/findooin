import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Link } from "react-router-dom";
import {
  Building2, Users, Newspaper, Briefcase, MessageCircle, Shield,
  FileText, Lock, BookOpen, HelpCircle, Phone, MapPin, ExternalLink,
  TrendingUp, Globe, UserCheck, Settings, Bell, Code2
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

const linkGroups = [
  {
    title: "Company",
    links: [
      { icon: Building2, label: "About findoo", to: "/about", desc: "Our story, mission, and values" },
      { icon: Briefcase, label: "Careers", to: "/about?tab=career", desc: "Join our growing team" },
      { icon: Newspaper, label: "Press & Media", to: "/about?tab=press", desc: "News and media coverage" },
      { icon: BookOpen, label: "Blog", to: "/blog", desc: "Articles, insights, and updates" },
    ],
  },
  {
    title: "Product",
    links: [
      { icon: Globe, label: "What is findoo", to: "/explore", desc: "Learn about our platform" },
      { icon: TrendingUp, label: "How it Works", to: "/explore?tab=how", desc: "Getting started guide" },
      { icon: UserCheck, label: "Who is it For", to: "/explore?tab=who", desc: "Issuers, intermediaries & investors" },
      { icon: Shield, label: "Verification", to: "/explore?tab=what", desc: "Trust badge & credential checks" },
    ],
  },
  {
    title: "Compare",
    links: [
      { icon: TrendingUp, label: "vs Social Networks", to: "/compare?tab=social", desc: "How findoo differs from social media" },
      { icon: Users, label: "vs Professional Networks", to: "/compare?tab=professional", desc: "Compare with LinkedIn and peers" },
      { icon: Globe, label: "vs Financial Media", to: "/compare?tab=media", desc: "Compare with financial media platforms" },
    ],
  },
  {
    title: "Directory",
    links: [
      { icon: Users, label: "Professional Directory", to: "/professionals", desc: "Browse AMFI-registered professionals" },
    ],
  },
  {
    title: "Support",
    links: [
      { icon: Phone, label: "Contact Us", to: "/contact", desc: "Get in touch with our team" },
      { icon: HelpCircle, label: "Help Desk", to: "/helpdesk", desc: "FAQs and help articles" },
      { icon: MessageCircle, label: "Community Guidelines", to: "/community-guidelines", desc: "Rules of engagement" },
      { icon: MapPin, label: "Visit Us", to: "/contact?tab=visit", desc: "Our office locations" },
    ],
  },
  {
    title: "Legal",
    links: [
      { icon: FileText, label: "Terms of Service", to: "/legal", desc: "Platform terms and conditions" },
      { icon: Lock, label: "Privacy Policy", to: "/legal?tab=privacy", desc: "How we protect your data" },
      { icon: Shield, label: "Policies", to: "/legal?tab=policies", desc: "Platform usage policies" },
      { icon: FileText, label: "Disclosures", to: "/legal?tab=disclosures", desc: "Regulatory disclosures" },
    ],
  },
  {
    title: "Account",
    links: [
      { icon: Users, label: "Sign Up", to: "/auth?mode=signup", desc: "Create your findoo account" },
      { icon: UserCheck, label: "Sign In", to: "/auth", desc: "Access your dashboard" },
      { icon: Settings, label: "Settings", to: "/settings", desc: "Manage your preferences" },
      { icon: Bell, label: "Notifications", to: "/notifications", desc: "Stay updated" },
    ],
  },
];

const QuickLinks = () => {
  usePageMeta({ title: "Quick Links", description: "Quick access to all findoo pages and resources." });
  return (
  <PublicPageLayout>
    <PageHero
      breadcrumb="Quick Links"
      title="Quick"
      titleAccent="Links"
      subtitle="Navigate to any section of findoo quickly. Everything you need, in one place."
      variant="squares"
    />

    <section className="py-14">
      <div className="container">
        <div className="space-y-12">
          {linkGroups.map((group, gi) => (
            <motion.div key={group.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={gi}>
              <h2 className="text-lg font-bold font-heading text-foreground mb-5 pb-3 border-b border-border">{group.title}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.links.map((link, li) => (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all group"
                  >
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <link.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">{link.label}</h3>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </PublicPageLayout>
  );
};

export default QuickLinks;
