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
                  <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/network" element={<ProtectedRoute><Network /></ProtectedRoute>} />
                  <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><PostAnalytics /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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
