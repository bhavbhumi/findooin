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
    title: "1. Our Commitment",
    content: `findoo Solutions LLP is committed to ensuring digital accessibility for people with diverse abilities. We believe the financial networking ecosystem should be inclusive and available to everyone, regardless of ability or disability. We continually improve the user experience for all visitors and apply the relevant accessibility standards to ensure we provide equal access to all users.`,
  },
  {
    title: "2. Standards We Follow",
    content: `We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA, as recommended by the World Wide Web Consortium (W3C). These guidelines address: (a) Perceivable — information and user interface components are presentable to users in ways they can perceive; (b) Operable — user interface components and navigation must be operable by all users; (c) Understandable — information and the operation of the user interface must be understandable; (d) Robust — content must be robust enough to be interpreted reliably by a wide variety of user agents, including assistive technologies. We also align with the Rights of Persons with Disabilities Act, 2016 (RPwD Act), which mandates accessible information and communication technology for persons with disabilities in India.`,
  },
  {
    title: "3. Accessibility Features on findoo",
    content: `Our Platform includes the following accessibility features: (a) Semantic HTML — proper use of headings (H1–H6), landmarks (header, nav, main, footer), and ARIA attributes for screen reader compatibility; (b) Keyboard Navigation — all interactive elements are fully navigable using keyboard alone (Tab, Enter, Escape, Arrow keys); (c) Skip Navigation — a "Skip to main content" link is provided for keyboard users to bypass repetitive navigation; (d) Focus Management — visible focus indicators on all interactive elements, with proper focus trapping in modals and dialogs; (e) Color Contrast — text and interactive elements maintain a minimum contrast ratio of 4.5:1 (AA standard); (f) Text Resizing — the Platform supports browser-level text zoom up to 200% without loss of content or functionality; (g) Alt Text — meaningful alternative text is provided for informational images; (h) Form Accessibility — all form inputs have associated labels and error messages are programmatically linked; (i) Dark & Light Themes — both themes maintain accessibility contrast standards; (j) Responsive Design — fully responsive across desktop, tablet, and mobile; (k) Motion Sensitivity — animations respect the "prefers-reduced-motion" media query.`,
  },
  {
    title: "4. Assistive Technology Compatibility",
    content: `findoo is designed to be compatible with: (a) Screen readers — NVDA, JAWS, VoiceOver (macOS/iOS), TalkBack (Android); (b) Screen magnification software — ZoomText, built-in browser zoom; (c) Speech recognition software — Dragon NaturallySpeaking, system-level voice control; (d) Alternative input devices — switch access, eye-tracking systems, sip-and-puff devices; (e) High-contrast modes — Windows High Contrast Mode, browser-based contrast extensions.`,
  },
  {
    title: "5. Known Limitations",
    content: `While we strive for comprehensive accessibility, some areas may have limitations: (a) User-generated content — images uploaded by users may lack alt text; (b) Third-party embeds — some embedded third-party content may not fully meet accessibility standards; (c) PDF documents — some documents uploaded by users may not be fully accessible; (d) Complex data visualizations — charts and graphs provide data tables as alternatives but may not be fully navigable; (e) Real-time features — live chat and real-time notifications may have limited screen reader support in certain configurations. We are actively working to address these limitations.`,
  },
  {
    title: "6. Accessibility Feedback",
    content: `We welcome your feedback on the accessibility of findoo. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:

Email: compliance@findoo.in
Subject line: Accessibility Feedback — [Brief Description]

When reporting an issue, please include: (a) the page or feature URL; (b) a description of the problem; (c) the assistive technology you are using; (d) your browser and operating system; and (e) any screenshots or recordings.

We aim to respond within 5 business days and address critical barriers within 30 days.`,
  },
  {
    title: "7. Accessibility Roadmap",
    content: `Our ongoing improvements include: (a) Regular automated and manual accessibility audits (quarterly); (b) User testing with people with disabilities (bi-annually); (c) VPAT documentation for enterprise clients; (d) Accessibility training for all team members; (e) Integration of accessibility checks into our CI/CD pipeline; (f) Ongoing remediation of WCAG 2.1 Level AA non-conformances.`,
  },
  {
    title: "8. Legal Framework",
    content: `This Accessibility Statement aligns with: (a) Rights of Persons with Disabilities Act, 2016 (RPwD Act) — Section 42; (b) Guidelines for Indian Government Websites (GIGW) — voluntary alignment; (c) Web Content Accessibility Guidelines (WCAG) 2.1 Level AA; (d) United Nations Convention on the Rights of Persons with Disabilities (UNCRPD) — ratified by India in 2007. Last reviewed: March 2026.`,
  },
];

const Accessibility = () => {
  usePageMeta({
    title: "Accessibility Statement | findoo",
    description: "findoo's commitment to digital accessibility — WCAG 2.1 AA, RPwD Act 2016 compliant.",
  });

  return (
    <PublicPageLayout>
      <PageHero breadcrumb="Accessibility" title="Accessibility Statement" subtitle="Our commitment to inclusive digital experiences" />
      <section className="container py-12 max-w-3xl mx-auto">
        <p className="text-xs text-muted-foreground mb-8">Last updated: March 2026 · Also available under <Link to="/legal?tab=accessibility" className="underline hover:text-foreground">Legal Hub</Link></p>
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

export default Accessibility;
