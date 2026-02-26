import { motion } from "framer-motion";
import { Shield, Target, Eye, Users, Award, TrendingUp } from "lucide-react";
import { PublicPageLayout } from "@/components/PublicPageLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const values = [
  { icon: Shield, title: "Trust First", description: "Every entity is verified against regulatory databases — SEBI, RBI, IRDAI, AMFI, and PFRDA." },
  { icon: Eye, title: "Transparency", description: "Clear credentials, verified badges, and open communication between all participants." },
  { icon: Users, title: "Community", description: "A professional network built on mutual respect, knowledge sharing, and ethical conduct." },
  { icon: Award, title: "Quality", description: "Curated insights, verified professionals, and meaningful connections over noise." },
  { icon: TrendingUp, title: "Growth", description: "Tools and features that help every participant grow their practice and knowledge." },
  { icon: Target, title: "Compliance", description: "Built within India's regulatory framework to ensure every interaction meets industry standards." },
];

const About = () => (
  <PublicPageLayout>
    {/* Hero */}
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
      <div className="container relative">
        <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
          <h1 className="text-4xl sm:text-5xl font-bold font-heading text-foreground tracking-tight mb-6">
            About FindOO
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            FindOO is India's first trust-verified financial network — connecting Issuers, Intermediaries, and Investors
            within a regulated, transparent ecosystem.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Mission */}
    <section className="py-16 border-t border-border">
      <div className="container max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To democratize access to India's financial ecosystem by creating a verified, trust-first network where every
              participant — from retail investors to SEBI-registered advisors — can discover, connect, and share insights
              with confidence.
            </p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <h2 className="text-2xl font-bold font-heading text-foreground mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              A financial ecosystem where trust is the default, not the exception. Where every market participant can verify
              credentials instantly, access quality insights freely, and build professional relationships that drive India's
              capital markets forward.
            </p>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-16 bg-muted/30">
      <div className="container max-w-5xl">
        <motion.h2 className="text-3xl font-bold font-heading text-foreground text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          Our Values
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div key={v.title} className="rounded-xl border border-border bg-card p-6" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}>
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-card-foreground mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* Story */}
    <section className="py-16 border-t border-border">
      <div className="container max-w-3xl">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
          <h2 className="text-3xl font-bold font-heading text-foreground text-center mb-8">Our Story</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p>
              India's financial markets have grown exponentially — yet finding verified, trustworthy professionals remains
              a challenge. Retail investors struggle to distinguish genuine advisors from unregistered operators. Regulated
              intermediaries lack a professional platform to showcase their credentials. And issuers need better channels
              to reach their target audience.
            </p>
            <p>
              FindOO was born to solve this trust gap. By combining regulatory verification with a professional social
              network, we've created a space where credentials speak louder than claims, and every connection is built on
              a foundation of verified trust.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  </PublicPageLayout>
);

export default About;
