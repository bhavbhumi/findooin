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
    title: "1. Applicability",
    content: `This Refund and Cancellation Policy applies to all paid features, subscription plans, and premium services offered by FindOO Technologies Private Limited ("FindOO") through the FindOO platform ("Platform"). As of the current date, FindOO's core networking features are free to use. This policy will govern future premium offerings including, but not limited to: (a) FindOO Pro subscriptions; (b) FindOO Enterprise plans; (c) Promoted listings and sponsored content; (d) Premium event hosting features; (e) Enhanced analytics and lead capture tools; (f) Any other paid features introduced on the Platform.`,
  },
  {
    title: "2. Subscription Plans",
    content: `2.1 Billing Cycle: Subscriptions are billed on a recurring basis (monthly or annually) starting from the date of purchase. Annual plans are billed as a single payment at the beginning of the billing cycle.

2.2 Auto-Renewal: All subscriptions auto-renew at the end of each billing cycle unless cancelled before the renewal date. You will receive a reminder notification at least 7 days before renewal.

2.3 Price Changes: FindOO reserves the right to modify subscription pricing. Any price increase will be communicated at least 30 days before it takes effect and will apply only from your next billing cycle.`,
  },
  {
    title: "3. Cancellation Policy",
    content: `3.1 How to Cancel: You may cancel your subscription at any time through: (a) Account Settings → Subscription → Cancel Plan; or (b) by contacting billing@findoo.in.

3.2 Effect of Cancellation: Upon cancellation, your premium features remain active until the end of the current billing period. After expiry, your account reverts to the free tier.

3.3 Data Retention After Cancellation: Your account data is retained after downgrading. Premium-specific data (advanced analytics, lead capture data) will be retained for 90 days after cancellation, during which you may export it.`,
  },
  {
    title: "4. Refund Policy",
    content: `4.1 Cooling-Off Period: You may request a full refund within 7 days of your initial subscription purchase if you have not substantially used premium features (accessing on more than 3 separate days).

4.2 Annual Subscriptions: Cancelled after the 7-day cooling-off period, FindOO may provide a pro-rated refund for unused months at its discretion, less a 10% administrative fee.

4.3 Monthly Subscriptions: Cancelled after the cooling-off period are not eligible for refunds. The subscription remains active until the end of the current billing cycle.

4.4 Refunds for Service Issues: Material service outages exceeding 72 consecutive hours entitle you to a pro-rated refund or credit by contacting billing@findoo.in.

4.5 Non-Refundable Items: (a) One-time purchases once delivered/live; (b) Features fully consumed during the billing period; (c) Subscriptions using promotional codes (unless stated in promo terms).`,
  },
  {
    title: "5. Refund Process",
    content: `5.1 How to Request: Submit via Account Settings → Billing → Request Refund; or email billing@findoo.in.

5.2 Processing Time: Reviewed within 5 business days. Approved refunds processed within 7–10 business days.

5.3 Refund Method: Credited to the original payment method. If unavailable, an alternative will be coordinated.

5.4 Currency: All refunds in Indian Rupees (INR). Exchange rate fluctuations for international payments are borne by the User.`,
  },
  {
    title: "6. Taxes",
    content: `All prices are exclusive of applicable GST unless stated otherwise. GST charged at prevailing rates per the CGST Act, 2017. Tax invoices available at Account Settings → Billing → Invoices. Refunds include any GST originally charged.`,
  },
  {
    title: "7. Disputes",
    content: `Billing disputes must be notified within 30 days of the charge date to billing@findoo.in. Failure to dispute within 30 days constitutes acceptance. Disputes are resolved per the mechanism in our Terms of Service.`,
  },
  {
    title: "8. Contact",
    content: `For billing inquiries, refund requests, or cancellation assistance:
Email: billing@findoo.in
Support: support@findoo.in

FindOO Technologies Private Limited
Registered Office: Mumbai, Maharashtra, India`,
  },
];

const RefundPolicy = () => {
  usePageMeta({
    title: "Refund & Cancellation Policy | FindOO",
    description: "FindOO's refund and cancellation terms for premium features and subscriptions. GST compliant.",
  });

  return (
    <PublicPageLayout>
      <PageHero breadcrumb="Refund Policy" title="Refund & Cancellation Policy" subtitle="Terms governing paid features and subscriptions" />
      <section className="container py-12 max-w-3xl mx-auto">
        <p className="text-xs text-muted-foreground mb-8">Last updated: March 2026 · Also available under <Link to="/legal?tab=refund-policy" className="underline hover:text-foreground">Legal Hub</Link></p>
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

export default RefundPolicy;
