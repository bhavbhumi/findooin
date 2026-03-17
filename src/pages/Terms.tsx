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
    title: "1. Introduction & Acceptance",
    content: `These Terms of Service ("Terms") constitute a legally binding agreement between you ("User") and FindOO Solutions LLP ("FindOO"), a limited liability partnership incorporated under the Limited Liability Partnership Act, 2008, with its registered office at B/201 Hemu Classic Premises CS Ltd, S V Road, Opp Newera Cinema, Malad West, Mumbai 400064, Maharashtra, India. By accessing or using the FindOO platform and related services (the "Platform"), you agree to be bound by these Terms, our Privacy Policy, Community Guidelines, and all applicable policies. If you do not agree, you must not access or use the Platform.`,
  },
  {
    title: "2. Eligibility",
    content: `You must be at least 18 years of age and competent to enter into a binding contract under the Indian Contract Act, 1872. By registering, you represent that all information provided is accurate, you are authorized to use the Platform in your stated capacity (Issuer, Intermediary, or Investor), and if registering as an Intermediary or Issuer, you hold valid registrations with the relevant Indian financial regulators (SEBI, RBI, IRDAI, AMFI, or PFRDA).`,
  },
  {
    title: "3. Account Registration & Verification",
    content: `Each User must create a single account representing their real identity. Account sharing, selling, or transferring is prohibited. Issuers and Intermediaries must submit regulatory credentials for verification. FindOO verifies credentials against publicly available regulatory databases. Providing false or misleading information may result in account suspension or termination. You are responsible for maintaining the confidentiality of your login credentials.`,
  },
  {
    title: "4. User Conduct",
    content: `Users agree to comply with all applicable Indian laws including the IT Act, 2000 and SEBI regulations. Users may not: share unregistered investment advice; post insider information or content constituting market manipulation; engage in harassment, spam, or solicitation; violate financial regulations; impersonate individuals or entities; scrape or harvest Platform data; or reverse-engineer Platform systems. All market commentary must include appropriate disclaimers as required by SEBI regulations.`,
  },
  {
    title: "5. Content & Intellectual Property",
    content: `You retain ownership of Content you post but grant FindOO a non-exclusive, worldwide, royalty-free license to use, display, and distribute Content within the Platform. All Platform IP (design, code, logos, trademarks) belongs to FindOO. Copyright claims should be submitted to grievance@findoo.in under the IT (Intermediary Guidelines) Rules, 2021.`,
  },
  {
    title: "6. Disclaimers",
    content: `FindOO is a networking platform, not a financial advisor. The Platform is provided "AS IS" without warranties. Content shared by Users does not constitute financial advice. Investments are subject to market risks. Past performance is not indicative of future results. FindOO does not guarantee the accuracy of user-generated content or credentials beyond the initial verification process.`,
  },
  {
    title: "7. Limitation of Liability",
    content: `FindOO's total aggregate liability shall not exceed the amount paid by you in the twelve months preceding the claim, or INR 10,000, whichever is greater. FindOO shall not be liable for indirect, incidental, special, or consequential damages including financial losses based on Platform content.`,
  },
  {
    title: "8. Indemnification",
    content: `You agree to indemnify and hold harmless FindOO from all claims arising from your use of the Platform, your Content, violation of these Terms or applicable laws, misrepresentation of regulatory status, or financial advice provided without appropriate registration.`,
  },
  {
    title: "9. Termination",
    content: `You may delete your account at any time. FindOO may suspend or terminate accounts for violation of Terms, provision of false information, lapse of regulatory registration, or harmful activities. Upon termination, your license to use the Platform ceases immediately. Data retention follows applicable Indian law requirements.`,
  },
  {
    title: "10. Governing Law & Dispute Resolution",
    content: `These Terms are governed by Indian law. Disputes shall first be resolved through 30-day good-faith negotiation, then by arbitration under the Arbitration and Conciliation Act, 1996, seated in Mumbai, Maharashtra. The courts of Mumbai have exclusive jurisdiction. FindOO has appointed a Grievance Officer per IT Rules, 2021 — complaints are acknowledged within 24 hours and resolved within 15 days.`,
  },
  {
    title: "11. Contact",
    content: `FindOO Solutions LLP
Registered Office: B/201 Hemu Classic Premises CS Ltd, S V Road, Opp Newera Cinema, Malad West, Mumbai 400064

For all inquiries: hello@findoo.in`,
  },
];

const Terms = () => {
  usePageMeta({ title: "Terms of Service", description: "FindOO Terms of Service — governed by Indian law, DPDP Act and IT Act compliant." });
  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Terms of Service"
        title="Terms of"
        titleAccent="Service"
        subtitle="Last updated: March 2026"
        variant="dots"
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

export default Terms;
