/**
 * Support Portal — Tabbed page matching SERNET-style design.
 * Tabs: Knowledge Base | Raise a Ticket | My Tickets
 */
import { motion } from "framer-motion";
import { PulseWaves } from "@/components/decorative/ContextualSpaceElements";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useState, useEffect } from "react";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search, BookOpen, Send, Ticket, ChevronRight, Clock, Eye,
  UserCog, ShieldCheck, MessageCircle, CreditCard, FileText, Settings,
  Briefcase, Calendar, AlertTriangle, Mail, Phone, ExternalLink,
  LayoutGrid, Network, Building2
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useKBArticles, type KBArticle } from "@/hooks/useKnowledgeBase";
import { useMyTickets, useCreateTicket, type SupportTicket } from "@/hooks/useSupportTickets";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

// Category metadata with icons, descriptions, and URL slugs
export const KB_CATEGORIES: Record<string, { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; slug: string; color: string }> = {
  account: { icon: UserCog, title: "Account & Profile", desc: "Registration, profile setup, and account settings", slug: "account", color: "text-blue-600" },
  verification: { icon: ShieldCheck, title: "Verification & Trust", desc: "Credential verification, trust badges, and KYC", slug: "verification", color: "text-green-600" },
  listings: { icon: Building2, title: "Listings & Directory", desc: "Creating listings, managing products and services", slug: "listings", color: "text-amber-600" },
  network: { icon: Network, title: "Network & Connections", desc: "Building connections, introductions, and messaging", slug: "network", color: "text-purple-600" },
  jobs: { icon: Briefcase, title: "Jobs & Events", desc: "Job postings, applications, events, and registrations", slug: "jobs", color: "text-teal-600" },
  billing: { icon: CreditCard, title: "Billing & Plans", desc: "Subscription plans, invoices, and payment methods", slug: "billing", color: "text-rose-600" },
  privacy: { icon: Settings, title: "Privacy & Security", desc: "Data protection, two-factor auth, and privacy controls", slug: "privacy", color: "text-slate-600" },
  community: { icon: FileText, title: "Community & Guidelines", desc: "Rules of engagement and community standards", slug: "community", color: "text-orange-600" },
};

const TICKET_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "account", label: "Account & Profile" },
  { value: "verification", label: "Verification" },
  { value: "billing", label: "Billing & Plans" },
  { value: "content", label: "Posts & Content" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
];

const TABS = [
  { key: "kb", label: "Knowledge Base", icon: BookOpen },
  { key: "raise", label: "Raise a Ticket", icon: Send },
  { key: "tickets", label: "My Tickets", icon: Ticket },
];

