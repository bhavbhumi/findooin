/**
 * useTrustCircleIQ — Hook for the TrustCircle IQ™ discovery engine.
 * Calls the edge function and returns scored, circle-grouped results.
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
  potential: TrustCircleResult[];
  ecosystem: TrustCircleResult[];
  total: number;
  cached: boolean;
}

export function useTrustCircleIQ(userId: string | null, enabled = true) {
  return useQuery<TrustCircleData>({
    queryKey: ["trustcircle-iq", userId],
    enabled: !!userId && enabled,
    staleTime: 30 * 60 * 1000, // 30 min client-side cache
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
 * Call this from listing views, searches, event registrations, etc.
 */
export async function trackIntentSignal(
  signalType: string,
  signalData?: Record<string, unknown>
) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  await supabase.from("intent_signals").insert({
    user_id: session.user.id,
    signal_type: signalType,
    signal_data: signalData || {},
  });
}
