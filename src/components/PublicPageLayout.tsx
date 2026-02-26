import { Link } from "react-router-dom";
import findooLogo from "@/assets/findoo-logo-icon.png";
import { Button } from "@/components/ui/button";

interface PublicPageLayoutProps {
  children: React.ReactNode;
}

const footerLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Blog", to: "/blog" },
  { label: "Community Guidelines", to: "/community-guidelines" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
];

export const PublicPageLayout = ({ children }: PublicPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={findooLogo} alt="FindOO" className="h-8 w-8" />
            <span className="text-xl font-bold font-heading text-foreground tracking-tight">FindOO</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 pt-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-10 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <img src={findooLogo} alt="FindOO" className="h-6 w-6" />
                <span className="text-sm font-semibold font-heading text-foreground">FindOO</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                India's regulated financial network for verified Issuers, Intermediaries, and Investors.
              </p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FindOO. India's regulated financial network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
