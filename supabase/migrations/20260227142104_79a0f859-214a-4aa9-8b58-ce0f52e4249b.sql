
-- Fix search_path on date_of function
CREATE OR REPLACE FUNCTION public.date_of(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
SET search_path TO 'public'
AS $$ SELECT ts::date $$;
