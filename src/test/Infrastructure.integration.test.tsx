/**
 * Integration tests for RouteErrorBoundary and Web Vitals.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

// Component that throws
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test error in Feed");
  return <div>Feed content loaded</div>;
}

// Suppress console.error for expected errors
const originalError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});
afterEach(() => {
  console.error = originalError;
});

describe("RouteErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <RouteErrorBoundary routeName="Feed">
        <div>Normal content</div>
      </RouteErrorBoundary>
    );
    expect(screen.getByText("Normal content")).toBeInTheDocument();
  });

  it("shows error fallback with route name", () => {
    render(
      <RouteErrorBoundary routeName="Feed">
        <ThrowingComponent shouldThrow={true} />
      </RouteErrorBoundary>
    );
    expect(screen.getByText("Error loading Feed")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows retry, go back, and go home buttons", () => {
    render(
      <RouteErrorBoundary routeName="Jobs">
        <ThrowingComponent shouldThrow={true} />
      </RouteErrorBoundary>
    );
    expect(screen.getByText("Try Again")).toBeInTheDocument();
    expect(screen.getByText("Go Back")).toBeInTheDocument();
    expect(screen.getByText("Go to Feed")).toBeInTheDocument();
  });

  it("recovers on retry when error is resolved", () => {
    let shouldThrow = true;
    function ConditionalThrower() {
      if (shouldThrow) throw new Error("Temporary error");
      return <div>Recovered!</div>;
    }

    render(
      <RouteErrorBoundary routeName="Profile">
        <ConditionalThrower />
      </RouteErrorBoundary>
    );

    expect(screen.getByText("Error loading Profile")).toBeInTheDocument();

    // Fix the error condition
    shouldThrow = false;
    fireEvent.click(screen.getByText("Try Again"));

    expect(screen.getByText("Recovered!")).toBeInTheDocument();
  });

  it("shows different message after too many retries", () => {
    render(
      <RouteErrorBoundary routeName="Settings">
        <ThrowingComponent shouldThrow={true} />
      </RouteErrorBoundary>
    );

    // Retry 3 times (each retry will re-throw)
    for (let i = 0; i < 3; i++) {
      const retryBtn = screen.queryByText("Try Again");
      if (retryBtn) fireEvent.click(retryBtn);
    }

    expect(screen.getByText(/keeps occurring/i)).toBeInTheDocument();
    // Try Again button should be gone after 3 retries
    expect(screen.queryByText("Try Again")).not.toBeInTheDocument();
  });

  it("uses generic message when routeName is not provided", () => {
    render(
      <RouteErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </RouteErrorBoundary>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});

describe("Web Vitals Module", () => {
  it("exports initWebVitals and getVitalsLog", async () => {
    const mod = await import("@/lib/web-vitals");
    expect(mod.initWebVitals).toBeDefined();
    expect(mod.getVitalsLog).toBeDefined();
    expect(typeof mod.initWebVitals).toBe("function");
    expect(typeof mod.getVitalsLog).toBe("function");
  });

  it("getVitalsLog returns an array", async () => {
    const { getVitalsLog } = await import("@/lib/web-vitals");
    const log = getVitalsLog();
    expect(Array.isArray(log)).toBe(true);
  });
});

describe("SkipNav Component", () => {
  it("renders skip navigation link", async () => {
    const { SkipNav } = await import("@/components/SkipNav");
    render(<SkipNav />);
    const link = screen.getByText("Skip to main content");
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("#main-content");
  });
});
