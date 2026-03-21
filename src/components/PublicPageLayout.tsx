import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { isDisposableEmail, DISPOSABLE_EMAIL_ERROR } from "@/lib/disposable-email-domains";
import { sanitizeText } from "@/lib/sanitize";
import findooLogo from "@/assets/findoo-logo-icon.png";

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { label: "Directory", to: "/professionals", featured: true },
  { label: "Opinions", to: "/opinions" },
  { label: "Explore", to: "/explore" },
  { label: "Compare", to: "/compare" },
  { label: "Blog", to: "/blog" },
];

const footerLinkSections = [
  {
    title: "About",
    links: [
      { label: "Company", to: "/about" },
      { label: "Career", to: "/about?tab=career" },
      { label: "Press", to: "/about?tab=press" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "What is FindOO", to: "/explore" },
      { label: "Why does it exist", to: "/explore?tab=why" },
      { label: "How it works", to: "/explore?tab=how" },
      { label: "Who is it for", to: "/explore?tab=who" },
      { label: "Pitch", to: "/pitch" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "vs Social Networks", to: "/compare?tab=social" },
      { label: "vs Professional Networks", to: "/compare?tab=professional" },
      { label: "vs Financial Media", to: "/compare?tab=media" },
      { label: "vs News Terminals", to: "/compare?tab=terminals" },
      { label: "vs Chat Groups", to: "/compare?tab=chatgroups" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "Help Desk", to: "/helpdesk" },
      { label: "Quick Links", to: "/quick-links" },
      { label: "Community Guidelines", to: "/community-guidelines" },
      { label: "Developer Docs", to: "/developer" },
    ],
  },
];

const NewsletterForm = () => {
  const { toast } = useToast();
  const [nlSubmitting, setNlSubmitting] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    const hp = formData.get("nl_website") as string;
    if (hp) {
      toast({ title: "Subscribed!", description: "You'll hear from us soon." });
      form.reset();
      return;
    }

    const rawEmail = (formData.get("nl_email") as string || "").trim();
    const email = sanitizeText(rawEmail).slice(0, 255).toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }

    if (isDisposableEmail(email)) {
      toast({ title: "Email not accepted", description: DISPOSABLE_EMAIL_ERROR, variant: "destructive" });
      return;
    }

    setNlSubmitting(true);
    // TODO: wire to backend subscription endpoint
    toast({ title: "Subscribed!", description: "You'll hear from us soon." });
    setNlSubmitting(false);
    form.reset();
  };

  return (
    <form onSubmit={handleNewsletterSubmit} className="flex gap-1.5">
      <input
        type="email"
        name="nl_email"
        placeholder="your@email.com"
        required
        maxLength={255}
        className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      {/* Honeypot — hidden from humans */}
      <div aria-hidden="true" className="absolute opacity-0 h-0 w-0 overflow-hidden" style={{ position: 'absolute', left: '-9999px' }}>
        <input type="text" name="nl_website" tabIndex={-1} autoComplete="off" />
      </div>
      <button
        type="submit"
        disabled={nlSubmitting}
        className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
      >
        Subscribe
      </button>
    </form>
  );
};

const DropdownMenu = ({
  trigger,
  items,
  isActive,
  onClose,
}: {
  trigger: React.ReactNode;
  items: { label: string; to?: string; onClick?: () => void }[];
  isActive?: (to: string) => boolean;
  onClose?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
      >
        {trigger}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1.5 min-w-[180px] rounded-lg border border-border bg-popover shadow-lg py-1.5 animate-in fade-in-0 zoom-in-95 duration-150 z-50">
          {items.map((item, i) =>
            item.to ? (
              <Link
                key={i}
                to={item.to}
                onClick={() => { setOpen(false); onClose?.(); }}
                className={`block px-4 py-2 text-sm font-medium transition-colors hover:bg-muted ${
                  isActive?.(item.to) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false); onClose?.(); }}
                className="block w-full text-left px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};

export const PublicPageLayout = ({ children }: PublicPageLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (to: string) => location.pathname === to;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/30">
        <div className="container flex h-16 items-center justify-between">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={findooLogo} alt="FindOO" className="h-9 w-9" />
            <span className="text-xl font-bold font-heading text-foreground tracking-tight">
              FindOO
            </span>
          </Link>

          {/* Desktop nav — hidden below lg (1024px) */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-md hover:text-foreground hover:bg-muted/50 ${
                  isActive(link.to)
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
                {'featured' in link && link.featured && (
                  <>
                    <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {/* Confetti dots — left side */}
                    <span className="absolute -top-0.5 -left-1 flex gap-[2px] pointer-events-none">
                      <span className="w-[3px] h-[3px] rounded-full animate-[confetti1_2.5s_ease-in-out_infinite]" style={{ backgroundColor: "hsl(45, 90%, 50%)" }} />
                      <span className="w-[2px] h-[2px] rounded-full animate-[confetti2_3s_ease-in-out_infinite_0.3s]" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(45, 90%, 50%))" }} />
                      <span className="w-[3px] h-[3px] rounded-full bg-primary/60 animate-[confetti3_2.8s_ease-in-out_infinite_0.6s]" />
                    </span>
                  </>
                )}
              </Link>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            <ThemeToggle />




            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth" className="text-sm">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/auth?mode=signup" className="text-sm">Get Started</Link>
            </Button>
          </div>

          {/* Hamburger — visible below lg */}
          <div className="flex lg:hidden items-center gap-1.5">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile/tablet menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/40 bg-background/60 backdrop-blur-xl px-4 pb-4 pt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}


            <div className="h-px bg-border my-2" />
            <div className="flex flex-col gap-2 pt-1">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </Button>
              <Button size="sm" asChild className="w-full">
                <Link to="/auth?mode=signup" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ── Content ── */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-primary/10 bg-primary/[0.04]">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Column 1: FindOO brand */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <img src={findooLogo} alt="FindOO" className="h-7 w-7" />
                <span className="text-base font-bold font-heading text-foreground">FindOO</span>
              </div>
              <p className="text-[10px] font-medium text-muted-foreground tracking-[0.15em] uppercase mb-3">
                Financially Social
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-1">
                📍 Mumbai, India
              </p>
              <p className="text-[10px] text-muted-foreground leading-relaxed mb-4">
                CIN : AAA-7870
              </p>

              {/* Newsletter signup */}
              <p className="text-xs font-medium text-foreground mb-2">Stay in the loop</p>
              <NewsletterForm />
            </div>

            {/* Columns 2-4: Link sections */}
            {footerLinkSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold font-heading text-foreground mb-3">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border">
          <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} FindOO. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link to="/legal" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/legal?tab=privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link to="/legal?tab=policies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Policies
              </Link>
              <Link to="/cookies" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cookies
              </Link>
              <Link to="/accessibility" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Accessibility
              </Link>
              <Link to="/refund-policy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Refund Policy
              </Link>
              <Link to="/transparency" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Transparency
              </Link>
              <Link to="/legal?tab=disclosures" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Disclosures
              </Link>
              <Link to="/sitemap" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
