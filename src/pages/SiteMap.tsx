import { motion } from "framer-motion";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

const sitemapData = [
  {
    title: "Main",
    links: [
      { label: "Home", to: "/" },
      { label: "Sign In", to: "/auth" },
      { label: "Sign Up", to: "/auth?mode=signup" },
      { label: "Install App", to: "/install" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Company", to: "/about" },
      { label: "Career", to: "/about?tab=career" },
      { label: "Press & Media", to: "/about?tab=press" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "What is FindOO", to: "/explore" },
      { label: "Why does it exist", to: "/explore?tab=why" },
      { label: "How it works", to: "/explore?tab=how" },
      { label: "Who is it for", to: "/explore?tab=who" },
    ],
  },
  {
    title: "Content",
    links: [
      { label: "Blog", to: "/blog" },
      { label: "Articles", to: "/blog?tab=articles" },
      { label: "Awareness", to: "/blog?tab=awareness" },
      { label: "Analysis", to: "/blog?tab=analysis" },
      { label: "Reports", to: "/blog?tab=reports" },
      { label: "Bulletin", to: "/blog?tab=bulletin" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "Visit Us", to: "/contact?tab=visit" },
      { label: "Help Desk", to: "/helpdesk" },
      { label: "Quick Links", to: "/quick-links" },
      { label: "Community Guidelines", to: "/community-guidelines" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", to: "/legal" },
      { label: "Privacy Policy", to: "/legal?tab=privacy" },
      { label: "Policies", to: "/legal?tab=policies" },
      { label: "Disclosures", to: "/legal?tab=disclosures" },
    ],
  },
  {
    title: "Platform (Authenticated)",
    links: [
      { label: "Feed", to: "/feed" },
      { label: "Profile", to: "/profile" },
      { label: "Network", to: "/network" },
      { label: "Discover", to: "/discover" },
      { label: "Messages", to: "/messages" },
      { label: "Notifications", to: "/notifications" },
      { label: "Settings", to: "/settings" },
      { label: "Post Analytics", to: "/analytics" },
    ],
  },
];

const SiteMap = () => (
  <PublicPageLayout>
    <PageHero
      breadcrumb="Sitemap"
      title="Site"
      titleAccent="Map"
      subtitle="A complete overview of all pages and sections available on FindOO."
      variant="waves"
    />

    <section className="py-14">
      <div className="container max-w-4xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sitemapData.map((group, gi) => (
            <motion.div key={group.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={gi}>
              <h2 className="text-base font-bold font-heading text-foreground mb-3 pb-2 border-b border-border">{group.title}</h2>
              <ul className="space-y-1.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-1.5 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </PublicPageLayout>
);

export default SiteMap;
