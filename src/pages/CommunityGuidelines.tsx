import { motion } from "framer-motion";
import { Shield, AlertTriangle, Heart, Scale, MessageSquare, Ban } from "lucide-react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const rules = [
  { icon: Shield, title: "Be Authentic", description: "Use your real identity and credentials. Misrepresenting your qualifications, role, or regulatory status is strictly prohibited." },
  { icon: Heart, title: "Be Respectful", description: "Engage with professionalism and courtesy. No personal attacks, harassment, discrimination, or abusive language." },
  { icon: Scale, title: "Be Compliant", description: "Do not share unregistered investment advice, insider information, or content that violates SEBI, RBI, or other regulatory guidelines." },
  { icon: MessageSquare, title: "Be Constructive", description: "Share insights that add value. Market commentary and research should be well-reasoned and clearly labelled as opinions when applicable." },
  { icon: AlertTriangle, title: "No Spam or Manipulation", description: "Avoid repetitive posting, misleading claims, pump-and-dump schemes, or any form of market manipulation." },
  { icon: Ban, title: "No Solicitation", description: "Direct solicitation of clients, unsolicited investment tips, or promotional content disguised as organic posts is not allowed." },
];

const faqs = [
  { q: "What happens if I violate the guidelines?", a: "Violations may result in content removal, temporary suspension, or permanent account termination depending on severity. Repeated minor violations are treated with escalating severity." },
  { q: "How do I report a violation?", a: "Use the report button on any post or profile. You can also email our moderation team at moderation@findoo.in. All reports are reviewed within 48 hours." },
  { q: "Can I share research reports?", a: "Yes, if you are a SEBI-registered Research Analyst. Your verified badge must be active. Always include appropriate disclaimers as required by SEBI regulations." },
  { q: "Are anonymous accounts allowed?", a: "No. All accounts must use real identities. Issuers and Intermediaries must additionally verify their regulatory credentials." },
  { q: "Can I promote my services?", a: "Verified Intermediaries may share educational content about their services, but direct solicitation and cold outreach are not permitted." },
];

const CommunityGuidelines = () => (
  <PublicPageLayout>
    {/* Hero */}
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
      <div className="container relative">
        <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-6">Community Guidelines</h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            FindOO is a professional financial network. These guidelines ensure every interaction upholds the trust and integrity our community deserves.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Rules Grid */}
    <section className="py-16 border-t border-border">
      <div className="container max-w-5xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rules.map((rule, i) => (
            <motion.div key={rule.title} className="rounded-xl border border-border bg-card p-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <rule.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-card-foreground mb-2">{rule.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{rule.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section className="py-16 bg-muted/30">
      <div className="container max-w-3xl">
        <motion.h2 className="text-3xl font-bold font-heading text-foreground text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          Frequently Asked Questions
        </motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
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
  </PublicPageLayout>
);

export default CommunityGuidelines;
