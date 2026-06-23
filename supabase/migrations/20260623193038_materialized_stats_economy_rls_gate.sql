-- Materialized stats views
-- ---------------------------------------------------------------------------

CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_progress_stats_mv AS
SELECT
  s.user_id,
  count(*) FILTER (WHERE s.status = 'completed')::INTEGER AS completed_sessions,
  COALESCE(sum(s.effective_duration), 0)::BIGINT AS total_effective_seconds,
  COALESCE(avg(s.quality_score) FILTER (WHERE s.quality_score IS NOT NULL), 0)::NUMERIC(5,2) AS average_quality_score,
  max(s.completed_at) AS last_completed_at,
  now() AS refreshed_at
FROM public.sessions s
GROUP BY s.user_id;

CREATE UNIQUE INDEX IF NOT EXISTS user_progress_stats_mv_user_idx
  ON public.user_progress_stats_mv (user_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_economy_stats_mv AS
SELECT
  w.user_id,
  COALESCE(w.coins, 0)::INTEGER AS coins,
  COALESCE(w.tokens, 0)::INTEGER AS tokens,
  COALESCE(w.total_earned_coins, 0)::INTEGER AS total_earned_coins,
  COALESCE(w.total_earned_tokens, 0)::INTEGER AS total_earned_tokens,
  COALESCE(w.total_spent_coins, 0)::INTEGER AS total_spent_coins,
  COALESCE(w.total_spent_tokens, 0)::INTEGER AS total_spent_tokens,
  now() AS refreshed_at
FROM public.unified_wallets w;

CREATE UNIQUE INDEX IF NOT EXISTS user_economy_stats_mv_user_idx
  ON public.user_economy_stats_mv (user_id);

REVOKE ALL ON TABLE public.user_progress_stats_mv FROM anon;
REVOKE ALL ON TABLE public.user_economy_stats_mv FROM anon;
REVOKE ALL ON TABLE public.user_progress_stats_mv FROM authenticated;
REVOKE ALL ON TABLE public.user_economy_stats_mv FROM authenticated;
GRANT SELECT ON TABLE public.user_progress_stats_mv TO service_role;
GRANT SELECT ON TABLE public.user_economy_stats_mv TO service_role;

CREATE OR REPLACE FUNCTION public.get_my_progress_stats()
RETURNS TABLE (
  user_id UUID,
  completed_sessions INTEGER,
  total_effective_seconds BIGINT,
  average_quality_score NUMERIC(5,2),
  last_completed_at TIMESTAMPTZ,
  refreshed_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    user_progress_stats_mv.user_id,
    user_progress_stats_mv.completed_sessions,
    user_progress_stats_mv.total_effective_seconds,
    user_progress_stats_mv.average_quality_score,
    user_progress_stats_mv.last_completed_at,
    user_progress_stats_mv.refreshed_at
  FROM public.user_progress_stats_mv
  WHERE user_progress_stats_mv.user_id = (select auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.get_my_economy_stats()
RETURNS TABLE (
  user_id UUID,
  coins INTEGER,
  tokens INTEGER,
  total_earned_coins INTEGER,
  total_earned_tokens INTEGER,
  total_spent_coins INTEGER,
  total_spent_tokens INTEGER,
  refreshed_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    user_economy_stats_mv.user_id,
    user_economy_stats_mv.coins,
    user_economy_stats_mv.tokens,
    user_economy_stats_mv.total_earned_coins,
    user_economy_stats_mv.total_earned_tokens,
    user_economy_stats_mv.total_spent_coins,
    user_economy_stats_mv.total_spent_tokens,
    user_economy_stats_mv.refreshed_at
  FROM public.user_economy_stats_mv
  WHERE user_economy_stats_mv.user_id = (select auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_my_progress_stats() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_my_economy_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_progress_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_economy_stats() TO authenticated;

CREATE OR REPLACE FUNCTION public.refresh_user_stats_materialized_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_progress_stats_mv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_economy_stats_mv;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_user_stats_materialized_views() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_user_stats_materialized_views() TO service_role;

-- ---------------------------------------------------------------------------
-- Production RLS/release safety gate
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.production_rls_release_gate()
RETURNS TABLE (
  check_name TEXT,
  object_name TEXT,
  status TEXT,
  detail TEXT
)
LANGUAGE SQL
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT
    'public_table_rls_enabled'::text AS check_name,
    format('%I.%I', n.nspname, c.relname)::text AS object_name,
    CASE WHEN c.relrowsecurity THEN 'pass' ELSE 'fail' END AS status,
    CASE WHEN c.relrowsecurity THEN 'RLS enabled' ELSE 'Public schema table without RLS' END AS detail
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind IN ('r', 'p')
    AND c.relname NOT LIKE 'pg_%'

  UNION ALL

  SELECT
    'anon_table_privileges_revoked'::text,
    format('%I.%I', table_schema, table_name)::text,
    CASE WHEN count(*) = 0 THEN 'pass' ELSE 'fail' END,
    CASE WHEN count(*) = 0 THEN 'anon has no direct table grants' ELSE string_agg(privilege_type, ', ' ORDER BY privilege_type) END
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public'
    AND grantee = 'anon'
  GROUP BY table_schema, table_name

  UNION ALL

  SELECT
    'definer_function_not_public'::text,
    p.oid::regprocedure::text,
    CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE') THEN 'fail' ELSE 'pass' END,
    CASE WHEN has_function_privilege('anon', p.oid, 'EXECUTE') THEN 'SECURITY DEFINER executable by anon' ELSE 'definer execute restricted' END
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.prosecdef;
$$;

REVOKE ALL ON FUNCTION public.production_rls_release_gate() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.production_rls_release_gate() TO service_role;

COMMENT ON TABLE public.schema_column_contracts IS 'Machine-readable DB column contracts for security, validation, and performance review.';
COMMENT ON TABLE public.idempotency_keys IS 'Shared idempotency registry for RPCs and async writes.';
COMMENT ON TABLE public.ai_memory_vectors IS 'User-owned pgvector memory for AI personalization.';
COMMENT ON TABLE public.session_events IS 'Append-only event-sourced session ledger.';
COMMENT ON MATERIALIZED VIEW public.user_progress_stats_mv IS 'Fast aggregate progress stats; refresh with refresh_user_stats_materialized_views.';
COMMENT ON MATERIALIZED VIEW public.user_economy_stats_mv IS 'Fast aggregate economy stats; refresh with refresh_user_stats_materialized_views.';
COMMENT ON FUNCTION public.production_rls_release_gate() IS 'Service-role CI gate returning fail rows when public DB security regressions exist.';
