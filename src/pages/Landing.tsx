import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Users, TrendingUp, Building2, UserCheck, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPageLayout } from "@/components/PublicPageLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const roles = [
  {
    icon: Building2,
    title: "Issuers",
    description: "Listed companies, AMCs, NBFCs, Banks & Insurance companies — reach verified investors and intermediaries.",
    color: "bg-issuer/10 text-issuer",
  },
  {
    icon: UserCheck,
    title: "Intermediaries",
    description: "Brokers, RIAs, MF Distributors, Research Analysts — build trust with verified credentials.",
    color: "bg-intermediary/10 text-intermediary",
  },
  {
    icon: BarChart3,
    title: "Investors",
    description: "Retail, HNI, Institutional & NRI investors — discover verified entities and quality insights.",
    color: "bg-investor/10 text-investor",
  },
];

const trustPoints = [
  "SEBI, RBI, IRDAI, AMFI & PFRDA regulated entities",
  "Manual verification with trust badges",
  "Role-based access & privacy controls",
  "Multi-role support — grow from Investor to Intermediary",
];

const Landing = () => {
  return (
    <PublicPageLayout>
      {/* Hero */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />

        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large gradient ring — top right */}
          <motion.div
            className="absolute -top-16 -right-16 w-[340px] h-[340px] rounded-full border-2 border-primary/[0.06]"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />
          <motion.div
            className="absolute -top-8 -right-8 w-[260px] h-[260px] rounded-full border border-accent/[0.08]"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.15, ease: "easeOut" }}
          />

          {/* Small floating squares — left */}
          <motion.div
            className="absolute top-1/4 left-[8%] w-4 h-4 rotate-45 border border-primary/[0.12]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.div
            className="absolute top-[38%] left-[5%] w-2.5 h-2.5 rotate-12 bg-accent/[0.1] rounded-sm"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          />

          {/* Dotted grid — bottom left */}
          <motion.div
            className="absolute bottom-12 left-[6%] grid grid-cols-4 gap-2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-primary/[0.08]" />
            ))}
          </motion.div>

          {/* Diagonal line — right */}
          <motion.div
            className="absolute top-[55%] right-[7%] w-px h-24 bg-gradient-to-b from-transparent via-primary/[0.1] to-transparent rotate-[25deg]"
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
          />

          {/* Pulsing accent dot — bottom right */}
          <motion.div
            className="absolute bottom-20 right-[12%] w-2 h-2 rounded-full bg-accent/20"
            animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Triangle outline — top left */}
          <motion.svg
            className="absolute top-20 left-[10%] w-10 h-10 text-primary/[0.07]"
            viewBox="0 0 40 40"
            fill="none"
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <path d="M20 4L36 34H4L20 4Z" stroke="currentColor" strokeWidth="1.5" />
          </motion.svg>
        </div>

        <div className="container relative">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 mb-6 text-sm text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-accent" />
              India's Regulated Financial Network
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading tracking-tight text-foreground leading-[1.1] mb-6">
              Where India's financial
              <br />
              ecosystem <span className="text-accent">connects</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              A trust-first network for verified Issuers, Intermediaries, and Investors.
              Discover, connect, and share insights — all within a regulated framework.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-base" asChild>
                <Link to="/auth?mode=signup">
                  Join FindOO
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 border-t border-border">
        <div className="container">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              Built for every participant
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              One platform. Every role. Verified trust at every layer.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                className="rounded-xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i + 1}
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg ${role.color} mb-5`}>
                  <role.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold font-heading text-card-foreground mb-3">{role.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{role.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
                Trust is not optional
              </h2>
              <p className="text-primary-foreground/70 text-lg leading-relaxed">
                Every Issuer and Intermediary goes through verification.
                Upload your SEBI, RBI, or IRDAI registration — earn a verified badge
                that signals credibility to the entire network.
              </p>
            </motion.div>
            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {trustPoints.map((point, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  variants={fadeUp}
                  custom={i + 1}
                >
                  <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <span className="text-primary-foreground/90">{point}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              Ready to join India's financial network?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Whether you're a retail investor, a SEBI-registered advisor, or a listed company — there's a place for you.
            </p>
            <Button size="lg" className="h-12 px-8 text-base" asChild>
              <Link to="/auth?mode=signup">
                Create Your Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Landing;
