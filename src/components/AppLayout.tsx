import { type ReactNode } from "react";
import AppNavbar from "@/components/AppNavbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AppLayoutProps {
  children: ReactNode;
  /** Show navbar (default true) */
  showNavbar?: boolean;
  /** Max width class for container (default "max-w-4xl") */
  maxWidth?: string;
  /** Extra container className */
  className?: string;
  /** Full-bleed layout without container (e.g., Messages) */
  fullBleed?: boolean;
}

export default function AppLayout({
  children,
  showNavbar = true,
  maxWidth = "max-w-4xl",
  className = "",
  fullBleed = false,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {showNavbar && <AppNavbar />}
      <ErrorBoundary fallbackTitle="This section encountered an error">
        {fullBleed ? (
          <div className={className}>{children}</div>
        ) : (
          <div className={`container py-6 ${maxWidth} mx-auto ${className}`}>
            {children}
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
