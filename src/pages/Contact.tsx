import { motion } from "framer-motion";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState } from "react";
import { Mail, MapPin, Clock, MessageCircle, Phone, User2, CheckCircle2, Building2, Globe, Navigation } from "lucide-react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" as const },
  }),
};

const tabs = ["Ask Us", "Visit Us"];

const expectations = [
  "Confirmation via email",
  "Response within 24–48 hours",
  "No obligation, completely free",
  "Personalised recommendations",
];

const offices = [
  {
    city: "Mumbai",
    label: "Head Office",
    address: "B/201 Hemu Classic Premises CS Ltd, S V Road, Opp Newera Cinema, Malad West, Mumbai 400064",
    phone: "+91 999 999 9999",
    email: "hello@findoo.in",
    hours: "Mon–Sat, 9:00 AM – 6:00 PM IST",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3768.8!2d72.8456!3d19.1868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b6f5aa35c0a1%3A0x1!2sMalad%20West%2C%20Mumbai!5e0!3m2!1sen!2sin!4v1",
  },
];

const Contact = () => {
  usePageMeta({ title: "Contact Us", description: "Get in touch with FindOO — reach us via form or visit our office." });
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Ask Us");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string || "General inquiry";

    // Send confirmation email (fire and forget)
    supabase.functions.invoke("send-transactional-email", {
      body: {
        type: "contact-confirmation",
        to: email,
        data: { recipientName: name, subject },
      },
    }).catch(() => {});

    toast({ title: "Message sent!", description: "We'll get back to you within 24–48 hours." });
    setSubmitting(false);
    form.reset();
  };

  return (
    <PublicPageLayout>
      <PageHero
        breadcrumb="Contact"
        title="Get in touch"
        titleAccent="with us"
        subtitle="Send us a message, or visit our office — we're here to help."
        variant="squares"
      />

      {/* Tabs */}
      <div className="border-b border-border bg-background sticky top-16 z-30">
        <div className="container flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="contact-tab"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Ask Us Tab */}
      {activeTab === "Ask Us" && (
        <section className="py-12">
          <div className="container">
            {/* Description bar */}
            <motion.div
              className="flex items-center gap-3 mb-10 pb-6 border-b border-border"
              initial="hidden" animate="visible" variants={fadeUp} custom={0}
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-foreground">Send us a Message</h3>
                <p className="text-sm text-muted-foreground">Fill in the form and our team will respond within 24–48 hours.</p>
              </div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-10">
              {/* Form */}
              <motion.div className="md:col-span-2" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <User2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-base font-bold font-heading text-card-foreground">Your Details</h3>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" required placeholder="Your name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" required placeholder="you@example.com" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" placeholder="+91 XXXXX XXXXX" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="topic">Topic</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a topic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Inquiry</SelectItem>
                            <SelectItem value="verification">Verification Help</SelectItem>
                            <SelectItem value="bug">Report a Bug</SelectItem>
                            <SelectItem value="partnership">Partnership</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea id="message" required rows={5} placeholder="Tell us how we can help..." />
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                      {submitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </div>
              </motion.div>

              {/* Sidebar */}
              <motion.div className="space-y-5" initial="hidden" animate="visible" variants={fadeUp} custom={2}>
                {/* Email card */}
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-3">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold font-heading text-card-foreground">Email Us</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">Available Mon–Sat, 9 AM to 6 PM.</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="mailto:hello@findoo.in">hello@findoo.in</a>
                  </Button>
                </div>

                {/* Phone card */}
                <div className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto mb-3">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-bold font-heading text-card-foreground">Call Us</h4>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">Speak to our team directly.</p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href="tel:+919999999999">+91 999 999 9999</a>
                  </Button>
                </div>

                {/* What to expect */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h4 className="text-sm font-bold font-heading text-card-foreground mb-3">What to Expect</h4>
                  <ul className="space-y-2.5">
                    {expectations.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Visit Us Tab */}
      {activeTab === "Visit Us" && (
        <section className="py-12">
          <div className="container">
            {/* Description bar */}
            <motion.div
              className="flex items-center gap-3 mb-10 pb-6 border-b border-border"
              initial="hidden" animate="visible" variants={fadeUp} custom={0}
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-heading text-foreground">Our Office</h3>
                <p className="text-sm text-muted-foreground">Visit us at our office or find us on the map.</p>
              </div>
            </motion.div>

            {offices.map((office, idx) => (
              <div key={office.city} className="grid md:grid-cols-5 gap-8 mb-10">
                {/* Map */}
                <motion.div className="md:col-span-3 rounded-xl overflow-hidden border border-border bg-muted aspect-[16/10]"
                  initial="hidden" animate="visible" variants={fadeUp} custom={1}>
                  <iframe
                    src={office.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`${office.city} office map`}
                  />
                </motion.div>

                {/* Office details */}
                <motion.div className="md:col-span-2 space-y-5" initial="hidden" animate="visible" variants={fadeUp} custom={2}>
                  <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold font-heading text-card-foreground">{office.city}</h4>
                        <span className="text-xs text-primary font-medium">{office.label}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{office.address}</p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 text-primary" />
                        <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="hover:text-foreground transition-colors">{office.phone}</a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                        <a href={`mailto:${office.email}`} className="hover:text-foreground transition-colors">{office.email}</a>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{office.hours}</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" asChild>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(office.address)}`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="h-4 w-4 mr-2" /> Get Directions
                    </a>
                  </Button>
                </motion.div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PublicPageLayout>
  );
};

export default Contact;
