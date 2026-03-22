import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";

export type TabVisibility = "everyone" | "logged_in" | "connections" | "only_me";

export interface TabPrivacySettings {
  activity_visibility: TabVisibility;
  network_visibility: TabVisibility;
  vault_visibility: TabVisibility;
}

const defaults: TabPrivacySettings = {
  activity_visibility: "everyone",
  network_visibility: "everyone",
  vault_visibility: "only_me",
};

export function useTabPrivacy(userId: string | null) {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["tab-privacy", userId],
    enabled: !!userId,
    queryFn: async (): Promise<TabPrivacySettings> => {
      if (!userId) return defaults;
      const { data } = await supabase
        .from("profile_tab_privacy" as any)
        .select("activity_visibility, network_visibility, vault_visibility")
        .eq("user_id", userId)
        .maybeSingle();
      if (!data) return defaults;
      return {
        activity_visibility: (data as any).activity_visibility || "everyone",
        network_visibility: (data as any).network_visibility || "everyone",
        vault_visibility: (data as any).vault_visibility || "only_me",
      };
    },
    staleTime: 60_000,
  });

  const mutation = useMutation({
    mutationFn: async (newSettings: TabPrivacySettings) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profile_tab_privacy" as any)
        .upsert({
          user_id: session.user.id,
          ...newSettings,
          updated_at: new Date().toISOString(),
        } as any, { onConflict: "user_id" } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tab-privacy"] });
    },
  });

  return {
    settings: settings || defaults,
    isLoading,
    updateSettings: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
}

/**
 * Check if a viewer can see a tab based on privacy settings and relationship.
 */
export function canViewTab(
  visibility: TabVisibility,
  isOwnProfile: boolean,
  isLoggedIn: boolean,
  isConnection: boolean
): boolean {
  if (isOwnProfile) return true;
  switch (visibility) {
    case "everyone":
      return true;
    case "logged_in":
      return isLoggedIn;
    case "connections":
      return isConnection;
    case "only_me":
      return false;
    default:
      return true;
  }
}

export const visibilityLabels: Record<TabVisibility, string> = {
  everyone: "Everyone",
  logged_in: "Logged-in users",
  connections: "Connections only",
  only_me: "Only me",
};
