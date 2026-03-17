import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

const sections = [
  {
    title: "1. Introduction",
    content: `This Privacy Policy describes how FindOO Solutions LLP ("FindOO") collects, uses, shares, protects, and retains your personal information. This Policy is published in compliance with the Information Technology Act, 2000, the IT (Reasonable Security Practices) Rules, 2011, the IT (Intermediary Guidelines) Rules, 2021, and the Digital Personal Data Protection Act, 2023 ("DPDP Act").`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect: (a) Registration data — name, email, phone, date of birth; (b) Professional information — organization, designation, regulatory registration numbers (SEBI, AMFI ARN, IRDAI, RBI, PFRDA), certifications, specializations; (c) Profile data — biography, photos, location, website, social links; (d) Content — posts, comments, messages, research notes, uploaded documents; (e) Verification documents — regulatory certificates and identity proofs; (f) Device & log data — device type, OS, browser, IP address, access timestamps, pages visited; (g) Location data — approximate location from IP (precise only with consent); (h) Third-party data — verification data from regulatory databases, third-party sign-in profiles.`,
  },
  {
    title: "3. How We Use Your Information",
    content: `We use your information to: (a) manage your account and provide Platform services; (b) verify regulatory credentials against official databases; (c) personalize your feed, recommendations, and content discovery; (d) send service notifications and security alerts; (e) detect and prevent fraud, abuse, and policy violations; (f) conduct aggregated, anonymized analytics; (g) comply with Indian legal and regulatory requirements; (h) resolve disputes and enforce our Terms; and (i) conduct voluntary research and surveys.`,
  },
  {
    title: "4. Legal Basis (DPDP Act, 2023)",
    content: `We process personal data based on: (a) Consent — provided when you create an account and use the Platform; (b) Legitimate uses — for contractual obligations, legal compliance, and protecting vital interests; (c) Contractual necessity — for delivering requested services. You may withdraw consent at any time by adjusting privacy settings or deleting your account.`,
  },
  {
    title: "5. Information Sharing",
    content: `We do not sell your personal data. We may share information: (a) With other Users — profile data visible per your privacy settings; (b) With regulators — SEBI, RBI, IRDAI, law enforcement when required by law; (c) With service providers — hosting, analytics, email delivery providers under strict confidentiality; (d) Business transfers — in mergers or acquisitions with prior notice; (e) With your consent — for other purposes you explicitly approve.`,
  },
  {
    title: "6. Data Security",
    content: `We implement security practices per IT Rules, 2011, including: TLS/SSL encryption in transit, AES-256 encryption at rest, secure authentication with password hashing, role-based access controls, regular security assessments, and incident response procedures per the DPDP Act. Data is stored on servers in India or jurisdictions with adequate data protection.`,
  },
  {
    title: "7. Your Rights Under Indian Law",
    content: `Under the DPDP Act, 2023, you have the right to: (a) Access your personal data; (b) Correct inaccurate data; (c) Erase your data (subject to legal retention); (d) Nominate someone to exercise your rights; (e) File grievances with our Grievance Officer or the Data Protection Board of India; (f) Withdraw consent; (g) Data portability in machine-readable format. Contact compliance@findoo.in to exercise these rights (response within 30 days).`,
  },
  {
    title: "8. Cookies & Tracking",
    content: `We use: (a) Strictly necessary cookies — for authentication and security; (b) Functional cookies — for preferences and settings; (c) Analytics cookies — for aggregated usage statistics; (d) Performance cookies — for monitoring Platform performance. We do not use advertising or third-party tracking cookies. Manage preferences through browser settings.`,
  },
  {
    title: "9. Data Retention",
    content: `Active account data is retained while your account is active. Post-deletion, personal data is removed within 90 days except where retention is required by law. Audit logs, regulatory records, and financial data may be retained up to 8 years per Indian tax laws and SEBI regulations. Anonymized, aggregated data may be retained indefinitely.`,
  },
  {
    title: "10. Cross-Border Transfers",
    content: `Data is primarily stored in India. Cross-border transfers comply with the DPDP Act, 2023, with appropriate contractual safeguards. We do not transfer data to jurisdictions restricted by the Central Government.`,
  },
  {
    title: "11. Children's Privacy",
    content: `The Platform is not intended for individuals under 18. We do not knowingly collect data from minors. If discovered, such data is promptly deleted. Report concerns to compliance@findoo.in.`,
  },
  {
    title: "12. Changes to This Policy",
    content: `Material changes are communicated via email, in-app notification, and prominent Platform notice. Continued use after changes constitutes acceptance.`,
  },
  {
    title: "13. Grievance Officer & Contact",
    content: `In compliance with the IT (Intermediary Guidelines) Rules, 2021 and the DPDP Act, 2023, FindOO has appointed a Grievance Officer:

Grievance Officer: [To be appointed]
FindOO Solutions LLP
B/201 Hemu Classic Premises CS Ltd, S V Road, Opp Newera Cinema, Malad West, Mumbai 400064

For all inquiries: hello@findoo.in

The Grievance Officer shall acknowledge complaints within 24 hours and resolve them within 15 days. If unsatisfied with resolution, you may approach the Data Protection Board of India under the DPDP Act, 2023.`,
  },
];

const Privacy = () => {
  usePageMeta({ title: "Privacy Policy", description: "FindOO Privacy Policy — DPDP Act 2023 and IT Act compliant, Indian jurisdiction." });
  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Privacy Policy"
        title="Privacy"
        titleAccent="Policy"
        subtitle="Last updated: March 2026"
        variant="circles"
      />

      <section className="py-14">
        <div className="container max-w-3xl">
          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <h2 className="text-lg font-bold font-heading text-foreground mb-2">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{s.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Privacy;