// ─── Raise Ticket Tab ─────────────────────────────────
function RaiseTicketTab() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [session, setSession] = useState<any>(null);
  const createTicket = useCreateTicket();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  if (!session) {
    return (
      <div className="text-center py-20">
        <Send className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold font-heading text-foreground mb-2">Sign in to raise a ticket</h3>
        <p className="text-sm text-muted-foreground mb-6">You need to be logged in to submit a support ticket.</p>
        <Button asChild><Link to="/auth">Sign In</Link></Button>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!subject.trim()) return;
    createTicket.mutate(
      { subject: subject.trim(), description: description.trim(), category, priority },
      {
        onSuccess: () => {
          setSubject("");
          setDescription("");
          setCategory("general");
          setPriority("medium");
        },
      }
    );
  };

  return (
    <motion.div className="max-w-xl mx-auto" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
      <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-5">
        <div>
          <h3 className="text-lg font-bold font-heading text-card-foreground mb-1">Submit a Support Ticket</h3>
          <p className="text-sm text-muted-foreground">Describe your issue and our team will get back to you.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ticket-subject">Subject</Label>
          <Input id="ticket-subject" placeholder="Brief summary of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TICKET_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ticket-desc">Description</Label>
          <Textarea id="ticket-desc" placeholder="Describe your issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={2000} />
        </div>
        <Button onClick={handleSubmit} disabled={!subject.trim() || createTicket.isPending} className="w-full">
          {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── My Tickets Tab ───────────────────────────────────
function MyTicketsTab() {
  const [session, setSession] = useState<any>(null);
  const { data: tickets = [], isLoading } = useMyTickets();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
  }, []);

  if (!session) {
    return (
      <div className="text-center py-20">
        <Ticket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold font-heading text-foreground mb-2">Sign in to view your tickets</h3>
        <p className="text-sm text-muted-foreground mb-6">You need to be logged in to see your submitted tickets.</p>
        <Button asChild><Link to="/auth">Sign In</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 animate-pulse">
            <div className="h-4 w-2/3 bg-muted rounded mb-2" />
            <div className="h-3 w-1/3 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20">
        <Ticket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-bold font-heading text-foreground mb-2">No tickets yet</h3>
        <p className="text-sm text-muted-foreground">You haven't submitted any support tickets.</p>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    resolved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    closed: "bg-muted text-muted-foreground",
  };

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {tickets.map((ticket) => (
        <div key={ticket.id} className="rounded-lg border border-border bg-card p-4 hover:border-primary/20 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-card-foreground truncate">{ticket.subject}</h4>
              {ticket.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{ticket.description}</p>}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-[10px]">{ticket.category}</Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(ticket.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColor[ticket.status] || statusColor.open}`}>
              {ticket.status.replace("_", " ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Knowledge Base Tab ───────────────────────────────
function KnowledgeBaseTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: allArticles = [] } = useKBArticles();

  // Group articles by category
  const categoryCounts: Record<string, number> = {};
  allArticles.forEach((a) => {
    categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
  });

  const categories = Object.entries(KB_CATEGORIES).map(([key, meta]) => ({
    ...meta,
    key,
    articles: categoryCounts[key] || 0,
  }));

  // Search results
  const searchResults = searchQuery.length > 1
    ? allArticles.filter((a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    : [];

  // Recent articles = latest 10 by updated_at
  const recentArticles = [...allArticles]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);

  return (
    <>
      {/* Search */}
      <motion.div className="relative max-w-2xl mx-auto mb-10" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search articles — e.g. How do I verify my profile?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-base rounded-xl border-border"
        />
      </motion.div>

      {/* Search results */}
      {searchQuery.length > 1 && (
        <div className="max-w-2xl mx-auto mb-10">
          {searchResults.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No articles found for "{searchQuery}"</p>
          ) : (
            <div className="space-y-2">
              {searchResults.map((article) => (
                <Link
                  key={article.id}
                  to={`/support/${KB_CATEGORIES[article.category]?.slug || article.category}?article=${article.slug}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/20 transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium text-muted-foreground mb-0.5">{KB_CATEGORIES[article.category]?.title || article.category}</div>
                    <h4 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">{article.title}</h4>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-4 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category cards (2×2 grid like SERNET) */}
      {searchQuery.length <= 1 && (
        <>
          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            {categories.filter(c => c.articles > 0).map((cat, i) => (
              <motion.div key={cat.key} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <Link
                  to={`/support/${cat.slug}`}
                  className="flex items-start gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-sm transition-all group"
                >
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 shrink-0 ${cat.color}`}>
                    <cat.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold font-heading text-card-foreground group-hover:text-primary transition-colors">{cat.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{cat.desc}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">{cat.articles} Articles</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Recent Articles */}
          {recentArticles.length > 0 && (
            <div>
              <h2 className="text-lg font-bold font-heading text-foreground mb-4">Recent Articles</h2>
              <div className="space-y-2">
                {recentArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/support/${KB_CATEGORIES[article.category]?.slug || article.category}?article=${article.slug}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:border-primary/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-medium text-muted-foreground mb-0.5">{KB_CATEGORIES[article.category]?.title || article.category}</div>
                        <h4 className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors truncate">{article.title}</h4>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-4 group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ─── Main Support Page ────────────────────────────────
const Support = () => {
  usePageMeta({ title: "Support Portal", description: "Search our knowledge base for instant answers, or raise a ticket for personal support." });
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "kb";

  const setTab = (tab: string) => {
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <PublicPageLayout>
      <PulseWaves className="!fixed !inset-0 !z-0" />
      <PageHero
        breadcrumb="Support"
        title="Support"
        titleAccent="Portal"
        subtitle="Search our knowledge base for instant answers, or raise a ticket for personal support."
        variant="dots"
        context="support"
      />

      {/* Tabs */}
      <div className="border-b border-border sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container">
          <nav className="flex gap-0 -mb-px overflow-x-auto" aria-label="Support tabs">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab content */}
      <section className="py-10">
        <div className="container">
          {activeTab === "kb" && <KnowledgeBaseTab />}
          {activeTab === "raise" && <RaiseTicketTab />}
          {activeTab === "tickets" && <MyTicketsTab />}
        </div>
      </section>

      {/* Contact footer */}
      <section className="py-10 border-t border-border">
        <div className="container max-w-3xl">
          <div className="rounded-2xl bg-primary/[0.04] border border-primary/10 p-8 text-center">
            <MessageCircle className="h-7 w-7 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-bold font-heading text-foreground mb-2">Need More Help?</h3>
            <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">Our support team is available to assist you.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={() => setTab("raise")}>
                <Send className="h-4 w-4 mr-1.5" /> Raise Ticket
              </Button>
              <Button variant="outline" asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:support@findoo.in"><Mail className="h-4 w-4 mr-1.5" /> Email Us</a>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> +91 22 4000 1234</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Mon–Fri, 9AM–6PM IST</span>
            </div>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  );
};

export default Support;
