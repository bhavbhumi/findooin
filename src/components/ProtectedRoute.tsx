import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/SplashScreen";

interface Props {
  children: ReactNode;
  requireOnboarding?: boolean;
}

// Track if post-login splash has been shown this session
let sessionSplashShown = false;

export default function ProtectedRoute({ children, requireOnboarding = true }: Props) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const handleSplashComplete = useCallback(() => {
    sessionSplashShown = true;
    setShowSplash(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          navigate("/auth", { replace: true });
          return;
        }

        if (requireOnboarding) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .maybeSingle();

          if (error || !profile?.onboarding_completed) {
            navigate("/onboarding", { replace: true });
            return;
          }
        }

        if (!cancelled) {
          if (!sessionSplashShown) {
            setShowSplash(true);
          }
          setReady(true);
        }
      } catch (error) {
        console.error("Protected route session check failed:", error);
        navigate("/auth", { replace: true });
      }
    };

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        sessionSplashShown = false;
        navigate("/auth", { replace: true });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate, requireOnboarding]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SplashScreen onComplete={handleSplashComplete} duration={2000} />
      </div>
    );
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} duration={2000} />;
  }

  return <>{children}</>;
}
