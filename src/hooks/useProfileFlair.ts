/**
 * useProfileFlair — Fetch profile flair (avatar border, name effect) for a user.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface ProfileFlairData {
  avatar_border: string;
  name_effect: string;
  profile_theme: string;
}

const DEFAULT_FLAIR: ProfileFlairData = {
  avatar_border: "none",
  name_effect: "none",
  profile_theme: "default",
};

export function useProfileFlair(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.profileFlair(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<ProfileFlairData> => {
      const { data, error } = await supabase
        .from("profile_flair")
        .select("avatar_border, name_effect, profile_theme")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as ProfileFlairData) || DEFAULT_FLAIR;
    },
  });
}
