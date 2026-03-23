/**
 * AppLayout — Shared layout wrapper for all authenticated pages.
 *
 * Provides:
 * - Consistent navbar rendering (opt-out via `showNavbar={false}`)
 * - Container with configurable max-width (default: max-w-4xl)
 * - Full-bleed mode for edge-to-edge layouts (e.g., Messages)
 * - Session heartbeat every 5 minutes to keep active_sessions fresh
 * - ErrorBoundary around page content for graceful error handling
 */
import { type ReactNode, useEffect } from "react";
import { touchSession } from "@/lib/session-manager";
import AppNavbar from "@/components/AppNavbar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AppBreadcrumbs } from "@/components/AppBreadcrumbs";
import { useLoginStreak } from "@/hooks/useGamification";
import { LevelUpModal } from "@/components/gamification/LevelUpModal";
import { SocialProofToasts } from "@/components/gamification/SocialProofToasts";
import { SpaceDust, DistantStars, Asteroids } from "@/components/decorative/SpaceElements";
import { MobileInstallBanner } from "@/components/MobileInstallBanner";

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
  /** Hide breadcrumbs (default false) */
  hideBreadcrumbs?: boolean;
}

export default function AppLayout({
  children,
  showNavbar = true,
  maxWidth = "max-w-4xl",
  className = "",
  fullBleed = false,
  hideBreadcrumbs = false,
}: AppLayoutProps) {
  // Keep session heartbeat alive every 5 minutes
  useEffect(() => {
    touchSession();
    const interval = setInterval(touchSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Update login streak
  useLoginStreak();

  return (
    <div className="relative min-h-screen bg-background space-nebula-teal pb-16 md:pb-0">
      <SpaceDust count={15} />
      <DistantStars count={8} />
      <Asteroids count={2} />
      {showNavbar && <AppNavbar />}
      <ErrorBoundary fallbackTitle="This section encountered an error">
        {fullBleed ? (
          <div className={className}>{children}</div>
        ) : (
          <div className={`py-4 px-2 md:container md:py-6 ${maxWidth} mx-auto ${className}`}>
            {!hideBreadcrumbs && <AppBreadcrumbs />}
            {children}
          </div>
        )}
      </ErrorBoundary>
      <ScrollToTop />
      <LevelUpModal />
      <SocialProofToasts />
      <MobileInstallBanner />
    </div>
  );
}
