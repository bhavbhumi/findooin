import { useState, useEffect, useCallback, useRef } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { registerSession } from "@/lib/session-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import findooLogo from "@/assets/findoo-logo-icon.png";
import findooLogoWhite from "@/assets/findoo-logo-white.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 60_000; // 1 minute
const REQUEST_TIMEOUT_MS = 10_000;

const Auth = () => {
  usePageMeta({ title: "Sign In", description: "Sign in or create your FindOO account.", path: "/auth" });
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const handledSessionRef = useRef<string | null>(null);

  // Login attempt tracking
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setLockCountdown(remaining);
      if (remaining <= 0) {
        setLockedUntil(null);
        setLoginAttempts(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const isLockedOut = lockedUntil !== null && Date.now() < lockedUntil;

  const referrerId = searchParams.get("ref");
  const redirectPath = searchParams.get("redirect");

  const createReferralConnections = async (newUserId: string, refId: string) => {
    try {
      // Auto-follow: new user follows the invitor
      await supabase.from("connections").insert({
        from_user_id: newUserId,
        to_user_id: refId,
        connection_type: "follow",
        status: "accepted",
      });
      // Pending connection request: new user → invitor
      await supabase.from("connections").insert({
        from_user_id: newUserId,
        to_user_id: refId,
        connection_type: "connect",
        status: "pending",
      });
    } catch (err) {
      console.warn("Referral connection creation failed:", err);
    }
  };

  const handleSignedInSession = useCallback(
    async (session: any) => {
      if (!session) return;

      const sessionKey = `${session.user.id}:${session.expires_at ?? "na"}`;
      if (handledSessionRef.current === sessionKey) return;
      handledSessionRef.current = sessionKey;

      // Non-critical writes should never block navigation
      Promise.resolve().then(async () => {
        try {
          await registerSession(session.user.id);
        } catch (err) {
          console.warn("Session registration skipped:", err);
        }

        if (referrerId && referrerId !== session.user.id) {
          await createReferralConnections(session.user.id, referrerId);

          try {
            await supabase.from("card_exchanges").insert({
              card_owner_id: referrerId,
              viewer_id: session.user.id,
              context: "referral",
              action: "signup",
            } as any);
          } catch (err) {
            console.warn("Referral attribution log failed:", err);
          }
        }
      });

      try {
        const profilePromise = supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .maybeSingle();

        const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: new Error("Profile check timeout") }), 4000),
        );

        const { data: profile, error } = (await Promise.race([profilePromise, timeoutPromise])) as {
          data: { onboarding_completed?: boolean } | null;
          error: Error | null;
        };

        if (error) {
          console.warn("Profile fetch delayed/failed, defaulting to onboarding:", error.message);
          navigate("/onboarding");
          return;
        }

        navigate(profile?.onboarding_completed ? redirectPath || "/feed" : "/onboarding");
      } catch (err) {
        console.error("Session check failed:", err);
        navigate("/onboarding");
      }
    },
    [navigate, referrerId, redirectPath],
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        handleSignedInSession(session);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSignedInSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSignedInSession]);

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> => {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), timeoutMs),
      ),
    ]);
  };

  const submitWithRetry = async <T,>(
    action: () => Promise<{ error: { message?: string } | null; data?: T }>,
    maxAttempts = 1,
  ) => {
    let lastError: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await withTimeout(action());
      if (!result.error) return result;
      lastError = result.error;
      const isRetryableNetworkError =
        /load failed|failed to fetch|network|timed out/i.test(result.error.message ?? "") && attempt < maxAttempts;
      if (!isRetryableNetworkError) break;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }
    throw lastError ?? new Error("Unable to complete request");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check lockout
    if (isLockedOut) {
      toast({
        title: "Too many attempts",
        description: `Please wait ${lockCountdown} seconds before trying again.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        await submitWithRetry(() =>
          supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: { full_name: fullName.trim() },
              emailRedirectTo: window.location.origin,
            },
          }),
        );
        toast({
          title: "Check your email",
          description: "We sent you a verification link. Please confirm your email to continue.",
        });
      } else {
        const result = await submitWithRetry(() =>
          supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          }),
        );

        // Handle success immediately (mobile resilience) instead of relying only on auth event listeners
        const signedInSession = result?.data?.session;
        if (signedInSession) {
          await handleSignedInSession(signedInSession);
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (session) await handleSignedInSession(session);
        }

        // Reset attempts on success
        setLoginAttempts(0);
      }
    } catch (error: any) {
      const isNetworkError = /load failed|failed to fetch|network|timed out/i.test(error?.message ?? "");

      if (isNetworkError && !isSignUp) {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            await handleSignedInSession(session);
            setLoginAttempts(0);
            return;
          }
        } catch {
          // continue to user-facing error toast below
        }
      }

      if (!isSignUp && !isNetworkError) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
        }
      }

      toast({
        title: isNetworkError ? "Connection issue" : "Error",
        description: isNetworkError
          ? "We couldn't reach the authentication service. Please refresh and try again."
          : !isSignUp && loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS
            ? `Account locked for 60 seconds after ${MAX_LOGIN_ATTEMPTS} failed attempts.`
            : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast({
        title: "Reset link sent",
        description: "Check your email for a password reset link.",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleMagicLinkSignIn = async () => {
    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Enter your email first, then tap Magic Link.",
        variant: "destructive",
      });
      return;
    }

    setMagicLinkLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      toast({
        title: "Magic link sent",
        description: "Check your email and open the secure sign-in link on this mobile device.",
      });
    } catch (error: any) {
      toast({
        title: "Couldn't send magic link",
        description: error?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setMagicLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — branding panel with rich gradient */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a3a 0%, #000080 40%, #1a1a8c 70%, #4b2d8c 100%)' }}>
        {/* Decorative blurred circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" style={{ background: 'rgba(100, 50, 200, 0.25)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" style={{ background: 'rgba(212, 175, 55, 0.12)' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" style={{ background: 'rgba(50, 50, 200, 0.2)' }} />

        <Link to="/" className="flex items-center gap-3 relative z-10">
          <img src={findooLogo} alt="FindOO" className="h-12 w-auto" style={{ filter: 'brightness(0) invert(1)' }} />
          <span className="text-2xl font-bold font-heading text-white tracking-tight">FindOO</span>
        </Link>

        <div className="relative z-10 space-y-4">
          <h2 className="text-4xl font-bold font-heading text-white leading-tight">
            Financially Social
          </h2>
          <p className="text-xl text-white/80 font-medium">
            Connect. Share. Discover. Prosper — together.
          </p>
          <p className="text-white/60 text-base max-w-md leading-relaxed">
            Build trusted relationships with verified professionals across India's financial ecosystem — and turn insights into opportunities.
          </p>
        </div>

        <div className="flex items-center gap-2 text-white/50 text-sm relative z-10">
          <Shield className="h-4 w-4" />
          Trusted. Verified. Regulator Ready.
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 lg:hidden">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isSignUp
                ? "Join India's regulated financial network"
                : "Sign in to continue to FindOO"
              }
            </p>
          </div>

          {/* Lockout warning */}
          {isLockedOut && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 mb-4">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs text-destructive">
                Too many failed attempts. Try again in <span className="font-bold">{lockCountdown}s</span>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => { setForgotEmail(email); setShowForgotPassword(true); }}
                    className="text-xs text-accent hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {/* Attempt counter */}
            {!isSignUp && loginAttempts > 0 && !isLockedOut && (
              <p className="text-xs text-muted-foreground">
                {MAX_LOGIN_ATTEMPTS - loginAttempts} attempt{MAX_LOGIN_ATTEMPTS - loginAttempts !== 1 ? "s" : ""} remaining
              </p>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading || isLockedOut}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>

            {!isSignUp && (
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={handleMagicLinkSignIn}
                disabled={magicLinkLoading || loading}
              >
                {magicLinkLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in with Magic Link
              </Button>
            )}
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setIsSignUp(!isSignUp); setLoginAttempts(0); setLockedUntil(null); }}
              className="text-foreground font-medium underline underline-offset-4 hover:text-accent"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgotEmail">Email</Label>
              <Input
                id="forgotEmail"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={forgotLoading}>
              {forgotLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
