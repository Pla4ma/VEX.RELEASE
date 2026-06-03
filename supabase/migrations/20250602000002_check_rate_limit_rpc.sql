-- Migration: Create check_rate_limit RPC for edge function rate limiting.
-- Used by supabase/functions/_shared/rate-limit.ts

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id text,
  p_operation text,
  p_max_requests integer DEFAULT 20,
  p_window_seconds integer DEFAULT 60
)
RETURNS TABLE(allowed boolean, remaining integer, reset_at bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  window_start bigint;
  current_count integer;
  current_time bigint;
BEGIN
  current_time := floor(extract(epoch FROM now()) * 1000)::bigint;
  window_start := current_time - (p_window_seconds * 1000);

  -- Count requests in the current window
  SELECT count(*) INTO current_count
  FROM public.rate_limits
  WHERE user_id = p_user_id
    AND operation = p_operation
    AND created_at_ms >= window_start;

  IF current_count >= p_max_requests THEN
    -- Rate limited — find when the oldest request expires
    RETURN QUERY
    SELECT
      false AS allowed,
      0 AS remaining,
      (SELECT min(created_at_ms) + (p_window_seconds * 1000)
       FROM public.rate_limits
       WHERE user_id = p_user_id
         AND operation = p_operation
         AND created_at_ms >= window_start)::bigint AS reset_at;
  ELSE
    -- Insert rate limit record
    INSERT INTO public.rate_limits (user_id, operation, created_at_ms)
    VALUES (p_user_id, p_operation, current_time);

    RETURN QUERY
    SELECT
      true AS allowed,
      (p_max_requests - current_count - 1)::integer AS remaining,
      (current_time + (p_window_seconds * 1000))::bigint AS reset_at;
  END IF;
END;
$$;
