/**
 * Web Vitals — Performance monitoring for Core Web Vitals (LCP, CLS, FID/INP).
 *
 * Captures metrics via the `web-vitals` library and logs them.
 * In production, these could be sent to an analytics endpoint.
 */
import { onCLS, onLCP, onINP, onFCP, onTTFB, type Metric } from "web-vitals";

type VitalsEntry = {
  name: string;
  value: number;
  rating: string;
  delta: number;
  id: string;
};

const vitalsLog: VitalsEntry[] = [];

function handleMetric(metric: Metric) {
  const entry: VitalsEntry = {
    name: metric.name,
    value: Math.round(metric.value * 100) / 100,
    rating: metric.rating,
    delta: Math.round(metric.delta * 100) / 100,
    id: metric.id,
  };

  vitalsLog.push(entry);

  if (import.meta.env.DEV) {
    const color =
      metric.rating === "good"
        ? "color: #0cce6b"
        : metric.rating === "needs-improvement"
        ? "color: #ffa400"
        : "color: #ff4e42";
    console.log(
      `%c[Web Vitals] ${metric.name}: ${entry.value} (${metric.rating})`,
      color
    );
  }
}

/**
 * Initialize Web Vitals tracking. Call once at app startup.
 */
export function initWebVitals() {
  onCLS(handleMetric);
  onLCP(handleMetric);
  onINP(handleMetric);
  onFCP(handleMetric);
  onTTFB(handleMetric);
}

/**
 * Get all collected vitals (useful for analytics dashboards).
 */
export function getVitalsLog(): ReadonlyArray<VitalsEntry> {
  return vitalsLog;
}
