/**
 * MobileInstallBanner — Smart banner shown on mobile browsers
 * prompting users to install findoo as a PWA.
 *
 * - Detects iOS vs Android and shows platform-specific copy
 * - Dismissible with 7-day snooze stored in localStorage
 * - Hidden if already running as standalone PWA
 * - Links to /install page for step-by-step instructions
 */
import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const DISMISS_KEY = "findoo_install_banner_dismissed";
const SNOOZE_DAYS = 7;

type Platform = "ios" | "android" | null;

function detectMobilePlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return null;
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (Date.now() < until) return true;
    localStorage.removeItem(DISMISS_KEY);
    return false;
  } catch {
    return false;
  }
}

function dismiss() {
  try {
    localStorage.setItem(
      DISMISS_KEY,
      String(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000)
    );
  } catch {
    // storage unavailable
  }
}

export function MobileInstallBanner() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);

  useEffect(() => {
    const p = detectMobilePlatform();
    if (!p || isStandalone() || isDismissed()) return;
    setPlatform(p);
    // Small delay so it doesn't flash immediately on load
    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isMobile || !visible || !platform) return null;

  const handleInstall = () => {
    dismiss();
    setVisible(false);
    navigate("/install");
  };

  const handleDismiss = () => {
    dismiss();
    setVisible(false);
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 px-3 pb-2 animate-in slide-in-from-bottom-4 duration-300 md:hidden">
      <div className="relative flex items-center gap-3 rounded-xl border border-border bg-card/95 backdrop-blur-md p-3 shadow-lg">
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss install banner"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {platform === "ios" ? (
            <Share className="h-5 w-5" />
          ) : (
            <Download className="h-5 w-5" />
          )}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-semibold text-foreground leading-tight">
            Install findoo
          </p>
          <p className="text-xs text-muted-foreground leading-snug mt-0.5">
            {platform === "ios"
              ? "Add to Home Screen for the full app experience"
              : "Install for instant access & offline support"}
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={handleInstall}
          className="flex-shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {platform === "ios" ? "How to" : "Install"}
        </button>
      </div>
    </div>
  );
}
