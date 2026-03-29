import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isDisposableEmail, DISPOSABLE_EMAIL_ERROR } from "@/lib/disposable-email-domains";
import { sanitizeText } from "@/lib/sanitize";
import { Mail } from "lucide-react";

interface NewsletterFormProps {
  /** Render as a full card (for embedding in grids) vs inline (compact) */
  variant?: "inline" | "card";
}

export const NewsletterForm = ({ variant = "inline" }: NewsletterFormProps) => {
  const { toast } = useToast();
  const [nlSubmitting, setNlSubmitting] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

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
    toast({ title: "Subscribed!", description: "You'll hear from us soon." });
    setNlSubmitting(false);
    form.reset();
  };

  if (variant === "card") {
    return (
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/5 p-6 flex flex-col justify-center h-full">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Mail className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-foreground">Stay in the loop</h3>
            <p className="text-[11px] text-muted-foreground">Get curated insights, weekly.</p>
          </div>
        </div>
        <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            name="nl_email"
            placeholder="your@email.com"
            required
            maxLength={255}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div aria-hidden="true" className="absolute opacity-0 h-0 w-0 overflow-hidden" style={{ position: 'absolute', left: '-9999px' }}>
            <input type="text" name="nl_website" tabIndex={-1} autoComplete="off" />
          </div>
          <button
            type="submit"
            disabled={nlSubmitting}
            className="w-full px-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            Subscribe
          </button>
        </form>
        <p className="text-[10px] text-muted-foreground mt-2">No spam. Unsubscribe anytime.</p>
      </div>
    );
  }

  // Inline (compact) variant
  return (
    <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-2">
      <input
        type="email"
        name="nl_email"
        placeholder="your@email.com"
        required
        maxLength={255}
        className="w-full px-3 py-2 rounded-lg border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div aria-hidden="true" className="absolute opacity-0 h-0 w-0 overflow-hidden" style={{ position: 'absolute', left: '-9999px' }}>
        <input type="text" name="nl_website" tabIndex={-1} autoComplete="off" />
      </div>
      <button
        type="submit"
        disabled={nlSubmitting}
        className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        Subscribe
      </button>
    </form>
  );
};
