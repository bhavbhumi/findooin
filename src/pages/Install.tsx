import { useState, useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { motion } from "framer-motion";
import { Download, Share, MoreVertical, Plus, Smartphone, Monitor, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import findooLogo from "@/assets/findoo-logo-full.png";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  usePageMeta({ title: "Install findoo", description: "Install findoo as a Progressive Web App on your device.", path: "/install" });
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else if (/android/.test(ua)) setPlatform("android");
    else setPlatform("desktop");

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  const steps = {
    ios: [
      { icon: <Share className="h-5 w-5" />, title: "Tap the Share button", desc: "Open Safari and tap the share icon at the bottom of the screen" },
      { icon: <Plus className="h-5 w-5" />, title: "Add to Home Screen", desc: "Scroll down and tap \"Add to Home Screen\"" },
      { icon: <CheckCircle2 className="h-5 w-5" />, title: "Confirm", desc: "Tap \"Add\" in the top right — findoo will appear on your home screen" },
    ],
    android: [
      { icon: <MoreVertical className="h-5 w-5" />, title: "Open browser menu", desc: "Tap the three-dot menu in Chrome (top right)" },
      { icon: <Download className="h-5 w-5" />, title: "Install app", desc: "Tap \"Install app\" or \"Add to Home screen\"" },
      { icon: <CheckCircle2 className="h-5 w-5" />, title: "Confirm", desc: "Tap \"Install\" — findoo is now on your home screen" },
    ],
    desktop: [
      { icon: <Monitor className="h-5 w-5" />, title: "Look for the install icon", desc: "In Chrome, click the install icon (⊕) in the address bar" },
      { icon: <Download className="h-5 w-5" />, title: "Click Install", desc: "Confirm the installation when prompted" },
      { icon: <CheckCircle2 className="h-5 w-5" />, title: "Done!", desc: "findoo opens as a standalone desktop app" },
    ],
  };

  const platformLabel = { ios: "iPhone / iPad", android: "Android", desktop: "Desktop" };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Install findoo</h1>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <img src={findooLogo} alt="findoo" className="h-12 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm leading-relaxed">
            Install findoo on your device for instant access — no app store needed. 
            Works offline, loads fast, feels native.
          </p>
        </motion.div>

        {/* Install button (Android / Desktop with prompt) */}
        {deferredPrompt && !isInstalled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <Button onClick={handleInstall} className="w-full gap-2 h-12 text-base font-semibold">
              <Download className="h-5 w-5" />
              Install findoo Now
            </Button>
          </motion.div>
        )}

        {/* Already installed */}
        {isInstalled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 rounded-xl bg-accent/10 border border-accent/20 text-center"
          >
            <CheckCircle2 className="h-8 w-8 text-accent mx-auto mb-2" />
            <p className="font-semibold text-foreground">findoo is installed!</p>
            <p className="text-sm text-muted-foreground">You can open it from your home screen.</p>
          </motion.div>
        )}

        {/* Platform tabs */}
        <div className="flex gap-2 mb-6">
          {(["ios", "android", "desktop"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                platform === p
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {p === "ios" ? "iOS" : p === "android" ? "Android" : "Desktop"}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Steps for {platformLabel[platform]}
          </h2>
          {steps[platform].map((step, i) => (
            <motion.div
              key={`${platform}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-primary">{step.icon}</span>
                      <h3 className="font-semibold text-foreground text-sm">{step.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm">{step.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Note for iOS */}
        {platform === "ios" && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-xs text-muted-foreground text-center leading-relaxed"
          >
            <Smartphone className="h-4 w-4 inline mr-1 -mt-0.5" />
            Safari is required on iOS. Other browsers don't support "Add to Home Screen."
          </motion.p>
        )}

        {/* Benefits */}
        <div className="mt-10 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Why install?
          </h2>
          {[
            { emoji: "⚡", text: "Instant access from your home screen" },
            { emoji: "📶", text: "Works offline & loads faster" },
            { emoji: "🔔", text: "Full-screen experience, no browser bars" },
            { emoji: "🔒", text: "Same security as the web version" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 text-sm text-foreground">
              <span className="text-lg">{b.emoji}</span>
              {b.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Install;
