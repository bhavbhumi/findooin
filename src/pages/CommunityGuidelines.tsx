import { motion } from "framer-motion";
import { useState } from "react";
import { Shield, AlertTriangle, Heart, Scale, MessageSquare, Ban } from "lucide-react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

const tabs = ["Guidelines", "FAQ"];

const rules = [
  { letter: "1", icon: Shield, title: "Be Authentic", description: "Use your real identity and credentials. Misrepresenting your qualifications, role, or regulatory status is strictly prohibited." },
  { letter: "2", icon: Heart, title: "Be Respectful", description: "Engage with professionalism and courtesy. No personal attacks, harassment, discrimination, or abusive language." },
  { letter: "3", icon: Scale, title: "Be Compliant", description: "Do not share unregistered investment advice, insider information, or content that violates SEBI, RBI, or other regulatory guidelines." },
  { letter: "4", icon: MessageSquare, title: "Be Constructive", description: "Share insights that add value. Market commentary and research should be well-reasoned and clearly labelled as opinions when applicable." },
  { letter: "5", icon: AlertTriangle, title: "No Spam or Manipulation", description: "Avoid repetitive posting, misleading claims, pump-and-dump schemes, or any form of market manipulation." },
  { letter: "6", icon: Ban, title: "No Solicitation", description: "Direct solicitation of clients, unsolicited investment tips, or promotional content disguised as organic posts is not allowed." },
];

const faqs = [
  { q: "What happens if I violate the guidelines?", a: "Violations may result in content removal, temporary suspension, or permanent account termination depending on severity. Repeated minor violations are treated with escalating severity." },
  { q: "How do I report a violation?", a: "Use the report button on any post or profile. You can also email our moderation team at moderation@findoo.in. All reports are reviewed within 48 hours." },
  { q: "Can I share research reports?", a: "Yes, if you are a SEBI-registered Research Analyst. Your verified badge must be active. Always include appropriate disclaimers as required by SEBI regulations." },
  { q: "Are anonymous accounts allowed?", a: "No. All accounts must use real identities. Issuers and Intermediaries must additionally verify their regulatory credentials." },
  { q: "Can I promote my services?", a: "Verified Intermediaries may share educational content about their services, but direct solicitation and cold outreach are not permitted." },
];

const CommunityGuidelines = () => {
  const [activeTab, setActiveTab] = useState("Guidelines");

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Community Guidelines"
        title="Professional conduct for a"
        titleAccent="trusted network"
        subtitle="These guidelines ensure every interaction upholds the trust and integrity our community deserves."
      />

      {/* Tabs */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="cg-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Guidelines" && (
        <section className="py-14">
          <div className="container max-w-5xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rules.map((rule, i) => (
                <motion.div key={rule.title} className="rounded-xl border border-border bg-card p-6 flex items-start gap-4"
                  initial="hidden" animate="visible" variants={fadeUp} custom={i}>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 text-sm font-bold">
                    {rule.letter}
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-heading text-card-foreground mb-1">{rule.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{rule.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === "FAQ" && (
        <section className="py-14">
          <div className="container max-w-3xl">
            <motion.h2 className="text-2xl font-bold font-heading text-foreground text-center mb-8"
              initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              Frequently Asked Questions
            </motion.h2>
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="rounded-lg border border-border bg-card px-6">
                    <AccordionTrigger className="text-left font-heading font-semibold text-card-foreground">{faq.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>
      )}
    </PublicPageLayout>
  );
};

export default CommunityGuidelines;
