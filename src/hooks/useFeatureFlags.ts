/**
 * useFeatureFlags — Reads enabled feature flags for app-wide consumption.
 * Cached for 2 minutes. Use `isEnabled("flag_key")` for inline checks.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

export type FeatureFlag = {
  id: string;
  flag_key: string;
  label: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_segment: string;
  metadata: any;
};

export function useFeatureFlags() {
  const query = useQuery({
    queryKey: QUERY_KEYS.featureFlags(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("id, flag_key, label, description, is_enabled, rollout_percentage, target_segment, metadata")
        .eq("is_enabled", true);
      if (error) throw error;
      return (data || []) as FeatureFlag[];
    },
    staleTime: 120_000,
  });

  const flags = query.data || [];

  const isEnabled = (key: string): boolean =>
    flags.some((f) => f.flag_key === key && f.is_enabled);

  return { ...query, flags, isEnabled };
}
