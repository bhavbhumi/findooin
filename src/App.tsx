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
import { useOfflineDetector } from "@/hooks/useOfflineDetector";

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
const Showcase = lazy(() => import("./pages/Directory"));

// Public pages (lazy loaded)
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const CommunityGuidelines = lazy(() => import("./pages/CommunityGuidelines"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Explore = lazy(() => import("./pages/Explore"));
const HelpDesk = lazy(() => import("./pages/Support"));
const SupportCategory = lazy(() => import("./pages/SupportCategory"));
const QuickLinks = lazy(() => import("./pages/QuickLinks"));
const Legal = lazy(() => import("./pages/Legal"));
const SiteMap = lazy(() => import("./pages/SiteMap"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminOverviewPage = lazy(() => import("./pages/admin/AdminOverviewPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminVerificationPage = lazy(() => import("./pages/admin/AdminVerificationPage"));
// AdminModerationPage removed — merged into Feed & Posts
const AdminAuditPage = lazy(() => import("./pages/admin/AdminAuditPage"));
const AdminBlogPage = lazy(() => import("./pages/admin/AdminBlogPage"));
const AdminMonitoringPage = lazy(() => import("./pages/admin/AdminMonitoringPage"));
const AdminBillingPage = lazy(() => import("./pages/admin/AdminBillingPage"));
const AdminNotificationsPage = lazy(() => import("./pages/admin/AdminNotificationsPage"));
const AdminFeaturesPage = lazy(() => import("./pages/admin/AdminFeaturesPage"));
const AdminSupportPage = lazy(() => import("./pages/admin/AdminSupportPage"));
const AdminKBPage = lazy(() => import("./pages/admin/AdminKBPage"));
const AdminInvitationsPage = lazy(() => import("./pages/admin/AdminInvitationsPage"));
const AdminRegistryPage = lazy(() => import("./pages/admin/AdminRegistryPage"));
const AdminSalesPage = lazy(() => import("./pages/admin/AdminSalesPage"));
const AdminCampaignsPage = lazy(() => import("./pages/admin/AdminCampaignsPage"));
const AdminScorecardPage = lazy(() => import("./pages/admin/AdminScorecardPage"));
const AdminModuleAuditPage = lazy(() => import("./pages/admin/AdminModuleAuditPage"));
const AdminSeoPage = lazy(() => import("./pages/admin/AdminSeoPage"));
const AdminEmailPage = lazy(() => import("./pages/admin/AdminEmailPage"));
const AdminPatentPage = lazy(() => import("./pages/admin/AdminPatentPage"));
const AdminJobsPage = lazy(() => import("./pages/admin/AdminJobsPage"));
const AdminEventsPage = lazy(() => import("./pages/admin/AdminEventsPage"));
const AdminListingsPage = lazy(() => import("./pages/admin/AdminListingsPage"));
const AdminFeedPage = lazy(() => import("./pages/admin/AdminFeedPage"));
const AdminGamificationPage = lazy(() => import("./pages/admin/AdminGamificationPage"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage"));
const DigitalCard = lazy(() => import("./pages/DigitalCard"));
const EventCheckin = lazy(() => import("./pages/EventCheckin"));
const Vault = lazy(() => import("./pages/Vault"));
const SharedVaultFile = lazy(() => import("./pages/SharedVaultFile"));
const DeveloperDocs = lazy(() => import("./pages/DeveloperDocs"));
const CostReport = lazy(() => import("./pages/CostReport"));
const ScalingReport = lazy(() => import("./pages/ScalingReport"));
const PitchIndex = lazy(() => import("./pages/PitchIndex"));
const PitchDeck = lazy(() => import("./pages/PitchDeck"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const AccessibilityPage = lazy(() => import("./pages/Accessibility"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const TransparencyPage = lazy(() => import("./pages/Transparency"));
const ProfessionalDirectory = lazy(() => import("./pages/ProfessionalDirectory"));
const ProfessionalProfile = lazy(() => import("./pages/ProfessionalProfile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const ComparePage = lazy(() => import("./pages/Compare"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min — avoid refetching on every mount
      gcTime: 15 * 60 * 1000,         // 15 min garbage collection
      refetchOnWindowFocus: false,    // prevent unnecessary refetches
      retry: 1,                        // single retry on failure
    },
  },
});

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <FindooLoader text="Loading..." />
  </div>
);

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);
  useOfflineDetector();

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
                      <Route path="/support" element={<HelpDesk />} />
                      <Route path="/support/:categorySlug" element={<SupportCategory />} />
                      <Route path="/quick-links" element={<QuickLinks />} />
                      <Route path="/legal" element={<Legal />} />
                      <Route path="/sitemap" element={<SiteMap />} />
                      <Route path="/cookies" element={<CookiePolicy />} />
                      <Route path="/accessibility" element={<AccessibilityPage />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/professionals" element={<ProfessionalDirectory />} />
                      <Route path="/professional/:registrationNumber" element={<ProfessionalProfile />} />
                      <Route path="/transparency" element={<TransparencyPage />} />
                      <Route path="/compare" element={<ComparePage />} />
                      <Route path="/card/:userId" element={<RouteErrorBoundary routeName="Digital Card"><DigitalCard /></RouteErrorBoundary>} />
                      <Route path="/event-checkin/:eventId" element={<RouteErrorBoundary routeName="Event Check-in"><EventCheckin /></RouteErrorBoundary>} />
                      <Route path="/vault/shared/:shareToken" element={<RouteErrorBoundary routeName="Shared File"><SharedVaultFile /></RouteErrorBoundary>} />
                      <Route path="/developer" element={<RouteErrorBoundary routeName="Developer Docs"><DeveloperDocs /></RouteErrorBoundary>} />
                      <Route path="/developer-docs" element={<RouteErrorBoundary routeName="Developer Docs"><DeveloperDocs /></RouteErrorBoundary>} />
                      <Route path="/cost-report" element={<CostReport />} />
                      <Route path="/scaling-report" element={<ScalingReport />} />
                      <Route path="/pitch" element={<PitchIndex />} />
                      <Route path="/pitch/:persona" element={<PitchDeck />} />
                      <Route path="/feed" element={<ProtectedRoute><RouteErrorBoundary routeName="Feed"><Feed /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><RouteErrorBoundary routeName="Profile"><Profile /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/profile/:id" element={<ProtectedRoute><RouteErrorBoundary routeName="Profile"><Profile /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/network" element={<ProtectedRoute><RouteErrorBoundary routeName="Network"><Network /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/discover" element={<ProtectedRoute><RouteErrorBoundary routeName="Discover"><Discover /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/analytics" element={<ProtectedRoute><RouteErrorBoundary routeName="Analytics"><PostAnalytics /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute><RouteErrorBoundary routeName="Notifications"><Notifications /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/messages" element={<ProtectedRoute><RouteErrorBoundary routeName="Messages"><Messages /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/settings" element={<ProtectedRoute><RouteErrorBoundary routeName="Settings"><Settings /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute><RouteErrorBoundary routeName="Admin"><Admin /></RouteErrorBoundary></ProtectedRoute>}>
                        <Route index element={<Suspense fallback={<LazyFallback />}><AdminOverviewPage /></Suspense>} />
                        <Route path="users" element={<Suspense fallback={<LazyFallback />}><AdminUsersPage /></Suspense>} />
                        <Route path="verification" element={<Suspense fallback={<LazyFallback />}><AdminVerificationPage /></Suspense>} />
                        {/* Moderation merged into Feed & Posts tab */}
                        <Route path="audit" element={<Suspense fallback={<LazyFallback />}><AdminAuditPage /></Suspense>} />
                        <Route path="blog" element={<Suspense fallback={<LazyFallback />}><AdminBlogPage /></Suspense>} />
                        <Route path="monitoring" element={<Suspense fallback={<LazyFallback />}><AdminMonitoringPage /></Suspense>} />
                        <Route path="billing" element={<Suspense fallback={<LazyFallback />}><AdminBillingPage /></Suspense>} />
                        <Route path="notifications" element={<Suspense fallback={<LazyFallback />}><AdminNotificationsPage /></Suspense>} />
                        <Route path="features" element={<Suspense fallback={<LazyFallback />}><AdminFeaturesPage /></Suspense>} />
                        <Route path="support" element={<Suspense fallback={<LazyFallback />}><AdminSupportPage /></Suspense>} />
                        <Route path="kb" element={<Suspense fallback={<LazyFallback />}><AdminKBPage /></Suspense>} />
                        <Route path="invitations" element={<Suspense fallback={<LazyFallback />}><AdminInvitationsPage /></Suspense>} />
                        <Route path="registry" element={<Suspense fallback={<LazyFallback />}><AdminRegistryPage /></Suspense>} />
                        <Route path="sales" element={<Suspense fallback={<LazyFallback />}><AdminSalesPage /></Suspense>} />
                        <Route path="campaigns" element={<Suspense fallback={<LazyFallback />}><AdminCampaignsPage /></Suspense>} />
                        <Route path="scorecard" element={<Suspense fallback={<LazyFallback />}><AdminScorecardPage /></Suspense>} />
                        <Route path="module-audit" element={<Suspense fallback={<LazyFallback />}><AdminModuleAuditPage /></Suspense>} />
                        <Route path="seo" element={<Suspense fallback={<LazyFallback />}><AdminSeoPage /></Suspense>} />
                        <Route path="email" element={<Suspense fallback={<LazyFallback />}><AdminEmailPage /></Suspense>} />
                        <Route path="patent" element={<Suspense fallback={<LazyFallback />}><AdminPatentPage /></Suspense>} />
                        <Route path="jobs" element={<Suspense fallback={<LazyFallback />}><AdminJobsPage /></Suspense>} />
                        <Route path="events" element={<Suspense fallback={<LazyFallback />}><AdminEventsPage /></Suspense>} />
                        <Route path="listings" element={<Suspense fallback={<LazyFallback />}><AdminListingsPage /></Suspense>} />
                        <Route path="feed" element={<Suspense fallback={<LazyFallback />}><AdminFeedPage /></Suspense>} />
                        <Route path="gamification" element={<Suspense fallback={<LazyFallback />}><AdminGamificationPage /></Suspense>} />
                        <Route path="messages" element={<Suspense fallback={<LazyFallback />}><AdminMessagesPage /></Suspense>} />
                        <Route path="cost-report" element={<Suspense fallback={<LazyFallback />}><CostReport /></Suspense>} />
                        <Route path="scaling-report" element={<Suspense fallback={<LazyFallback />}><ScalingReport /></Suspense>} />
                      </Route>
                      <Route path="/jobs" element={<ProtectedRoute><RouteErrorBoundary routeName="Jobs"><Jobs /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/events" element={<ProtectedRoute><RouteErrorBoundary routeName="Events"><Events /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/showcase" element={<ProtectedRoute><RouteErrorBoundary routeName="Showcase"><Showcase /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/leaderboard" element={<ProtectedRoute><RouteErrorBoundary routeName="Leaderboard"><Leaderboard /></RouteErrorBoundary></ProtectedRoute>} />
                      <Route path="/bookmarks" element={<ProtectedRoute><RouteErrorBoundary routeName="Bookmarks"><Bookmarks /></RouteErrorBoundary></ProtectedRoute>} />
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
