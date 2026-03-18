/**
 * ProtectedRoute — Auth guard for authenticated pages.
 *
 * Flow:
 * 1. Checks for active Supabase session → redirects to /auth if none
 * 2. Checks `profiles.onboarding_completed` → redirects to /onboarding if false
 * 3. Listens for SIGNED_OUT events to redirect immediately
 *
 * The `requireOnboarding` prop can be set to false for pages that
 * should be accessible before onboarding (e.g., the onboarding page itself).
 */
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FindooLoader } from "@/components/FindooLoader";

interface Props {
  children: ReactNode;
  requireOnboarding?: boolean;
}

export default function ProtectedRoute({ children, requireOnboarding = true }: Props) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

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
        <FindooLoader />
      </div>
    );
  }

  return <>{children}</>;
}
