/**
 * useTrustCircleIQ — Hook for the TrustCircle IQ™ discovery engine.
 * Calls the edge function and returns scored, 5-circle-grouped results.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TrustCircleProfile {
  id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  organization: string | null;
  location: string | null;
  verification_status: string;
  specializations: string[] | null;
  certifications: string[] | null;
  user_type: string;
}

export interface TrustCircleResult {
  target_id: string;
  affinity_score: number;
  circle_tier: number;
  role_weight: number;
  intent_multiplier: number;
  trust_proximity: number;
  activity_resonance: number;
  freshness_decay: number;
  referral_boost: number;
  referral_source: string | null;
  profile: TrustCircleProfile;
  roles: { role: string; sub_type: string | null }[];
}

export interface TrustCircleData {
  inner_circle: TrustCircleResult[];
  primary_network: TrustCircleResult[];
  secondary_network: TrustCircleResult[];
  tertiary_network: TrustCircleResult[];
  ecosystem: TrustCircleResult[];
  total: number;
  cached: boolean;
}

/** Circle tier key type */
export type CircleTier = 1 | 2 | 3 | 4 | 5;

/** Circle configuration with network-based naming */
export const CIRCLE_TIERS: Record<CircleTier, { key: keyof Omit<TrustCircleData, 'total' | 'cached'>; label: string; shortLabel: string; description: string }> = {
  1: { key: "inner_circle", label: "Inner Circle", shortLabel: "Inner", description: "Direct trust — your strongest professional relationships" },
  2: { key: "primary_network", label: "Primary Network", shortLabel: "Primary", description: "High-affinity connections ready for business" },
  3: { key: "secondary_network", label: "Secondary Network", shortLabel: "Secondary", description: "Warm prospects and mutual connections" },
  4: { key: "tertiary_network", label: "Tertiary Network", shortLabel: "Tertiary", description: "Shared interests, geography, or certifications" },
  5: { key: "ecosystem", label: "Ecosystem", shortLabel: "Ecosystem", description: "Verified professionals across the platform" },
};

export function useTrustCircleIQ(userId: string | null, enabled = true) {
  return useQuery<TrustCircleData>({
    queryKey: ["trustcircle-iq", userId],
    enabled: !!userId && enabled,
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("trustcircle-iq", {
        method: "GET",
      });

      if (error) throw error;
      return data as TrustCircleData;
    },
  });
}

/**
 * Track an intent signal for the TrustCircle IQ™ engine.
 */
export async function trackIntentSignal(
  signalType: string,
  signalData?: Record<string, unknown>
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  await supabase.from("intent_signals" as any).insert({
    user_id: session.user.id,
    signal_type: signalType,
    signal_data: signalData || {},
  } as any);
}
