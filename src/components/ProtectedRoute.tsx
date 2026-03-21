/**
 * ProtectedRoute — Auth guard for authenticated pages.
 *
 * Includes retry logic for database timeouts (504s) that can occur
 * under load when checking profiles.onboarding_completed.
 */
import { useEffect, useState, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FindooLoader } from "@/components/FindooLoader";

interface Props {
  children: ReactNode;
  requireOnboarding?: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

export default function ProtectedRoute({ children, requireOnboarding = true }: Props) {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const retriesRef = useRef(0);

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

        // Block unconfirmed email users (edge case: magic link or OAuth without email confirm)
        const emailConfirmedAt = session.user.email_confirmed_at;
        if (!emailConfirmedAt) {
          await supabase.auth.signOut();
          navigate("/auth", { replace: true });
          return;
        }

        if (requireOnboarding) {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("onboarding_completed")
            .eq("id", session.user.id)
            .maybeSingle();

          // On DB timeout/error, retry instead of redirecting to onboarding
          if (error) {
            console.warn("Profile check failed, retrying...", error.message);
            if (retriesRef.current < MAX_RETRIES && !cancelled) {
              retriesRef.current++;
              setTimeout(check, RETRY_DELAY_MS);
              return;
            }
            // After max retries, let them through rather than blocking
            console.error("Profile check failed after retries, allowing access");
            if (!cancelled) setReady(true);
            return;
          }

          if (!profile?.onboarding_completed) {
            navigate("/onboarding", { replace: true });
            return;
          }
        }

        if (!cancelled) {
          setReady(true);
        }
      } catch (error) {
        console.error("Protected route session check failed:", error);
        if (retriesRef.current < MAX_RETRIES && !cancelled) {
          retriesRef.current++;
          setTimeout(check, RETRY_DELAY_MS);
          return;
        }
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