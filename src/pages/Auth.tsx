import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import findooLogo from "@/assets/findoo-logo-icon.png";
import findooLogoWhite from "@/assets/findoo-logo-white.png";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async (session: any) => {
      if (!session) return;
      // Check if onboarding is completed
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .maybeSingle();
      
      if (profile?.onboarding_completed) {
        navigate("/feed");
      } else {
        navigate("/onboarding");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        checkSession(session);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) checkSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const submitWithRetry = async <T,>(
    action: () => Promise<{ error: { message?: string } | null; data?: T }>,
    maxAttempts = 3,
  ) => {
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await action();
      if (!result.error) return result;

      lastError = result.error;
      const isRetryableNetworkError =
        /load failed|failed to fetch|network/i.test(result.error.message ?? "") && attempt < maxAttempts;

      if (!isRetryableNetworkError) break;
      await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
    }

    throw lastError ?? new Error("Unable to complete request");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        await submitWithRetry(() =>
          supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          }),
        );
      }
    } catch (error: any) {
      const isNetworkError = /load failed|failed to fetch|network/i.test(error?.message ?? "");
      toast({
        title: isNetworkError ? "Connection issue" : "Error",
        description: isNetworkError
          ? "We couldn't reach the authentication service. Please refresh and try again."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2">
          <img src={findooLogoWhite} alt="FindOO" className="h-8 w-8" />
          <span className="text-xl font-bold font-heading">FindOO</span>
        </Link>
        <div>
          <h2 className="text-3xl font-bold font-heading mb-4">
            India's trust-first
            <br />
            financial network
          </h2>
          <p className="text-primary-foreground/70 text-lg max-w-md">
            Connect with verified Issuers, Intermediaries, and Investors across SEBI, RBI, IRDAI, AMFI & PFRDA regulated markets.
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary-foreground/50 text-sm">
          <Shield className="h-4 w-4" />
          Regulated. Verified. Trusted.
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
              <Label htmlFor="password">Password</Label>
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
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-foreground font-medium underline underline-offset-4 hover:text-accent"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
