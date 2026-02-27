import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

const tabs = ["Terms", "Privacy", "Policies", "Disclosures"];

const termsSections = [
  { title: "1. Acceptance of Terms", content: "By accessing or using FindOO (the Platform), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Platform. FindOO reserves the right to update these terms at any time, and continued use constitutes acceptance of any changes." },
  { title: "2. Eligibility", content: "You must be at least 18 years old and a resident of India to use FindOO. By registering, you represent that all information provided is accurate and that you are authorized to use the Platform in your stated capacity (Issuer, Intermediary, or Investor)." },
  { title: "3. Account Registration & Verification", content: "Users must provide accurate personal and professional information during registration. Issuers and Intermediaries are required to submit regulatory credentials (SEBI, RBI, IRDAI, AMFI, PFRDA) for verification. Providing false or misleading information may result in account suspension or termination." },
  { title: "4. User Conduct", content: "Users agree not to: share unregistered investment advice; post misleading or manipulative content; engage in harassment, spam, or solicitation; violate any applicable Indian securities or financial regulations; impersonate other individuals or entities. Violations may result in content removal, suspension, or permanent ban." },
  { title: "5. Intellectual Property", content: "All content, branding, and technology on FindOO are the property of FindOO or its licensors. User-generated content remains the property of the user, but by posting, you grant FindOO a non-exclusive, royalty-free license to display and distribute the content within the Platform." },
  { title: "6. Disclaimers", content: "FindOO is a networking platform, not a financial advisor. Content shared by users does not constitute financial advice. FindOO does not guarantee the accuracy of user-generated content or the credentials of any user beyond the verification process." },
  { title: "7. Limitation of Liability", content: "To the maximum extent permitted by law, FindOO shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform." },
  { title: "8. Termination", content: "FindOO may suspend or terminate your account at any time for violation of these Terms or Community Guidelines. You may delete your account at any time through account settings." },
  { title: "9. Governing Law", content: "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra." },
  { title: "10. Contact", content: "For questions regarding these Terms of Service, please contact us at legal@findoo.in." },
];

const privacySections = [
  { title: "1. Information We Collect", content: "We collect information you provide during registration (name, email, phone, professional credentials), profile data (organization, designations, certifications), content you create (posts, comments, messages), and usage data (device info, IP address, browsing patterns within the Platform)." },
  { title: "2. How We Use Your Information", content: "Your information is used to: provide and personalize the Platform experience; verify professional credentials with regulatory bodies; facilitate connections between verified participants; send notifications and platform updates; improve our services through aggregated analytics; comply with applicable legal and regulatory requirements." },
  { title: "3. Information Sharing", content: "We do not sell your personal information. We may share information with regulatory authorities when required by law, verification partners for credential validation, and service providers who help operate the Platform under strict confidentiality agreements." },
  { title: "4. Data Security", content: "We implement industry-standard security measures including encryption in transit and at rest, regular security audits, and access controls. However, no method of electronic transmission or storage is 100% secure." },
  { title: "5. Your Rights", content: "You have the right to: access your personal data; correct inaccurate information; delete your account and associated data; export your data; opt out of non-essential communications; restrict processing of your data in certain circumstances." },
  { title: "6. Cookies & Tracking", content: "We use essential cookies for authentication and session management. Analytics cookies help us understand platform usage patterns. You can manage cookie preferences through your browser settings." },
  { title: "7. Data Retention", content: "We retain your data for as long as your account is active. Upon account deletion, personal data is removed within 30 days, except where retention is required by law." },
  { title: "8. Changes to This Policy", content: "We may update this Privacy Policy periodically. Material changes will be communicated via email or prominent notice on the Platform." },
  { title: "9. Contact", content: "For privacy-related inquiries, contact our Data Protection Officer at privacy@findoo.in." },
];

