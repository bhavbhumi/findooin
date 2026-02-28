/**
 * Global error tracker for production monitoring.
 * Captures client-side errors, failed API calls, and rate limit violations.
 * Stores in-memory with a rolling window for admin dashboard consumption.
 */

export type ErrorEntry = {
  id: string;
  timestamp: string;
  category: "client" | "api" | "rate_limit";
  message: string;
  source?: string;
  statusCode?: number;
  url?: string;
  stack?: string;
};

const MAX_ENTRIES = 200;
let errors: ErrorEntry[] = [];
let listeners: Set<() => void> = new Set();

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function addError(entry: Omit<ErrorEntry, "id" | "timestamp">) {
  const full: ErrorEntry = {
    ...entry,
    id: uid(),
    timestamp: new Date().toISOString(),
  };
  errors = [full, ...errors].slice(0, MAX_ENTRIES);
  listeners.forEach((fn) => fn());
}

export const errorTracker = {
  /** Get all captured errors */
  getErrors: () => errors,

  /** Get errors by category */
  getByCategory: (cat: ErrorEntry["category"]) =>
    errors.filter((e) => e.category === cat),

  /** Get error counts by category */
  getCounts: () => ({
    client: errors.filter((e) => e.category === "client").length,
    api: errors.filter((e) => e.category === "api").length,
    rate_limit: errors.filter((e) => e.category === "rate_limit").length,
    total: errors.length,
  }),

  /** Track a client-side error */
  trackClientError: (message: string, source?: string, stack?: string) => {
    addError({ category: "client", message, source, stack });
  },

  /** Track a failed API call */
  trackApiError: (url: string, statusCode: number, message: string) => {
    addError({ category: "api", message, url, statusCode, source: url });
  },

  /** Track a rate limit violation */
  trackRateLimitHit: (action: string, message: string) => {
    addError({ category: "rate_limit", message, source: action });
  },

  /** Subscribe to error updates */
  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  /** Clear all errors */
  clear: () => {
    errors = [];
    listeners.forEach((fn) => fn());
  },
};

// === Global error listeners ===

// Unhandled JS errors
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    errorTracker.trackClientError(
      event.message || "Unknown error",
      event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
      event.error?.stack
    );
  });

  // Unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const msg =
      event.reason?.message ||
      (typeof event.reason === "string" ? event.reason : "Unhandled promise rejection");
    errorTracker.trackClientError(msg, "Promise", event.reason?.stack);
  });

  // Intercept fetch to catch API errors
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      const url = typeof args[0] === "string" ? args[0] : args[0] instanceof Request ? args[0].url : "";

      // Track 4xx/5xx responses (skip expected auth redirects)
      if (!response.ok && response.status >= 400) {
        const isRateLimit = response.status === 429;
        if (isRateLimit) {
          errorTracker.trackRateLimitHit(url, `Rate limited: ${response.status} on ${url}`);
        } else {
          errorTracker.trackApiError(url, response.status, `${response.status} ${response.statusText}`);
        }
      }

      return response;
    } catch (err: any) {
      const url = typeof args[0] === "string" ? args[0] : args[0] instanceof Request ? args[0].url : "unknown";
      errorTracker.trackApiError(url, 0, err.message || "Network error");
      throw err;
    }
  };
}
