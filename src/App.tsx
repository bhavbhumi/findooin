import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RoleProvider } from "@/contexts/RoleContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import { FindooLoader } from "@/components/FindooLoader";

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

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <FindooLoader text="Loading..." />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <RoleProvider>
          <ErrorBoundary fallbackTitle="FindOO encountered an error">
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LazyFallback />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/install" element={<Install />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
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
                  <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
                  <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><PostAnalytics /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                  <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </RoleProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
