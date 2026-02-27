import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, ShieldCheck, UserCog, CreditCard, FileText, Settings, ChevronRight, Mail, Phone, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

const categories = [
  { icon: UserCog, title: "Account & Profile", desc: "Registration, profile setup, and account settings", articles: 12, to: "#" },
  { icon: ShieldCheck, title: "Verification", desc: "Credential verification process and trust badges", articles: 8, to: "#" },
  { icon: MessageCircle, title: "Posts & Content", desc: "Creating posts, sharing insights, and moderation", articles: 15, to: "#" },
  { icon: CreditCard, title: "Billing & Plans", desc: "Subscription plans, invoices, and payment methods", articles: 6, to: "#" },
  { icon: Settings, title: "Privacy & Security", desc: "Data protection, two-factor auth, and privacy controls", articles: 10, to: "#" },
  { icon: FileText, title: "Community & Guidelines", desc: "Rules of engagement and community standards", articles: 9, to: "#" },
];

const popularArticles = [
  { title: "How to verify your SEBI registration on FindOO", category: "Verification", readTime: "3 min" },
  { title: "Setting up your professional profile for maximum visibility", category: "Account & Profile", readTime: "5 min" },
  { title: "Understanding post visibility settings", category: "Posts & Content", readTime: "2 min" },
  { title: "How FindOO protects your personal information", category: "Privacy & Security", readTime: "4 min" },
  { title: "Connecting with verified financial professionals", category: "Account & Profile", readTime: "3 min" },
  { title: "Reporting inappropriate content or users", category: "Community", readTime: "2 min" },
];

const HelpDesk = () => {
  usePageMeta({ title: "Help Desk", description: "Find answers and support for using FindOO." });
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Help Desk"
        title="How can we"
        titleAccent="help you?"
        subtitle="Find answers to common questions, browse help articles, or reach out to our support team."
        variant="dots"
      />

      {/* Search bar */}
      <section className="py-10 border-b border-border">
        <div className="container max-w-2xl">
          <motion.div className="relative" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search for help articles, topics, or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base rounded-xl border-border"
            />
          </motion.div>
        </div>
      </section>

      {/* Help categories */}
      <section className="py-14">
        <div className="container">
          <motion.h2 className="text-xl font-bold font-heading text-foreground mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            Browse by Category
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat, i) => (
              <motion.div key={cat.title}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group"
                initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold font-heading text-card-foreground group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{cat.desc}</p>
                    <p className="text-xs text-muted-foreground mt-2">{cat.articles} articles</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular articles */}
      <section className="py-12 border-t border-border">
        <div className="container max-w-3xl">
          <motion.h2 className="text-xl font-bold font-heading text-foreground mb-8" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            Popular Articles
          </motion.h2>
          <div className="space-y-3">
            {popularArticles.map((article, i) => (
              <motion.div key={article.title}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/20 transition-colors cursor-pointer group"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">{article.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{article.category}</span>
                    <span>·</span>
                    <span>{article.readTime} read</span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-4" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact support CTA */}
      <section className="py-12 border-t border-border">
        <div className="container max-w-3xl">
          <motion.div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-10 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <MessageCircle className="h-8 w-8 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold font-heading text-foreground mb-3">Still need help?</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Our support team is available to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:support@findoo.in">
                  <Mail className="h-4 w-4 mr-1.5" /> Email Us
                </a>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> +91 22 4000 1234</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Mon–Fri, 9AM–6PM IST</span>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default HelpDesk;