const policiesSections = [
  { title: "1. Content Policy", content: "All content shared on FindOO must comply with Indian financial regulations. Users may not share unregistered investment advice, insider information, or content designed to manipulate markets. All market commentary must include appropriate disclaimers." },
  { title: "2. Advertising Policy", content: "Paid promotions and sponsored content must be clearly labeled. Advertisements for unregulated financial products or services are prohibited. All advertising must comply with SEBI advertising guidelines for financial products." },
  { title: "3. Anti-Spam Policy", content: "Automated posting, mass messaging, and repetitive content are prohibited. Users may not use FindOO for unsolicited commercial communications. Accounts engaged in spam activities will be suspended without notice." },
  { title: "4. Intellectual Property Policy", content: "Users must respect intellectual property rights. Content that infringes on copyrights, trademarks, or proprietary information will be removed. Repeat offenders will have their accounts terminated." },
  { title: "5. Account Sharing Policy", content: "Each account must represent a single individual or entity. Account sharing, selling, or transferring is prohibited. Organizations must use official entity accounts, not personal accounts, for corporate communications." },
  { title: "6. Data Usage Policy", content: "Scraping, harvesting, or automated collection of user data from FindOO is strictly prohibited. API access, if available, must comply with our developer terms and rate limits." },
  { title: "7. Enforcement", content: "Violations of any policy may result in content removal, temporary suspension, or permanent account termination. FindOO reserves the right to take action at its sole discretion to protect the platform and its community." },
];

const disclosureSections = [
  { title: "1. Platform Disclosure", content: "FindOO is a technology platform that facilitates networking between financial market participants. FindOO is not a stock exchange, broker, dealer, investment advisor, or financial intermediary. The platform does not provide financial advice, investment recommendations, or portfolio management services." },
  { title: "2. Regulatory Status", content: "FindOO is a technology company registered in India. The platform itself is not registered with SEBI, RBI, or any other financial regulator as a market intermediary. However, individual users on the platform may hold registrations with these bodies, which are independently verified." },
  { title: "3. Investment Risk Disclosure", content: "Investments in securities markets are subject to market risks. Past performance is not indicative of future results. Content shared on FindOO, including market commentary, research notes, and opinions, should not be construed as investment advice. Users should consult qualified, registered financial advisors before making investment decisions." },
  { title: "4. Verification Disclosure", content: "FindOO verifies user credentials against publicly available regulatory databases. This verification confirms regulatory registration status at the time of verification and does not constitute an endorsement, guarantee of competence, or assurance of future compliance by any verified user." },
  { title: "5. Data & Privacy Disclosure", content: "FindOO collects, processes, and stores user data in accordance with the Information Technology Act, 2000 and applicable data protection rules. User data may be shared with regulatory authorities upon lawful request. For full details, refer to our Privacy Policy." },
  { title: "6. Third-Party Disclosure", content: "FindOO may contain links to third-party websites or services. FindOO is not responsible for the content, accuracy, or practices of third-party sites. Users access third-party links at their own risk." },
  { title: "7. Conflict of Interest", content: "FindOO and its affiliates, employees, or directors may hold positions in securities discussed on the platform. Such holdings, if any, will be disclosed where applicable. Users should be aware of potential conflicts when evaluating content on the platform." },
];

const contentMap: Record<string, { sections: typeof termsSections; lastUpdated: string }> = {
  Terms: { sections: termsSections, lastUpdated: "February 2026" },
  Privacy: { sections: privacySections, lastUpdated: "February 2026" },
  Policies: { sections: policiesSections, lastUpdated: "February 2026" },
  Disclosures: { sections: disclosureSections, lastUpdated: "February 2026" },
};

const Legal = () => {
  usePageMeta({ title: "Legal", description: "FindOO terms of service, privacy policy, and regulatory disclosures." });
  const [activeTab, setActiveTab] = useState("Terms");
  const { sections, lastUpdated } = contentMap[activeTab];

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Legal"
        title="Legal &"
        titleAccent="Compliance"
        subtitle="Our commitment to transparency, data protection, and regulatory compliance."
        variant="dots"
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
                <motion.div layoutId="legal-tab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="py-14">
        <div className="container max-w-3xl">
          <motion.p className="text-sm text-muted-foreground mb-8" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            Last updated: {lastUpdated}
          </motion.p>
          <div className="space-y-8">
            {sections.map((s, i) => (
              <motion.div key={s.title} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <h2 className="text-lg font-bold font-heading text-foreground mb-2">{s.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{s.content}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Legal;
