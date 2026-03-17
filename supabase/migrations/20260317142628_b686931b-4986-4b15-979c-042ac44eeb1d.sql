
-- Create optimized growth metrics function to replace N+1 query loop
CREATE OR REPLACE FUNCTION public.get_growth_metrics(p_days integer DEFAULT 14)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN (
    SELECT json_agg(row_data ORDER BY d)
    FROM (
      SELECT
        d,
        to_char(d, 'Mon DD') AS date_label,
        COALESCE((SELECT COUNT(*) FROM public.profiles WHERE created_at::date = d), 0) AS users,
        COALESCE((SELECT COUNT(*) FROM public.posts WHERE created_at::date = d), 0) AS posts,
        COALESCE((SELECT COUNT(*) FROM public.messages WHERE created_at::date = d), 0) AS messages,
        COALESCE((SELECT COUNT(*) FROM public.jobs WHERE created_at::date = d), 0) AS jobs
      FROM generate_series(
        CURRENT_DATE - (p_days - 1),
        CURRENT_DATE,
        '1 day'::interval
      ) AS d
    ) row_data
  );
END;
$function$;
