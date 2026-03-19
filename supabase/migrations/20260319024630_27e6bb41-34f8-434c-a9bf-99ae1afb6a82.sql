-- Add posted_as_role column to posts table
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS posted_as_role text;

-- Backfill existing posts: use the first role from user_roles for each author
UPDATE public.posts p
SET posted_as_role = (
  SELECT ur.role::text FROM public.user_roles ur WHERE ur.user_id = p.author_id LIMIT 1
)
WHERE p.posted_as_role IS NULL;

-- Update the get_feed_posts function to include posted_as_role
CREATE OR REPLACE FUNCTION public.get_feed_posts(p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT json_agg(row_data)
    FROM (
      SELECT json_build_object(
        'id', p.id,
        'content', p.content,
        'post_type', p.post_type,
        'post_kind', p.post_kind,
        'query_category', p.query_category,
        'hashtags', p.hashtags,
        'attachment_url', p.attachment_url,
        'attachment_name', p.attachment_name,
        'attachment_type', p.attachment_type,
        'created_at', p.created_at,
        'posted_as_role', p.posted_as_role,
        'author', json_build_object(
          'id', pr.id,
          'full_name', COALESCE(pr.full_name, 'Unknown'),
          'display_name', pr.display_name,
          'avatar_url', pr.avatar_url,
          'verification_status', COALESCE(pr.verification_status, 'unverified')
        ),
        'roles', COALESCE(
          (SELECT json_agg(json_build_object('role', ur.role, 'sub_type', ur.sub_type))
           FROM public.user_roles ur WHERE ur.user_id = p.author_id),
          '[]'::json
        ),
        'like_count', (SELECT COUNT(*) FROM public.post_interactions pi WHERE pi.post_id = p.id AND pi.interaction_type = 'like'),
        'comment_count', (SELECT COUNT(*) FROM public.comments c WHERE c.post_id = p.id),
        'bookmark_count', (SELECT COUNT(*) FROM public.post_interactions pi WHERE pi.post_id = p.id AND pi.interaction_type = 'bookmark')
      ) AS row_data
      FROM public.posts p
      LEFT JOIN public.profiles pr ON pr.id = p.author_id
      WHERE p.scheduled_at IS NULL
      ORDER BY p.created_at DESC
      LIMIT p_limit OFFSET p_offset
    ) sub
  );
END;
$function$;