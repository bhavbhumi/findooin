/**
 * RouteErrorBoundary — Granular per-route error boundary with contextual
 * fallback UI, retry, and navigation back. Styled with FindOO visual identity.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import findooLogo from "@/assets/findoo-logo-icon.png";

interface Props {
  children: ReactNode;
  routeName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[RouteErrorBoundary:${this.props.routeName ?? "unknown"}]`, error, errorInfo);
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      errorCount: prev.errorCount + 1,
    }));
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = "/feed";
  };

  render() {
    if (this.state.hasError) {
      const tooManyRetries = this.state.errorCount >= 3;

      return (
        <main
          role="alert"
          aria-live="assertive"
          className="relative flex flex-col items-center justify-center min-h-[60vh] p-8 text-center overflow-hidden"
        >
          {/* Ambient decorations */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute top-1/3 left-1/3 h-[300px] w-[300px] rounded-full bg-destructive/[0.05] blur-3xl" />
            <div className="absolute bottom-1/3 right-1/3 h-[200px] w-[200px] rounded-full bg-primary/[0.04] blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <img
              src={findooLogo}
              alt=""
              className="h-8 w-8 mb-5 opacity-40"
              aria-hidden="true"
            />

            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5 ring-4 ring-destructive/[0.06]">
              <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
            </div>

            <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
              {this.props.routeName
                ? `Error loading ${this.props.routeName}`
                : "Something went wrong"}
            </h2>

            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              {tooManyRetries
                ? "This error keeps occurring. Try navigating to a different page or refreshing your browser."
                : "An unexpected error occurred on this page. You can retry or go back."}
            </p>

            <div className="flex flex-wrap gap-3 justify-center">
              {!tooManyRetries && (
                <Button variant="default" size="sm" onClick={this.handleRetry}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Try Again
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={this.handleGoBack}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                Go Back
              </Button>
              <Button variant="outline" size="sm" onClick={this.handleGoHome}>
                <Home className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                Go to Feed
              </Button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-6 text-xs text-destructive/70 max-w-lg overflow-auto text-left bg-destructive/5 p-3 rounded-xl border border-destructive/10">
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
