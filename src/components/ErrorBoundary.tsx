import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
          <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <h2 className="text-lg font-heading font-semibold text-foreground mb-2">
            {this.props.fallbackTitle || "Something went wrong"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            An unexpected error occurred. Please try again or refresh the page.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={this.handleReset}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Try Again
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 text-xs text-destructive/70 max-w-lg overflow-auto text-left bg-destructive/5 p-3 rounded-lg">
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
