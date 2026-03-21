import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, FileWarning, Eye, CheckCircle2, AlertTriangle } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const } }),
};

const reportingPeriod = "October 2025 – March 2026";

const metrics = [
  { icon: FileWarning, label: "Reports Received", value: "—", note: "Pre-launch" },
  { icon: Eye, label: "Content Reviewed", value: "—", note: "Pre-launch" },
  { icon: AlertTriangle, label: "Content Actioned", value: "—", note: "Pre-launch" },
  { icon: Users, label: "Users Verified", value: "—", note: "Pre-launch" },
  { icon: CheckCircle2, label: "Grievances Resolved", value: "—", note: "Pre-launch" },
  { icon: Shield, label: "Govt. Requests", value: "0", note: "None received" },
];

const sections = [
  {
    title: "1. Purpose",
    content: `This Transparency Report is published by findoo Solutions LLP ("findoo") in compliance with Rule 4(1)(d) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, which requires significant social media intermediaries to publish periodic compliance reports. findoo voluntarily publishes this report to demonstrate our commitment to responsible platform governance, even where the mandatory threshold may not yet apply.`,
  },
  {
    title: "2. Compliance Framework",
    content: `findoo operates as an intermediary under Section 2(1)(w) of the Information Technology Act, 2000, and complies with: (a) IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021; (b) Digital Personal Data Protection Act, 2023; (c) SEBI regulations for financial content monitoring; (d) Consumer Protection Act, 2019.

Appointed officers: Chief Compliance Officer, Nodal Contact Person (nodal@findoo.in), and Resident Grievance Officer (grievance@findoo.in), all based in India as required by law.`,
  },
  {
    title: "3. Content Moderation",
    content: `findoo employs a multi-layered approach: (a) Automated Filters — keyword, pattern, and URL-based screening; (b) Community Reporting — user-driven flagging with categorized report types; (c) Human Review — trained moderators review flagged content within 24 hours; (d) Appeals Process — users may appeal moderation decisions within 30 days; (e) Graduated Enforcement — warning → temporary restriction → suspension → permanent ban.

Financial content is additionally reviewed for regulatory compliance with SEBI PFUTP and Research Analyst regulations.`,
  },
  {
    title: "4. Government & Legal Requests",
    content: `findoo responds to lawful requests from authorized government agencies, courts, and regulators. We disclose user data only when: (a) required by valid legal process under Indian law; (b) ordered by a court of competent jurisdiction; (c) requested by SEBI, RBI, IRDAI, or other financial regulators with lawful authority; (d) necessary to prevent imminent harm or illegal activity.

We notify affected users of data requests unless prohibited by law or court order. Emergency disclosure requests for imminent threats to life or safety are processed on priority.`,
  },
  {
    title: "5. Verification Metrics",
    content: `Verification statistics for the reporting period: (a) Verification requests submitted; (b) Verification requests approved; (c) Verification requests rejected; (d) Re-verification cycles completed; (e) Verified status revocations. Detailed figures will be published once the platform is fully operational.`,
  },
  {
    title: "6. Data Protection",
    content: `As a Data Fiduciary under the DPDP Act 2023: (a) Data Principal rights requests received and processed; (b) Data breach notifications (none to date); (c) Consent withdrawal requests honored; (d) Data deletion requests completed; (e) Cross-border data transfer disclosures — findoo processes all user data within India. No cross-border transfers occur unless required for essential service operation with appropriate safeguards.`,
  },
  {
    title: "7. Report Schedule",
    content: `Transparency reports are published bi-annually: (a) H1 Report: April–September (published by October 31); (b) H2 Report: October–March (published by April 30). Ad-hoc reports may be published for significant events. All reports are publicly accessible and archived at findoo.in/transparency.`,
  },
  {
    title: "8. Contact",
    content: `Nodal Contact Person: [To be appointed]
Grievance Officer: [To be appointed]
Compliance Officer: [To be appointed]

For all inquiries: compliance@findoo.in

findoo Solutions LLP
Registered Office: B/201 Hemu Classic Premises CS Ltd, S V Road, Opp Newera Cinema, Malad West, Mumbai 400064`,
  },
];

const Transparency = () => {
  usePageMeta({
    title: "Transparency Report | findoo",
    description: "findoo's compliance and transparency report — IT Rules 2021 Rule 4(1)(d) compliant.",
  });

  return (
    <PublicPageLayout>
      <PageHero breadcrumb="Transparency" title="Transparency Report" subtitle={`Compliance & governance report · ${reportingPeriod}`} />
      <section className="container py-12 max-w-3xl mx-auto">
        <p className="text-xs text-muted-foreground mb-8">
          Reporting period: {reportingPeriod} · Also available under <Link to="/legal?tab=transparency" className="underline hover:text-foreground">Legal Hub</Link>
        </p>

        {/* Metrics dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-12">
          {metrics.map((m) => (
            <Card key={m.label} className="border-border">
              <CardContent className="p-4 text-center">
                <m.icon className="h-5 w-5 mx-auto mb-2 text-primary/60" />
                <p className="text-2xl font-bold font-heading text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{m.note}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.div key={s.title} custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h2 className="text-lg font-heading font-semibold text-foreground mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.content}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Transparency;
