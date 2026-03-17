export interface ProfileFlairVisual {
  avatar_border: string;
  name_effect: string;
  profile_theme: string;
}

const DEFAULT_FLAIR: ProfileFlairVisual = {
  avatar_border: "none",
  name_effect: "none",
  profile_theme: "default",
};

export function getFlairForLevel(level?: number | null): ProfileFlairVisual {
  const safeLevel = Math.max(0, level ?? 0);

  if (safeLevel >= 5) {
    return {
      avatar_border: "legendary",
      name_effect: "golden_shimmer",
      profile_theme: "legendary",
    };
  }

  if (safeLevel >= 4) {
    return {
      avatar_border: "diamond",
      name_effect: "glow",
      profile_theme: "thought_leader",
    };
  }

  if (safeLevel >= 3) {
    return {
      avatar_border: "fire",
      name_effect: "none",
      profile_theme: "expert",
    };
  }

  return DEFAULT_FLAIR;
}

export function resolveProfileFlair(
  flair?: Partial<ProfileFlairVisual> | null,
  level?: number | null
): ProfileFlairVisual {
  const derived = getFlairForLevel(level);

  if ((level ?? 0) >= 3) {
    return derived;
  }

  return {
    avatar_border: flair?.avatar_border || derived.avatar_border,
    name_effect: flair?.name_effect || derived.name_effect,
    profile_theme: flair?.profile_theme || derived.profile_theme,
  };
}
