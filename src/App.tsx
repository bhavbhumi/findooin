import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense, useState, useCallback } from "react";
import { FindooLoader } from "@/components/FindooLoader";
import { SplashScreen } from "@/components/SplashScreen";
import { CommandPalette } from "@/components/CommandPalette";
import { SkipNav } from "@/components/SkipNav";

// Eager load critical routes
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";

// Lazy load protected routes
const Feed = lazy(() => import("./pages/Feed"));
const Profile = lazy(() => import("./pages/Profile"));
const Network = lazy(() => import("./pages/Network"));
const Discover = lazy(() => import("./pages/Discover"));
const PostAnalytics = lazy(() => import("./pages/PostAnalytics"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Messages = lazy(() => import("./pages/Messages"));
const Settings = lazy(() => import("./pages/Settings"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Events = lazy(() => import("./pages/Events"));
const Directory = lazy(() => import("./pages/Directory"));

// Public pages
import Blog from "./pages/Blog";
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const CommunityGuidelines = lazy(() => import("./pages/CommunityGuidelines"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Explore = lazy(() => import("./pages/Explore"));
const HelpDesk = lazy(() => import("./pages/HelpDesk"));
const QuickLinks = lazy(() => import("./pages/QuickLinks"));
const Legal = lazy(() => import("./pages/Legal"));
const SiteMap = lazy(() => import("./pages/SiteMap"));
const Admin = lazy(() => import("./pages/Admin"));
const DigitalCard = lazy(() => import("./pages/DigitalCard"));
const EventCheckin = lazy(() => import("./pages/EventCheckin"));
const Vault = lazy(() => import("./pages/Vault"));
const SharedVaultFile = lazy(() => import("./pages/SharedVaultFile"));
const DeveloperDocs = lazy(() => import("./pages/DeveloperDocs"));
const CostReport = lazy(() => import("./pages/CostReport"));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <FindooLoader text="Loading..." />
  </div>
);

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <RoleProvider>
            <ErrorBoundary fallbackTitle="FindOO encountered an error">
              {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <SkipNav />
                <CommandPalette />
                <Suspense fallback={<LazyFallback />}>
                  <div id="main-content">
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/reset-password" element={<ResetPassword />} />
                      <Route path="/install" element={<Install />} />
                      <Route path="/onboarding" element={<Onboarding />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<RouteErrorBoundary routeName="Blog Post"><BlogPost /></RouteErrorBoundary>} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/helpdesk" element={<HelpDesk />} />
                      <Route path="/quick-links" element={<QuickLinks />} />
                      <Route path="/legal" element={<Legal />} />
                      <Route path="/sitemap" element={<SiteMap />} />
                      <Route path="/card/:userId" element={<RouteErrorBoundary routeName="Digital Card"><DigitalCard /></RouteErrorBoundary>} />
                      <Route path="/event-checkin/:eventId" element={<RouteErrorBoundary routeName="Event Check-in"><EventCheckin /></RouteErrorBoundary>} />
                      <Route path="/vault/shared/:shareToken" element={<RouteErrorBoundary routeName="Shared File"><SharedVaultFile /></RouteErrorBoundary>} />
                      <Route path="/developer" element={<RouteErrorBoundary routeName="Developer Docs"><DeveloperDocs /></RouteErrorBoundary>} />
                      <Route path="/cost-report" element={<CostReport />} />
                      <Route path="/feed" element={<ProtectedRoute><RouteErrorBoundary routeName="Feed"><Feed /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><RouteErrorBoundary routeName="Profile"><Profile /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/profile/:id" element={<ProtectedRoute><RouteErrorBoundary routeName="Profile"><Profile /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/network" element={<ProtectedRoute><RouteErrorBoundary routeName="Network"><Network /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/discover" element={<ProtectedRoute><RouteErrorBoundary routeName="Discover"><Discover /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/analytics" element={<ProtectedRoute><RouteErrorBoundary routeName="Analytics"><PostAnalytics /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute><RouteErrorBoundary routeName="Notifications"><Notifications /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/messages" element={<ProtectedRoute><RouteErrorBoundary routeName="Messages"><Messages /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><RouteErrorBoundary routeName="Settings"><Settings /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute><RouteErrorBoundary routeName="Admin"><Admin /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/jobs" element={<ProtectedRoute><RouteErrorBoundary routeName="Jobs"><Jobs /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/events" element={<ProtectedRoute><RouteErrorBoundary routeName="Events"><Events /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/directory" element={<ProtectedRoute><RouteErrorBoundary routeName="Directory"><Directory /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/vault" element={<ProtectedRoute><RouteErrorBoundary routeName="Vault"><Vault /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </Suspense>
              </BrowserRouter>
            </ErrorBoundary>
          </RoleProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
