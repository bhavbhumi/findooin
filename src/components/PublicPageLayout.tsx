import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, Globe, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import findooLogo from "@/assets/findoo-logo-icon.png";


interface PublicPageLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { label: "About", to: "/about" },
  { label: "How it Works", to: "/community-guidelines" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "mr", label: "मराठी" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "ta", label: "தமிழ்" },
];

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Community Guidelines", to: "/community-guidelines" },
    ],
  },
];

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
  const [currentLang, setCurrentLang] = useState("en");
  const location = useLocation();

  const isActive = (to: string) => location.pathname === to;
  const currentLangLabel = languages.find((l) => l.code === currentLang)?.label || "English";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
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
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-md hover:text-foreground hover:bg-muted/50 ${
                  isActive(link.to)
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            <ThemeToggle />

            <DropdownMenu
              trigger={
                <>
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">{currentLangLabel}</span>
                </>
              }
              items={languages.map((lang) => ({
                label: lang.label,
                onClick: () => setCurrentLang(lang.code),
              }))}
            />

            <div className="w-px h-5 bg-border mx-1" />

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
          <div className="lg:hidden border-t border-border bg-background px-4 pb-4 pt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
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
            {/* Language selector */}
            <div className="h-px bg-border my-2" />
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Language</p>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang.code)}
                    className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                      currentLang === lang.code
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
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
      <main className="flex-1 pt-16">{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <img src={findooLogo} alt="FindOO" className="h-7 w-7" />
                <span className="text-base font-bold font-heading text-foreground">FindOO</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                India's regulated financial network for verified Issuers, Intermediaries, and Investors.
                Discover, connect, and share insights within a trust-first ecosystem.
              </p>
            </div>

            {/* Link columns */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="text-sm font-semibold font-heading text-foreground mb-3">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.to}>
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
            <div className="flex items-center gap-4">
              <Link to="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
