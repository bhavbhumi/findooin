import { motion } from "framer-motion";
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
  { title: "1. Acceptance of Terms", content: "By accessing or using FindOO (the Platform), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Platform. FindOO reserves the right to update these terms at any time, and continued use constitutes acceptance of any changes." },
  { title: "2. Eligibility", content: "You must be at least 18 years old and a resident of India to use FindOO. By registering, you represent that all information provided is accurate and that you are authorized to use the Platform in your stated capacity (Issuer, Intermediary, or Investor)." },
  { title: "3. Account Registration & Verification", content: "Users must provide accurate personal and professional information during registration. Issuers and Intermediaries are required to submit regulatory credentials (SEBI, RBI, IRDAI, AMFI, PFRDA) for verification. Providing false or misleading information may result in account suspension or termination." },
  { title: "4. User Conduct", content: "Users agree not to: share unregistered investment advice; post misleading or manipulative content; engage in harassment, spam, or solicitation; violate any applicable Indian securities or financial regulations; impersonate other individuals or entities. Violations may result in content removal, suspension, or permanent ban." },
  { title: "5. Intellectual Property", content: "All content, branding, and technology on FindOO are the property of FindOO or its licensors. User-generated content remains the property of the user, but by posting, you grant FindOO a non-exclusive, royalty-free license to display and distribute the content within the Platform." },
  { title: "6. Disclaimers", content: "FindOO is a networking platform, not a financial advisor. Content shared by users does not constitute financial advice. FindOO does not guarantee the accuracy of user-generated content or the credentials of any user beyond the verification process. Users should conduct their own due diligence." },
  { title: "7. Limitation of Liability", content: "To the maximum extent permitted by law, FindOO shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, including but not limited to financial losses based on content viewed on the Platform." },
  { title: "8. Termination", content: "FindOO may suspend or terminate your account at any time for violation of these Terms or Community Guidelines. You may delete your account at any time through account settings. Upon termination, your right to use the Platform ceases immediately." },
  { title: "9. Governing Law", content: "These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra." },
  { title: "10. Contact", content: "For questions regarding these Terms of Service, please contact us at legal@findoo.in." },
];

const Terms = () => (
  <PublicPageLayout>
    <PageHero
      breadcrumb="Terms of Service"
      title="Terms of"
      titleAccent="Service"
      subtitle="Last updated: February 2026"
    />

    <section className="py-14">
      <div className="container max-w-3xl">
        <div className="space-y-8">
          {sections.map((s, i) => (
            <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <h2 className="text-lg font-bold font-heading text-foreground mb-2">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </PublicPageLayout>
);

export default Terms;
