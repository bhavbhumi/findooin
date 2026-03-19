/**
 * FeatureFlagGate — Renders children only if the specified feature flag is enabled.
 * Shows NotFound (or custom fallback) when the flag is disabled.
 * While flags are loading, shows a loader to avoid flicker.
 */
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { FindooLoader } from "@/components/FindooLoader";
import { ReactNode } from "react";

interface FeatureFlagGateProps {
  flagKey: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureFlagGate({ flagKey, children, fallback }: FeatureFlagGateProps) {
  const { isEnabled, isFetched } = useFeatureFlags();

  if (!isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FindooLoader text="Loading..." />
      </div>
    );
  }

  if (!isEnabled(flagKey)) {
    if (fallback) return <>{fallback}</>;
    // Lazy import NotFound to avoid circular deps
    const NotFound = require("@/pages/NotFound").default;
    return <NotFound />;
  }

  return <>{children}</>;
}
