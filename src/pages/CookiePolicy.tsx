import { usePageMeta } from "@/hooks/usePageMeta";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const } }),
};

const sections = [
  {
    title: "1. What Are Cookies",
    content: `Cookies are small text files stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites function efficiently, enhance user experience, and provide reporting information. FindOO Technologies Private Limited ("FindOO", "we", "us") uses cookies and similar technologies (web beacons, pixel tags, local storage) on the FindOO platform ("Platform") to provide, protect, and improve our services. This Cookie Policy should be read alongside our Privacy Policy and Terms of Service.`,
  },
  {
    title: "2. Types of Cookies We Use",
    content: `2.1 Strictly Necessary Cookies: These cookies are essential for the Platform to function and cannot be disabled. They include: (a) Authentication cookies — to keep you signed in during your session; (b) Security cookies — to detect authentication abuse, protect against CSRF attacks, and prevent unauthorized access; (c) Load-balancing cookies — to distribute traffic across servers for optimal performance; (d) Cookie consent cookies — to remember your cookie preferences.

2.2 Functional Cookies: These cookies enable personalized features: (a) Theme and display preferences (dark/light mode); (b) Language settings; (c) Feed layout and sort preferences; (d) Notification settings; (e) Recently viewed profiles, listings, and events.

2.3 Analytics Cookies: These cookies collect aggregated, anonymized data to help us understand Platform usage: (a) Pages visited and time spent; (b) Feature adoption rates; (c) Navigation paths and user flows; (d) Error tracking and performance monitoring. We use web-vitals and internal analytics. We do NOT use Google Analytics or any third-party behavioral advertising trackers.

2.4 Performance Cookies: These cookies monitor Platform stability: (a) Page load times and Core Web Vitals; (b) API response times; (c) Client-side error rates; (d) Resource utilization metrics.`,
  },
  {
    title: "3. Cookies We Do NOT Use",
    content: `FindOO is committed to user privacy. We explicitly do NOT use: (a) Third-party advertising cookies; (b) Cross-site tracking cookies; (c) Behavioral profiling cookies for ad targeting; (d) Social media tracking pixels from external platforms; (e) Fingerprinting technologies to identify users across sites. We do not sell or share cookie data with advertisers, data brokers, or any third parties for marketing purposes.`,
  },
  {
    title: "4. Cookie Duration",
    content: `4.1 Session Cookies: Temporary cookies that are deleted when you close your browser. Used for authentication and security during your active session.

4.2 Persistent Cookies: Cookies that remain on your device for a set period: (a) Authentication "remember me" cookies — up to 30 days; (b) Preference cookies — up to 12 months; (c) Analytics cookies — up to 12 months; (d) Consent cookies — up to 12 months. All persistent cookies have defined expiry dates and are not set to persist indefinitely.`,
  },
  {
    title: "5. Managing Cookie Preferences",
    content: `You have the right to control cookies: (a) Browser Settings — most browsers allow you to refuse or delete cookies through their settings (Chrome, Firefox, Safari, Edge); (b) Account Settings — you can manage functional and analytics cookie preferences in your FindOO account settings under Privacy & Data; (c) Opt-Out — you may opt out of analytics cookies at any time without affecting Platform functionality.

Important: Disabling strictly necessary cookies may prevent you from signing in, posting content, or using core Platform features. Functional cookies being disabled may result in a less personalized experience.`,
  },
  {
    title: "6. Local Storage & Similar Technologies",
    content: `In addition to cookies, FindOO uses: (a) Local Storage — to store theme preferences, cached feed data, and draft posts for offline resilience; (b) Session Storage — for temporary data during active browser sessions; (c) Web Beacons — invisible pixel-sized images used in emails to confirm delivery and open rates for service-related communications only (not marketing). These technologies are governed by the same principles outlined in this Cookie Policy and our Privacy Policy.`,
  },
  {
    title: "7. Legal Basis (Indian Law)",
    content: `Under the Information Technology Act, 2000, the IT (Reasonable Security Practices) Rules, 2011, and the Digital Personal Data Protection Act, 2023: (a) Strictly necessary cookies are placed without consent as they are essential for Platform operation; (b) Functional, analytics, and performance cookies are placed based on your consent, which you may withdraw at any time; (c) We process cookie data as a "Data Fiduciary" under the DPDP Act and maintain appropriate security measures.`,
  },
  {
    title: "8. Updates to This Cookie Policy",
    content: `We may update this Cookie Policy periodically. Material changes will be communicated via in-app notification. The "Last Updated" date will be revised accordingly. For questions about cookies, contact: privacy@findoo.in.`,
  },
];

const CookiePolicy = () => {
  usePageMeta({
    title: "Cookie Policy | FindOO",
    description: "Learn how FindOO uses cookies and similar technologies on its platform. DPDP Act 2023 compliant.",
  });

  return (
    <PublicPageLayout>
      <PageHero breadcrumb="Cookie Policy" title="Cookie Policy" subtitle="How we use cookies and similar technologies" />
      <section className="container py-12 max-w-3xl mx-auto">
        <p className="text-xs text-muted-foreground mb-8">Last updated: March 2026 · Also available under <Link to="/legal?tab=cookie-policy" className="underline hover:text-foreground">Legal Hub</Link></p>
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

export default CookiePolicy;
