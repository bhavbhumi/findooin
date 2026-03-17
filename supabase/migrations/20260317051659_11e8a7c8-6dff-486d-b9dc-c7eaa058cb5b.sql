-- Resolve profile flair cosmetics from user level
CREATE OR REPLACE FUNCTION public.resolve_flair_from_level(p_level integer)
RETURNS TABLE(avatar_border text, name_effect text, profile_theme text)
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT
    CASE
      WHEN COALESCE(p_level, 1) >= 5 THEN 'legendary'
      WHEN COALESCE(p_level, 1) >= 4 THEN 'diamond'
      WHEN COALESCE(p_level, 1) >= 3 THEN 'fire'
      ELSE 'none'
    END AS avatar_border,
    CASE
      WHEN COALESCE(p_level, 1) >= 5 THEN 'golden_shimmer'
      WHEN COALESCE(p_level, 1) >= 4 THEN 'glow'
      ELSE 'none'
    END AS name_effect,
    CASE
      WHEN COALESCE(p_level, 1) >= 5 THEN 'legendary'
      WHEN COALESCE(p_level, 1) >= 4 THEN 'thought_leader'
      WHEN COALESCE(p_level, 1) >= 3 THEN 'expert'
      ELSE 'default'
    END AS profile_theme;
$$;

-- Keep profile_flair in sync whenever user_xp changes
CREATE OR REPLACE FUNCTION public.sync_profile_flair_from_user_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avatar_border text;
  v_name_effect text;
  v_profile_theme text;
BEGIN
  SELECT r.avatar_border, r.name_effect, r.profile_theme
  INTO v_avatar_border, v_name_effect, v_profile_theme
  FROM public.resolve_flair_from_level(NEW.level) r;

  INSERT INTO public.profile_flair (user_id, avatar_border, name_effect, profile_theme, updated_at)
  VALUES (NEW.user_id, v_avatar_border, v_name_effect, v_profile_theme, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    avatar_border = EXCLUDED.avatar_border,
    name_effect = EXCLUDED.name_effect,
    profile_theme = EXCLUDED.profile_theme,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profile_flair_from_user_xp ON public.user_xp;
CREATE TRIGGER trg_sync_profile_flair_from_user_xp
AFTER INSERT OR UPDATE OF level ON public.user_xp
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_flair_from_user_xp();

-- Backfill existing users immediately
INSERT INTO public.profile_flair (user_id, avatar_border, name_effect, profile_theme, updated_at)
SELECT
  ux.user_id,
  rf.avatar_border,
  rf.name_effect,
  rf.profile_theme,
  now()
FROM public.user_xp ux
CROSS JOIN LATERAL public.resolve_flair_from_level(ux.level) rf
ON CONFLICT (user_id)
DO UPDATE SET
  avatar_border = EXCLUDED.avatar_border,
  name_effect = EXCLUDED.name_effect,
  profile_theme = EXCLUDED.profile_theme,
  updated_at = now();