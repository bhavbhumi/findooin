import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Shield, AlertTriangle, Heart, Scale, MessageSquare, Ban, Eye, FileCheck, Users, Gavel } from "lucide-react";
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

const tabs = ["Guidelines", "FAQs"];

const rules = [
  { letter: "1", icon: Shield, title: "Be Authentic", description: "Use your real identity and credentials. Misrepresenting your qualifications, regulatory status, SEBI/AMFI/IRDAI registration, or organizational role is strictly prohibited. Every account must represent a real individual or registered entity." },
  { letter: "2", icon: Heart, title: "Be Respectful", description: "Engage with professionalism and courtesy. No personal attacks, harassment, discrimination, hate speech, threats, or abusive language. Respect diverse viewpoints even when you disagree — debate ideas, not individuals." },
  { letter: "3", icon: Scale, title: "Be Compliant", description: "Do not share unregistered investment advice, insider information (UPSI under SEBI regulations), or content that violates SEBI, RBI, IRDAI, or other regulatory guidelines. Only SEBI-registered Investment Advisors and Research Analysts may provide investment advice within the scope of their registration." },
  { letter: "4", icon: MessageSquare, title: "Be Constructive", description: "Share insights that add value. Market commentary and research should be well-reasoned and clearly labeled as opinions when applicable. Include appropriate disclaimers as required by SEBI regulations. Avoid sensationalism or clickbait around market movements." },
  { letter: "5", icon: AlertTriangle, title: "No Spam or Manipulation", description: "No repetitive posting, misleading claims, pump-and-dump schemes, front-running, or any form of market manipulation. Avoid automated mass interactions, bot-driven engagement, or artificial amplification of content." },
  { letter: "6", icon: Ban, title: "No Solicitation", description: "Direct solicitation of clients, unsolicited investment tips, cold outreach via DMs, or promotional content disguised as organic posts is not allowed. Paid endorsements must be clearly disclosed." },
  { letter: "7", icon: Eye, title: "Respect Privacy", description: "Do not share private messages, personal contact details, or confidential information of other Users without their consent. Screenshots of private conversations must not be redistributed without permission." },
  { letter: "8", icon: FileCheck, title: "Disclose Conflicts", description: "If you have a financial interest in a product, security, or company you are discussing, disclose it clearly. Transparency about conflicts of interest builds trust in the community." },
  { letter: "9", icon: Users, title: "Protect the Community", description: "Report violations using the in-app report button or email compliance@findoo.in. Do not engage with or amplify harmful content. Help us maintain a safe, professional environment for all financial professionals." },
  { letter: "10", icon: Gavel, title: "Accept Accountability", description: "Violations result in graduated enforcement: warnings, content removal, feature restrictions, temporary suspension, or permanent termination. Appeals can be submitted to legal@findoo.in within 30 days." },
];

const faqs = [
  { q: "What happens if I violate the guidelines?", a: "FindOO uses graduated enforcement: first-time minor violations receive a warning; repeated or serious violations may result in content removal, feature restriction (7-30 days), temporary suspension, or permanent account termination. The severity of action depends on the nature, frequency, and impact of the violation." },
  { q: "How do I report a violation?", a: "Use the report button available on any post, comment, or profile. You can also email hello@findoo.in with details. All reports are reviewed within 48 hours. Reports are confidential — we do not reveal reporter identities to the reported User." },
  { q: "Can I share research reports on FindOO?", a: "Yes, if you are a SEBI-registered Research Analyst (under SEBI (Research Analysts) Regulations, 2014). Your verified badge must be active. All research must include: SEBI registration number, appropriate disclaimers, conflict of interest disclosures, and compliance with SEBI guidelines on research report distribution." },
  { q: "Are anonymous or pseudonymous accounts allowed?", a: "No. All accounts must use real identities (legal name for individuals, registered entity name for organizations). Issuers and Intermediaries must additionally verify their regulatory credentials. This is fundamental to the trust-based nature of the financial networking platform." },
  { q: "Can I promote my financial services on FindOO?", a: "Verified Intermediaries may share educational content about their services and expertise. However, direct solicitation, cold outreach, unsolicited product recommendations, and promotional content without proper labeling are prohibited. Paid promotions must be labeled as 'Sponsored' or 'Advertisement' and comply with SEBI advertising guidelines." },
  { q: "What qualifies as 'unregistered investment advice'?", a: "Any specific recommendation to buy, sell, or hold a particular security, financial instrument, or investment product — provided by someone who is not registered as an Investment Advisor under SEBI (Investment Advisers) Regulations, 2013, or a Research Analyst under SEBI (Research Analysts) Regulations, 2014. General market commentary, educational content, and factual information sharing are typically not considered investment advice, but should always include appropriate disclaimers." },
  { q: "How do I appeal an enforcement action?", a: "Submit your appeal to hello@findoo.in within 30 days of the action, including your account details, a description of the enforcement action, and your reasoning for the appeal. Appeals are reviewed by a different team member within 15 business days. You will receive a written response with the appeal decision." },
  { q: "Can I share AMFI/IRDAI product brochures or NFO information?", a: "Yes, verified Intermediaries may share official product literature from AMCs, insurance companies, and other issuers. All shared materials must be from authorized sources, current and not outdated, and accompanied by relevant statutory disclaimers (e.g., 'Mutual fund investments are subject to market risks')." },
  { q: "What about content in regional languages?", a: "Content in all supported languages (English, Hindi, Marathi, Gujarati, Tamil) is subject to the same Community Guidelines. The moderation team reviews content across all supported languages. In case of disputes, the English version of guidelines prevails." },
  { q: "How does FindOO handle market-sensitive content during trading hours?", a: "While FindOO does not restrict posting times, Users are reminded that sharing UPSI (Unpublished Price Sensitive Information) is illegal under SEBI (Prohibition of Insider Trading) Regulations, 2015, regardless of when it is posted. Content that could influence market prices should always include appropriate disclaimers and comply with applicable SEBI regulations." },
];

const CommunityGuidelines = () => {
  usePageMeta({ title: "Community Guidelines", description: "FindOO community guidelines and FAQs — professional conduct standards for India's financial network." });
  const [activeTab, setActiveTab] = useState("Guidelines");

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Community Guidelines"
        title="Professional conduct for a"
        titleAccent="trusted network"
        subtitle="These guidelines ensure every interaction upholds the trust, compliance, and integrity India's financial community deserves."
        variant="triangles"
      />

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

      {activeTab === "FAQs" && (
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
