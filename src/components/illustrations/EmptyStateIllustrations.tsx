/**
 * Inline SVG illustrations for empty states — lightweight, themed, and personality-driven.
 */

export function EmptyFeedIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="25" width="80" height="16" rx="4" className="fill-muted" />
      <rect x="20" y="47" width="65" height="10" rx="3" className="fill-muted/70" />
      <rect x="20" y="63" width="80" height="16" rx="4" className="fill-muted" />
      <rect x="20" y="85" width="50" height="10" rx="3" className="fill-muted/70" />
      <circle cx="90" cy="30" r="8" className="fill-primary/20" />
      <path d="M87 30l2.5 2.5L94 27" className="stroke-primary" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyJobsIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="30" y="40" width="60" height="45" rx="6" className="fill-muted" />
      <rect x="45" y="30" width="30" height="15" rx="4" className="fill-muted-foreground/20" />
      <rect x="40" y="55" width="40" height="4" rx="2" className="fill-primary/30" />
      <rect x="40" y="65" width="28" height="4" rx="2" className="fill-muted-foreground/20" />
      <rect x="40" y="75" width="35" height="4" rx="2" className="fill-muted-foreground/15" />
      <circle cx="85" cy="35" r="12" className="fill-accent/20" />
      <path d="M81 35h8M85 31v8" className="stroke-accent" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyEventsIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="25" y="35" width="70" height="55" rx="6" className="fill-muted" />
      <rect x="25" y="35" width="70" height="18" rx="6" className="fill-primary/15" />
      <circle cx="40" cy="28" r="3" className="fill-muted-foreground/30" />
      <rect x="39" y="28" width="2" height="12" rx="1" className="fill-muted-foreground/30" />
      <circle cx="80" cy="28" r="3" className="fill-muted-foreground/30" />
      <rect x="79" y="28" width="2" height="12" rx="1" className="fill-muted-foreground/30" />
      <rect x="35" y="60" width="12" height="10" rx="2" className="fill-accent/20" />
      <rect x="54" y="60" width="12" height="10" rx="2" className="fill-primary/20" />
      <rect x="73" y="60" width="12" height="10" rx="2" className="fill-muted-foreground/10" />
      <rect x="35" y="76" width="12" height="10" rx="2" className="fill-muted-foreground/10" />
    </svg>
  );
}

export function EmptyNetworkIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="45" r="14" className="fill-primary/15" />
      <circle cx="60" cy="40" r="6" className="fill-primary/30" />
      <path d="M50 52c0-5.5 4.5-8 10-8s10 2.5 10 8" className="fill-primary/20" />
      <circle cx="30" cy="75" r="10" className="fill-muted" />
      <circle cx="30" cy="72" r="4" className="fill-muted-foreground/20" />
      <circle cx="90" cy="75" r="10" className="fill-muted" />
      <circle cx="90" cy="72" r="4" className="fill-muted-foreground/20" />
      <line x1="45" y1="55" x2="35" y2="68" className="stroke-primary/20" strokeWidth="1.5" strokeDasharray="3 2" />
      <line x1="75" y1="55" x2="85" y2="68" className="stroke-primary/20" strokeWidth="1.5" strokeDasharray="3 2" />
    </svg>
  );
}

export function EmptyNotificationsIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M60 30c-12 0-22 10-22 22v16l-6 8h56l-6-8V52c0-12-10-22-22-22z" className="fill-muted" />
      <circle cx="60" cy="85" r="6" className="fill-muted-foreground/20" />
      <circle cx="78" cy="35" r="8" className="fill-accent/30" />
      <path d="M75 35l2.5 2.5L82 32" className="stroke-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="45" y1="45" x2="55" y2="45" className="stroke-primary/20" strokeWidth="2" strokeLinecap="round" />
      <line x1="45" y1="55" x2="65" y2="55" className="stroke-primary/15" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function EmptyVaultIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="30" y="30" width="60" height="65" rx="6" className="fill-muted" />
      <rect x="40" y="20" width="40" height="15" rx="4" className="fill-accent/15" />
      <circle cx="60" cy="60" r="12" className="fill-accent/20" />
      <rect x="57" y="55" width="6" height="8" rx="2" className="fill-accent/40" />
      <circle cx="60" cy="55" r="3" className="stroke-accent/40" strokeWidth="2" fill="none" />
      <rect x="40" y="82" width="40" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <rect x="45" y="88" width="30" height="3" rx="1.5" className="fill-muted-foreground/10" />
    </svg>
  );
}

export function EmptyDirectoryIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="15" y="40" width="40" height="50" rx="5" className="fill-muted" />
      <rect x="65" y="40" width="40" height="50" rx="5" className="fill-muted" />
      <rect x="20" y="50" width="30" height="4" rx="2" className="fill-primary/20" />
      <rect x="20" y="58" width="20" height="3" rx="1.5" className="fill-muted-foreground/15" />
      <rect x="20" y="65" width="25" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <rect x="70" y="50" width="30" height="4" rx="2" className="fill-accent/20" />
      <rect x="70" y="58" width="20" height="3" rx="1.5" className="fill-muted-foreground/15" />
      <rect x="70" y="65" width="25" height="3" rx="1.5" className="fill-muted-foreground/10" />
      <circle cx="60" cy="30" r="10" className="fill-primary/10" />
      <path d="M56 30l3 3 5-5" className="stroke-primary/40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptySearchIllustration({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="52" cy="52" r="22" className="stroke-muted-foreground/20" strokeWidth="4" fill="none" />
      <line x1="68" y1="68" x2="90" y2="90" className="stroke-muted-foreground/20" strokeWidth="4" strokeLinecap="round" />
      <line x1="42" y1="48" x2="62" y2="48" className="stroke-primary/20" strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="56" x2="55" y2="56" className="stroke-primary/15" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
