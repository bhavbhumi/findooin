import { motion } from "framer-motion";
import { PublicPageLayout } from "@/components/PublicPageLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
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
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
      <div className="container relative">
        <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 2026</p>
        </motion.div>
      </div>
    </section>

    <section className="py-16 border-t border-border">
      <div className="container max-w-3xl">
        <motion.div className="space-y-8" initial="hidden" animate="visible" variants={fadeUp}>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-bold font-heading text-foreground mb-3">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.content}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  </PublicPageLayout>
);

export default Terms;
