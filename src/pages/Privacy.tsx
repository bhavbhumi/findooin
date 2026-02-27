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
  { title: "1. Information We Collect", content: "We collect information you provide during registration (name, email, phone, professional credentials), profile data (organization, designations, certifications), content you create (posts, comments, messages), and usage data (device info, IP address, browsing patterns within the Platform)." },
  { title: "2. How We Use Your Information", content: "Your information is used to: provide and personalize the Platform experience; verify professional credentials with regulatory bodies; facilitate connections between verified participants; send notifications and platform updates; improve our services through aggregated analytics; comply with applicable legal and regulatory requirements." },
  { title: "3. Information Sharing", content: "We do not sell your personal information. We may share information with: regulatory authorities when required by law; verification partners for credential validation; service providers who help operate the Platform (under strict confidentiality agreements). Your profile information is visible to other users based on your privacy settings." },
  { title: "4. Data Security", content: "We implement industry-standard security measures including encryption in transit and at rest, regular security audits, and access controls. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security." },
  { title: "5. Your Rights", content: "You have the right to: access your personal data; correct inaccurate information; delete your account and associated data; export your data; opt out of non-essential communications; restrict processing of your data in certain circumstances." },
  { title: "6. Cookies & Tracking", content: "We use essential cookies for authentication and session management. Analytics cookies help us understand platform usage patterns. You can manage cookie preferences through your browser settings, though disabling essential cookies may affect Platform functionality." },
  { title: "7. Data Retention", content: "We retain your data for as long as your account is active. Upon account deletion, personal data is removed within 30 days, except where retention is required by law or for legitimate business purposes (e.g., compliance records, dispute resolution)." },
  { title: "8. Children's Privacy", content: "FindOO is not intended for users under 18 years of age. We do not knowingly collect information from minors. If we learn that we have collected data from a user under 18, we will delete it promptly." },
  { title: "9. Changes to This Policy", content: "We may update this Privacy Policy periodically. Material changes will be communicated via email or prominent notice on the Platform. Continued use after changes constitutes acceptance of the updated policy." },
  { title: "10. Contact", content: "For privacy-related inquiries, data requests, or concerns, contact our Data Protection Officer at privacy@findoo.in." },
];

const Privacy = () => {
  usePageMeta({ title: "Privacy Policy" });
  return (
  <PublicPageLayout>
    <PageHero
      breadcrumb="Privacy Policy"
      title="Privacy"
      titleAccent="Policy"
      subtitle="Last updated: February 2026"
      variant="circles"
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
};

export default Privacy;
